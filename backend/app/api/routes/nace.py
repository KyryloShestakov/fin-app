from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.reference import NaceCode

router = APIRouter(
    prefix="/api/nace",
    tags=["nace"],
)


@router.get("")
def get_nace_codes(
    version: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = select(NaceCode)

    if version:
        query = query.where(
            NaceCode.version == version
        )

    if search:
        pattern = f"%{search}%"

        query = query.where(
            NaceCode.code.ilike(pattern)
            | NaceCode.name.ilike(pattern)
        )

    nace_codes = (
        db.execute(
            query.order_by(NaceCode.code)
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": nace.id,
            "code": nace.code,
            "version": nace.version,
            "name": nace.name,
        }
        for nace in nace_codes
    ]