from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.db.database import get_db
from app.db.models.company import (
    Company,
    CompanyNace,
    CompanySizeClassification,
)
from app.schemas.company import (
    CompanyDetailResponse,
    CompanyListResponse,
)


router = APIRouter(
    prefix="/api/companies",
    tags=["companies"],
)


@router.get(
    "",
    response_model=dict,
)
def get_companies(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    search: str | None = Query(default=None),
    sector: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Get companies with pagination and basic filters.
    """

    query = select(Company)

    if search:
        search_pattern = f"%{search}%"

        query = query.where(
            (Company.name.ilike(search_pattern))
            | (Company.ico.ilike(search_pattern))
        )

    if sector:
        query = query.join(Company.sector).where(
            Company.sector.has(code=sector)
        )

    count_query = select(func.count()).select_from(query.subquery())

    total = db.execute(count_query).scalar_one()

    companies = (
        db.execute(
            query
            .options(
                joinedload(Company.sector),
                joinedload(Company.legal_form),
            )
            .order_by(Company.id)
            .offset(offset)
            .limit(limit)
        )
        .scalars()
        .all()
    )

    items = [
        CompanyListResponse(
            id=company.id,
            ico=company.ico,
            name=company.name,
            sector=company.sector,
            legal_form=company.legal_form,
        )
        for company in companies
    ]

    return {
        "items": items,
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
        },
    }


@router.get(
    "/{ico}",
    response_model=CompanyDetailResponse,
)
def get_company(
    ico: str,
    db: Session = Depends(get_db),
):
    """
    Get complete basic company profile by IČO.
    """

    company = (
        db.execute(
            select(Company)
            .options(
                joinedload(Company.sector),
                joinedload(Company.legal_form),

                selectinload(Company.addresses),

                selectinload(
                    Company.nace_codes
                ).joinedload(
                    CompanyNace.nace
                ),

                selectinload(
                    Company.size_classifications
                ).joinedload(
                    CompanySizeClassification.size
                ),
            )
            .where(Company.ico == ico)
        )
        .unique()
        .scalar_one_or_none()
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    return CompanyDetailResponse(
        id=company.id,
        ico=company.ico,
        name=company.name,
        ciss2010=company.ciss2010,
        iczuj=company.iczuj,
        sector=company.sector,
        legal_form=company.legal_form,
        addresses=[
            {
                "id": address.id,
                "type": address.address_type,
                "text": address.text_address,
                "psc": address.psc,
                "municipality": address.municipality,
                "district_part": address.district_part,
                "street": address.street,
                "house_type": address.house_type,
                "house_number": address.house_number,
                "orientation_number": address.orientation_number,
                "okres_lau": address.okres_lau,
            }
            for address in company.addresses
        ],
        nace=[
            {
                "code": item.nace.code,
                "version": item.nace.version,
                "name": item.nace.name,
                "is_primary": item.is_primary,
            }
            for item in company.nace_codes
        ],
        size_classifications=[
            {
                "fiscal_year": item.fiscal_year,
                "code": item.size.code,
                "name": item.size.name,
            }
            for item in company.size_classifications
        ],
    )

@router.get("/{ico}/addresses")
def get_company_addresses(
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

    return [
        {
            "id": address.id,
            "type": address.address_type,
            "text": address.text_address,
            "psc": address.psc,
            "municipality": address.municipality,
            "district_part": address.district_part,
            "street": address.street,
            "house_type": address.house_type,
            "house_number": address.house_number,
            "orientation_number": address.orientation_number,
            "okres_lau": address.okres_lau,
        }
        for address in company.addresses
    ]


@router.get("/{ico}/nace")
def get_company_nace(
    ico: str,
    db: Session = Depends(get_db),
):
    company = (
        db.execute(
            select(Company)
            .options(
                selectinload(
                    Company.nace_codes
                ).joinedload(
                    CompanyNace.nace
                )
            )
            .where(Company.ico == ico)
        )
        .unique()
        .scalar_one_or_none()
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    return [
        {
            "id": item.nace.id,
            "code": item.nace.code,
            "version": item.nace.version,
            "name": item.nace.name,
            "is_primary": item.is_primary,
            "valid_from": item.valid_from,
            "valid_to": item.valid_to,
        }
        for item in company.nace_codes
    ]