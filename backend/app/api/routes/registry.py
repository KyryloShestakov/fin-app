from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.company import Company, CompanyRegistryData

router = APIRouter(
    prefix="/api",
    tags=["registry"],
)


@router.get("/companies/{ico}/registry")
def get_company_registry(
    ico: str,
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

    records = (
        db.execute(
            select(CompanyRegistryData)
            .where(
                CompanyRegistryData.company_id == company.id
            )
            .order_by(CompanyRegistryData.id.desc())
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": record.id,
            "ddatvzn": record.ddatvzn,
            "ddatzan": record.ddatzan,
            "zpzan": record.zpzan,
            "ddatpakt": record.ddatpakt,
            "datplat": record.datplat,
            "priznak": record.priznak,
            "valid_from": record.valid_from,
            "valid_to": record.valid_to,
            "source_id": record.source_id,
        }
        for record in records
    ]


@router.get("/registry")
def get_registry_records(
    company_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = select(CompanyRegistryData)

    if company_id is not None:
        query = query.where(
            CompanyRegistryData.company_id == company_id
        )

    records = (
        db.execute(
            query.order_by(CompanyRegistryData.id)
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": record.id,
            "company_id": record.company_id,
            "ddatvzn": record.ddatvzn,
            "ddatzan": record.ddatzan,
            "zpzan": record.zpzan,
            "ddatpakt": record.ddatpakt,
            "datplat": record.datplat,
            "priznak": record.priznak,
            "valid_from": record.valid_from,
            "valid_to": record.valid_to,
            "source_id": record.source_id,
        }
        for record in records
    ]