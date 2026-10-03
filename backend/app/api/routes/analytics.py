from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db.database import get_db
from app.db.models.company import (
    Company,
    CompanySizeClassification,
)
from app.db.models.financial import (
    FinancialStatement,
    FinancialValue,
)
from app.db.models.reference import (
    CompanySize,
    LegalForm,
    Sector,
)
from app.schemas.analytics import CompanyAnalyticsResponse
from app.services.financial_analysis import (
    build_growth_analysis,
    build_ratio_analysis,
    calculate_growth,
)


router = APIRouter(
    prefix="/api",
    tags=["Analytics"],
)


# =========================================================
# COMPANY ANALYTICS
# =========================================================


@router.get(
    "/companies/{ico}/analytics",
    response_model=CompanyAnalyticsResponse,
)
def get_company_analytics(
    ico: str,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Company
    # -----------------------------------------------------

    company = db.execute(
        select(Company)
        .where(Company.ico == ico)
    ).scalar_one_or_none()

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    # -----------------------------------------------------
    # Financial statements
    # -----------------------------------------------------

    statements = (
        db.execute(
            select(FinancialStatement)
            .options(
                selectinload(FinancialStatement.values)
                .selectinload(FinancialValue.metric)
            )
            .where(
                FinancialStatement.company_id == company.id
            )
            .order_by(
                FinancialStatement.fiscal_year.desc()
            )
        )
        .scalars()
        .all()
    )

    if not statements:
        raise HTTPException(
            status_code=404,
            detail="Financial data not found",
        )

    # -----------------------------------------------------
    # Convert SQLAlchemy objects
    # -----------------------------------------------------

    statement_data = []

    for statement in statements:
        metrics = []

        for value in statement.values:
            metrics.append(
                {
                    "code": value.metric.code,
                    "name": value.metric.name,
                    "category": value.metric.category,
                    "unit": value.metric.unit,
                    "value": (
                        float(value.value)
                        if value.value is not None
                        else None
                    ),
                }
            )

        statement_data.append(
            {
                "year": statement.fiscal_year,
                "statement_type": statement.statement_type,
                "currency": statement.currency,
                "metrics": metrics,
            }
        )

    # -----------------------------------------------------
    # Current / previous year
    # -----------------------------------------------------

    years = sorted(
        {
            statement["year"]
            for statement in statement_data
        },
        reverse=True,
    )

    current_year = years[0]

    previous_year = (
        years[1]
        if len(years) > 1
        else None
    )

    statements_by_year = {
        statement["year"]: statement
        for statement in statement_data
    }

    current_statement = statements_by_year[current_year]

    current_metrics = {
        metric["code"]: metric["value"]
        for metric in current_statement["metrics"]
    }

    if previous_year is not None:
        previous_statement = statements_by_year[previous_year]

        previous_metrics = {
            metric["code"]: metric["value"]
            for metric in previous_statement["metrics"]
        }
    else:
        previous_metrics = {}

    # -----------------------------------------------------
    # Growth
    # -----------------------------------------------------

    growth = build_growth_analysis(
        current=current_metrics,
        previous=previous_metrics,
    )

    # -----------------------------------------------------
    # Ratios
    # -----------------------------------------------------

    ratios = build_ratio_analysis(
        metrics=current_metrics,
    )

    # -----------------------------------------------------
    # Financial metrics table
    # -----------------------------------------------------

    current_metric_lookup = {
        metric["code"]: metric
        for metric in current_statement["metrics"]
    }

    previous_metric_lookup = {}

    if previous_year is not None:
        previous_metric_lookup = {
            metric["code"]: metric
            for metric in previous_statement["metrics"]
        }

    all_metric_codes = sorted(
        set(current_metric_lookup)
        | set(previous_metric_lookup)
    )

    metrics = []

    for code in all_metric_codes:
        current_metric = current_metric_lookup.get(code)
        previous_metric = previous_metric_lookup.get(code)

        current_value = (
            current_metric["value"]
            if current_metric
            else None
        )

        previous_value = (
            previous_metric["value"]
            if previous_metric
            else None
        )

        reference_metric = (
            current_metric
            or previous_metric
        )

        metrics.append(
            {
                "code": code,
                "name": reference_metric["name"],
                "category": reference_metric["category"],
                "unit": reference_metric["unit"],
                "current": current_value,
                "previous": previous_value,
                "change": calculate_growth(
                    current_value,
                    previous_value,
                ),
            }
        )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "company": {
            "id": company.id,
            "ico": company.ico,
            "name": company.name,
        },
        "period": {
            "current": current_year,
            "previous": previous_year,
        },
        "growth": growth,
        "ratios": ratios,
        "metrics": metrics,
    }


# =========================================================
# MARKET ANALYTICS
# =========================================================


@router.get("/analytics/overview")
def analytics_overview(
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Companies
    # -----------------------------------------------------

    total_companies = (
        db.scalar(
            select(func.count(Company.id))
        )
        or 0
    )

    companies_with_sector = (
        db.scalar(
            select(func.count(Company.id))
            .where(Company.sector_id.is_not(None))
        )
        or 0
    )

    # -----------------------------------------------------
    # Sectors
    # -----------------------------------------------------

    sector_rows = db.execute(
        select(
            Sector.code,
            Sector.name,
            func.count(Company.id).label(
                "company_count"
            ),
        )
        .outerjoin(
            Company,
            Company.sector_id == Sector.id,
        )
        .group_by(
            Sector.id,
            Sector.code,
            Sector.name,
        )
        .order_by(
            func.count(Company.id).desc()
        )
    ).all()

    sectors = [
        {
            "code": row.code,
            "name": row.name,
            "companies": row.company_count,
            "percentage": (
                round(
                    (
                        row.company_count
                        / total_companies
                    )
                    * 100,
                    1,
                )
                if total_companies
                else 0
            ),
        }
        for row in sector_rows
    ]

    # -----------------------------------------------------
    # Company sizes
    # -----------------------------------------------------

    size_rows = db.execute(
        select(
            CompanySize.code,
            CompanySize.name,
            func.count(
                CompanySizeClassification.company_id
            ).label("company_count"),
        )
        .outerjoin(
            CompanySizeClassification,
            CompanySizeClassification.size_id
            == CompanySize.id,
        )
        .group_by(
            CompanySize.id,
            CompanySize.code,
            CompanySize.name,
        )
        .order_by(
            func.count(
                CompanySizeClassification.company_id
            ).desc()
        )
    ).all()

    sizes = [
        {
            "code": row.code,
            "name": row.name,
            "companies": row.company_count,
            "percentage": (
                round(
                    (
                        row.company_count
                        / total_companies
                    )
                    * 100,
                    1,
                )
                if total_companies
                else 0
            ),
        }
        for row in size_rows
    ]

    # -----------------------------------------------------
    # Legal forms
    # -----------------------------------------------------

    legal_form_rows = db.execute(
        select(
            LegalForm.code,
            LegalForm.name,
            LegalForm.short_name,
            func.count(Company.id).label(
                "company_count"
            ),
        )
        .outerjoin(
            Company,
            Company.legal_form_id
            == LegalForm.id,
        )
        .group_by(
            LegalForm.id,
            LegalForm.code,
            LegalForm.name,
            LegalForm.short_name,
        )
        .order_by(
            func.count(Company.id).desc()
        )
        .limit(10)
    ).all()

    legal_forms = [
        {
            "code": row.code,
            "name": row.name,
            "short_name": row.short_name,
            "companies": row.company_count,
        }
        for row in legal_form_rows
    ]

    # -----------------------------------------------------
    # Financial statements
    # -----------------------------------------------------

    statement_count = (
        db.scalar(
            select(
                func.count(
                    FinancialStatement.id
                )
            )
        )
        or 0
    )

    companies_with_financials = (
        db.scalar(
            select(
                func.count(
                    func.distinct(
                        FinancialStatement.company_id
                    )
                )
            )
        )
        or 0
    )

    latest_year = db.scalar(
        select(
            func.max(
                FinancialStatement.fiscal_year
            )
        )
    )

    # -----------------------------------------------------
    # Financial coverage
    # -----------------------------------------------------

    financial_coverage = (
        round(
            (
                companies_with_financials
                / total_companies
            )
            * 100,
            1,
        )
        if total_companies
        else 0
    )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "overview": {
            "companies": total_companies,
            "companies_with_sector": companies_with_sector,
            "sectors": len(sectors),
            "financial_statements": statement_count,
            "companies_with_financials": companies_with_financials,
            "financial_coverage": financial_coverage,
            "latest_year": latest_year,
        },
        "sectors": sectors,
        "sizes": sizes,
        "legal_forms": legal_forms,
    }