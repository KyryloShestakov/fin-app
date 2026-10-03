from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.db.database import get_db
from app.db.models.company import (
    Company,
    CompanyNace,
    CompanySizeClassification,
)
from app.db.models.reference import LegalForm, NaceCode
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
    limit: int = Query(
        default=50,
        ge=1,
        le=500,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),

    search: str | None = Query(
        default=None,
        description="Search by company name or IČO",
    ),

    sector: str | None = Query(
        default=None,
        description="NACE sector code, e.g. C, G, L",
    ),

    size: str | None = Query(
        default=None,
        description="Company size code",
    ),

    legal_form: int | None = Query(
        default=None,
        description="Legal form code",
    ),

    nace: str | None = Query(
        default=None,
        description="NACE code",
    ),

    year: int | None = Query(
        default=None,
        description="Fiscal year for company size classification",
    ),

    sort: str = Query(
        default="id",
        description="Sort field",
    ),

    order: str = Query(
        default="asc",
        description="asc or desc",
    ),

    db: Session = Depends(get_db),
):
    """
    Get companies with search, filtering, sorting and pagination.
    """

    query = select(Company)

    # ---------------------------------------------------------
    # SEARCH
    # ---------------------------------------------------------

    if search:
        search_pattern = f"%{search.strip()}%"

        query = query.where(
            (Company.name.ilike(search_pattern))
            | (Company.ico.ilike(search_pattern))
        )

    # ---------------------------------------------------------
    # SECTOR
    # ---------------------------------------------------------

    if sector:
        query = query.where(
            Company.sector.has(
                code=sector
            )
        )

    # ---------------------------------------------------------
    # LEGAL FORM
    # ---------------------------------------------------------

    if legal_form is not None:
        query = query.where(
            Company.legal_form_id == legal_form
        )

    # ---------------------------------------------------------
    # COMPANY SIZE
    # ---------------------------------------------------------

    if size:
        size_subquery = (
            select(CompanySizeClassification.id)
            .join(
                CompanySizeClassification.size
            )
            .where(
                CompanySizeClassification.company_id
                == Company.id,

                CompanySizeClassification.size.has(
                    code=size
                ),
            )
        )

        if year is not None:
            size_subquery = size_subquery.where(
                CompanySizeClassification.fiscal_year
                == year
            )

        query = query.where(
            size_subquery.exists()
        )

    # ---------------------------------------------------------
    # NACE
    # ---------------------------------------------------------

    if nace:
        nace_subquery = (
            select(CompanyNace.id)
            .join(
                CompanyNace.nace
            )
            .where(
                CompanyNace.company_id == Company.id,

                NaceCode.code == nace,
            )
        )

        query = query.where(
            nace_subquery.exists()
        )

    # ---------------------------------------------------------
    # COUNT
    # ---------------------------------------------------------

    count_query = select(
        func.count()
    ).select_from(
        query.subquery()
    )

    total = db.execute(
        count_query
    ).scalar_one()

    # ---------------------------------------------------------
    # SORTING
    # ---------------------------------------------------------

    sort_fields = {
        "id": Company.id,
        "name": Company.name,
        "ico": Company.ico,
    }

    sort_column = sort_fields.get(
        sort,
        Company.id,
    )

    if order.lower() == "desc":
        sort_column = sort_column.desc()
    else:
        sort_column = sort_column.asc()

    # ---------------------------------------------------------
    # DATA
    # ---------------------------------------------------------

    companies = (
        db.execute(
            query
            .options(
                joinedload(Company.sector),
                joinedload(Company.legal_form),
            )
            .order_by(sort_column)
            .offset(offset)
            .limit(limit)
        )
        .scalars()
        .all()
    )

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

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
        "filters": {
            "search": search,
            "sector": sector,
            "size": size,
            "legal_form": legal_form,
            "nace": nace,
            "year": year,
            "sort": sort,
            "order": order,
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

                selectinload(
                    Company.addresses
                ),

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
            .where(
                Company.ico == ico
            )
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