from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.db.models.company import Company
from app.db.models.financial import (
    FinancialMetric,
    FinancialStatement,
    FinancialValue,
)

router = APIRouter(
    prefix="/api",
    tags=["financials"],
)


@router.get("/companies/{ico}/financials")
def get_company_financials(
    ico: str,
    year: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    company = (
        db.execute(
            select(Company)
            .where(Company.ico == ico)
        )
        .scalar_one_or_none()
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    query = (
        select(FinancialStatement)
        .options(
            joinedload(FinancialStatement.values)
            .joinedload(FinancialValue.metric)
        )
        .where(
            FinancialStatement.company_id == company.id
        )
    )

    if year is not None:
        query = query.where(
            FinancialStatement.fiscal_year == year
        )

    statements = (
        db.execute(
            query.order_by(
                FinancialStatement.fiscal_year.desc()
            )
        )
        .unique()
        .scalars()
        .all()
    )

    return {
        "company": {
            "id": company.id,
            "ico": company.ico,
            "name": company.name,
        },
        "statements": [
            {
                "id": statement.id,
                "year": statement.fiscal_year,
                "statement_type": statement.statement_type,
                "currency": statement.currency,
                "source_document_id": statement.source_document_id,
                "metrics": [
                    {
                        "id": value.metric.id,
                        "code": value.metric.code,
                        "name": value.metric.name,
                        "category": value.metric.category,
                        "unit": value.metric.unit,
                        "value": value.value,
                    }
                    for value in statement.values
                ],
            }
            for statement in statements
        ],
    }


@router.get("/companies/{ico}/financials/{year}")
def get_company_financials_year(
    ico: str,
    year: int,
    db: Session = Depends(get_db),
):
    company = (
        db.execute(
            select(Company)
            .where(Company.ico == ico)
        )
        .scalar_one_or_none()
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    statement = (
        db.execute(
            select(FinancialStatement)
            .options(
                joinedload(FinancialStatement.values)
                .joinedload(FinancialValue.metric)
            )
            .where(
                FinancialStatement.company_id == company.id,
                FinancialStatement.fiscal_year == year,
            )
        )
        .unique()
        .scalar_one_or_none()
    )

    if statement is None:
        raise HTTPException(
            status_code=404,
            detail="Financial statement not found",
        )

    return {
        "company": {
            "id": company.id,
            "ico": company.ico,
            "name": company.name,
        },
        "statement": {
            "id": statement.id,
            "year": statement.fiscal_year,
            "statement_type": statement.statement_type,
            "currency": statement.currency,
            "source_document_id": statement.source_document_id,
            "metrics": [
                {
                    "id": value.metric.id,
                    "code": value.metric.code,
                    "name": value.metric.name,
                    "category": value.metric.category,
                    "unit": value.metric.unit,
                    "value": value.value,
                }
                for value in statement.values
            ],
        },
    }


@router.get("/financial-statements")
def get_financial_statements(
    company_id: int | None = None,
    year: int | None = None,
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = select(FinancialStatement)

    if company_id is not None:
        query = query.where(
            FinancialStatement.company_id == company_id
        )

    if year is not None:
        query = query.where(
            FinancialStatement.fiscal_year == year
        )

    statements = (
        db.execute(
            query
            .order_by(FinancialStatement.id)
            .offset(offset)
            .limit(limit)
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": statement.id,
            "company_id": statement.company_id,
            "fiscal_year": statement.fiscal_year,
            "statement_type": statement.statement_type,
            "currency": statement.currency,
            "source_document_id": statement.source_document_id,
            "source_id": statement.source_id,
        }
        for statement in statements
    ]