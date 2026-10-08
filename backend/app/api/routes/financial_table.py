from __future__ import annotations

from collections import defaultdict
from decimal import Decimal
from statistics import median
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import and_, exists, func, or_, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.company import Company, CompanyAddress
from app.db.models.financial import FinancialMetric, FinancialStatement, FinancialValue
from app.db.models.reference import Sector
from app.services.financial_analysis import (
    build_ratio_analysis,
    calculate_growth,
    calculate_revenue,
)

router = APIRouter(prefix='/api/analytics', tags=['Analytics'])


class MetricFilter(BaseModel):
    code: str
    operator: Literal['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between', 'is_null', 'is_not_null']
    value: Decimal | None = None
    value_to: Decimal | None = None


class TableRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: Literal[50] = 50
    year: int | None = None
    search: str = Field(default='', max_length=150)
    sort_by: str = 'name'
    sort_dir: Literal['asc', 'desc'] = 'asc'
    filters: list[MetricFilter] = Field(default_factory=list, max_length=30)


class InsightRequest(BaseModel):
    company_ids: list[int] = Field(min_length=1, max_length=4)
    year: int | None = None


def metric_exists(year: int, metric_id: int, condition=None):
    q = (
        select(FinancialValue.id)
        .join(FinancialStatement, FinancialStatement.id == FinancialValue.statement_id)
        .where(
            FinancialStatement.company_id == Company.id,
            FinancialStatement.fiscal_year == year,
            FinancialValue.metric_id == metric_id,
        )
    )
    if condition is not None:
        q = q.where(condition)
    return exists(q)


@router.get('/financial-table/metadata')
def financial_table_metadata(db: Session = Depends(get_db)):
    metrics = db.execute(select(FinancialMetric).order_by(FinancialMetric.category, FinancialMetric.name)).scalars().all()
    years = db.execute(select(FinancialStatement.fiscal_year).distinct().order_by(FinancialStatement.fiscal_year.desc())).scalars().all()
    return {'years': years, 'metrics': [{'code': m.code, 'name': m.name, 'category': m.category, 'unit': m.unit} for m in metrics]}


@router.post('/financial-table')
def financial_table(request: TableRequest, db: Session = Depends(get_db)):
    year = request.year
    if year is None:
        year = db.scalar(select(func.max(FinancialStatement.fiscal_year)))
    if year is None:
        return {'page': request.page, 'page_size': 50, 'total': 0, 'total_pages': 0, 'year': None, 'rows': []}

    codes = {f.code for f in request.filters}
    if request.sort_by not in ('name', 'ico'):
        codes.add(request.sort_by)
    metrics = {m.code: m for m in db.execute(select(FinancialMetric).where(FinancialMetric.code.in_(codes))).scalars()}
    missing = codes - metrics.keys()
    if missing:
        raise HTTPException(400, f'Unknown metrics: {sorted(missing)}')

    conditions = []
    if request.search.strip():
        pattern = f'%{request.search.strip()}%'
        conditions.append(or_(Company.name.ilike(pattern), Company.ico.ilike(pattern)))

    for f in request.filters:
        mid = metrics[f.code].id
        if f.operator in ('is_null', 'is_not_null'):
            present = metric_exists(year, mid, FinancialValue.value.is_not(None))
            conditions.append(~present if f.operator == 'is_null' else present)
            continue
        if f.value is None or (f.operator == 'between' and f.value_to is None):
            raise HTTPException(400, f'Missing value for {f.code}')
        v = FinancialValue.value
        op = {'eq': lambda: v == f.value, 'ne': lambda: v != f.value,
              'gt': lambda: v > f.value, 'gte': lambda: v >= f.value,
              'lt': lambda: v < f.value, 'lte': lambda: v <= f.value,
              'between': lambda: v.between(f.value, f.value_to)}[f.operator]()
        conditions.append(metric_exists(year, mid, op))

    base = select(Company.id).where(*conditions)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0

    municipality = select(CompanyAddress.municipality).where(
        CompanyAddress.company_id == Company.id,
        CompanyAddress.address_type == 'registered',
    ).limit(1).scalar_subquery()
    if request.sort_by in ('name', 'ico'):
        sort_expr = getattr(Company, request.sort_by)
        ordered = select(Company.id, Company.ico, Company.name, Sector.code.label('sector_code'), Sector.name.label('sector_name'), municipality.label('municipality')).outerjoin(Sector, Sector.id == Company.sector_id).where(*conditions).order_by(
            sort_expr.desc() if request.sort_dir == 'desc' else sort_expr.asc(), Company.id.asc()
        )
    else:
        # One value per company: deterministic aggregate when multiple statement types exist.
        sort_metric = metrics[request.sort_by]
        sort_values = (
            select(FinancialStatement.company_id.label('company_id'), func.max(FinancialValue.value).label('sort_value'))
            .join(FinancialValue, FinancialValue.statement_id == FinancialStatement.id)
            .where(FinancialStatement.fiscal_year == year, FinancialValue.metric_id == sort_metric.id)
            .group_by(FinancialStatement.company_id).subquery()
        )
        order = sort_values.c.sort_value.desc().nulls_last() if request.sort_dir == 'desc' else sort_values.c.sort_value.asc().nulls_last()
        ordered = select(Company.id, Company.ico, Company.name, Sector.code.label('sector_code'), Sector.name.label('sector_name'), municipality.label('municipality')).outerjoin(Sector, Sector.id == Company.sector_id).outerjoin(sort_values, sort_values.c.company_id == Company.id).where(*conditions).order_by(order, Company.id.asc())

    company_rows = db.execute(ordered.offset((request.page - 1) * 50).limit(50)).all()
    company_ids = [r.id for r in company_rows]
    values_by_company = {cid: {} for cid in company_ids}
    if company_ids:
        values = db.execute(
            select(FinancialStatement.company_id, FinancialMetric.code, func.max(FinancialValue.value))
            .join(FinancialValue, FinancialValue.statement_id == FinancialStatement.id)
            .join(FinancialMetric, FinancialMetric.id == FinancialValue.metric_id)
            .where(FinancialStatement.fiscal_year == year, FinancialStatement.company_id.in_(company_ids))
            .group_by(FinancialStatement.company_id, FinancialMetric.code)
        ).all()
        for cid, code, value in values:
            values_by_company[cid][code] = str(value) if value is not None else None

    return {'page': request.page, 'page_size': 50, 'total': total, 'total_pages': (total + 49) // 50,
            'year': year, 'rows': [{'company_id': r.id, 'ico': r.ico, 'name': r.name,
                                    'sector': {'code': r.sector_code, 'name': r.sector_name} if r.sector_code else None,
                                    'municipality': r.municipality,
                                    'values': values_by_company[r.id]} for r in company_rows]}


def _metric_rows(db: Session, year: int, company_ids: list[int]):
    """Return one deterministic value per metric for each company."""
    rows = db.execute(
        select(FinancialStatement.company_id, FinancialMetric.code, func.max(FinancialValue.value))
        .join(FinancialValue, FinancialValue.statement_id == FinancialStatement.id)
        .join(FinancialMetric, FinancialMetric.id == FinancialValue.metric_id)
        .where(FinancialStatement.fiscal_year == year, FinancialStatement.company_id.in_(company_ids))
        .group_by(FinancialStatement.company_id, FinancialMetric.code)
    ).all()
    result: dict[int, dict[str, float | None]] = defaultdict(dict)
    for company_id, code, value in rows:
        result[company_id][code] = float(value) if value is not None else None
    return result


def _health(metrics: dict[str, float | None], previous: dict[str, float | None]):
    ratios = build_ratio_analysis(metrics)
    revenue_growth = calculate_growth(calculate_revenue(metrics), calculate_revenue(previous))
    checks = []
    margin = ratios['profit_margin']
    if margin is not None:
        checks.append(('Profitability', 25 if margin >= .10 else 15 if margin >= 0 else 0, 25, margin * 100))
    debt = ratios['debt_to_assets']
    if debt is not None:
        checks.append(('Debt load', 25 if debt <= .50 else 15 if debt <= .75 else 5, 25, debt * 100))
    liquidity = ratios['current_ratio']
    if liquidity is not None:
        checks.append(('Liquidity', 25 if liquidity >= 1.5 else 15 if liquidity >= 1 else 5, 25, liquidity))
    if revenue_growth is not None:
        checks.append(('Revenue trend', 25 if revenue_growth > 0 else 12 if revenue_growth >= -10 else 0, 25, revenue_growth))
    maximum = sum(item[2] for item in checks)
    score = round(sum(item[1] for item in checks) / maximum * 100) if maximum else None
    return score, ratios, revenue_growth, checks


@router.post('/financial-table/insights')
def financial_table_insights(request: InsightRequest, db: Session = Depends(get_db)):
    """Score selected companies and compare their ratios with the full sector."""
    year = request.year or db.scalar(select(func.max(FinancialStatement.fiscal_year)))
    if year is None:
        return {'year': None, 'companies': []}
    companies = db.execute(
        select(Company.id, Company.ico, Company.name, Sector.id.label('sector_id'), Sector.code.label('sector_code'), Sector.name.label('sector_name'))
        .outerjoin(Sector, Sector.id == Company.sector_id)
        .where(Company.id.in_(request.company_ids))
    ).all()
    company_ids = [company.id for company in companies]
    current = _metric_rows(db, year, company_ids)
    previous = _metric_rows(db, year - 1, company_ids)
    sector_ids = [company.sector_id for company in companies if company.sector_id is not None]
    sector_company_ids = []
    company_sector_ids: dict[int, int | None] = {}
    if sector_ids:
        sector_members = db.execute(select(Company.id, Company.sector_id).where(Company.sector_id.in_(sector_ids))).all()
        sector_company_ids = [company_id for company_id, _ in sector_members]
        company_sector_ids = {company_id: sector_id for company_id, sector_id in sector_members}
    sector_current = _metric_rows(db, year, sector_company_ids)
    benchmarks: dict[int, dict[str, float | None]] = {}
    for sector_id in set(sector_ids):
        sample = []
        for company_id in sector_company_ids:
            if company_sector_ids.get(company_id) == sector_id:
                values = sector_current.get(company_id, {})
                ratios = build_ratio_analysis(values)
                sample.append({'revenue': calculate_revenue(values), 'profit_margin': ratios['profit_margin'], 'debt_to_assets': ratios['debt_to_assets'], 'current_ratio': ratios['current_ratio']})
        benchmarks[sector_id] = {
            key: (float(median([row[key] for row in sample if row[key] is not None])) if any(row[key] is not None for row in sample) else None)
            for key in ('revenue', 'profit_margin', 'debt_to_assets', 'current_ratio')
        }
        benchmarks[sector_id]['sample_size'] = len(sample)
    response = []
    for company in companies:
        metrics = current.get(company.id, {})
        score, ratios, revenue_growth, checks = _health(metrics, previous.get(company.id, {}))
        benchmark = benchmarks.get(company.sector_id)
        response.append({
            'company_id': company.id, 'ico': company.ico, 'name': company.name,
            'sector': {'code': company.sector_code, 'name': company.sector_name} if company.sector_code else None,
            'health_score': score,
            'health_checks': [{'label': label, 'score': score, 'maximum': maximum, 'value': value} for label, score, maximum, value in checks],
            'metrics': {'revenue': calculate_revenue(metrics), 'revenue_growth': revenue_growth, **ratios},
            'sector_benchmark': benchmark,
        })
    return {'year': year, 'companies': response}
