from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.reference import Sector

router = APIRouter(
    prefix="/api/sectors",
    tags=["sectors"],
)


@router.get("")
def get_sectors(
    db: Session = Depends(get_db),
):
    sectors = (
        db.execute(
            select(Sector)
            .order_by(Sector.code)
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": sector.id,
            "code": sector.code,
            "name": sector.name,
        }
        for sector in sectors
    ]