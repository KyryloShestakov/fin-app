from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.financial import FinancialMetric

router = APIRouter(
    prefix="/api/financial-metrics",
    tags=["financial-metrics"],
)


@router.get("")
def get_financial_metrics(
    db: Session = Depends(get_db),
):
    metrics = (
        db.execute(
            select(FinancialMetric)
            .order_by(FinancialMetric.category, FinancialMetric.code)
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": metric.id,
            "code": metric.code,
            "name": metric.name,
            "category": metric.category,
            "unit": metric.unit,
            "description": metric.description,
        }
        for metric in metrics
    ]