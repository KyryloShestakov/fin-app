from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.reference import CompanySize

router = APIRouter(
    prefix="/api/company-sizes",
    tags=["company-sizes"],
)


@router.get("")
def get_company_sizes(
    db: Session = Depends(get_db),
):
    sizes = (
        db.execute(
            select(CompanySize)
            .order_by(CompanySize.id)
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": size.id,
            "code": size.code,
            "name": size.name,
            "min_assets": size.min_assets,
            "max_assets": size.max_assets,
            "min_turnover": size.min_turnover,
            "max_turnover": size.max_turnover,
        }
        for size in sizes
    ]