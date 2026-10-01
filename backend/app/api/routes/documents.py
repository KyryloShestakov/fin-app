from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.company import Company
from app.db.models.document import Document

router = APIRouter(
    prefix="/api",
    tags=["documents"],
)


@router.get("/companies/{ico}/documents")
def get_company_documents(
    ico: str,
    year: int | None = Query(default=None),
    document_type: str | None = Query(default=None),
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

    query = select(Document).where(
        Document.company_id == company.id
    )

    if year is not None:
        query = query.where(
            Document.fiscal_year == year
        )

    if document_type:
        query = query.where(
            Document.document_type == document_type
        )

    documents = (
        db.execute(
            query.order_by(Document.fiscal_year.desc())
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": document.id,
            "company_id": document.company_id,
            "document_type": document.document_type,
            "fiscal_year": document.fiscal_year,
            "title": document.title,
            "source": document.source,
            "source_url": document.source_url,
            "file_path": document.file_path,
            "file_hash": document.file_hash,
            "mime_type": document.mime_type,
        }
        for document in documents
    ]


@router.get("/documents")
def get_documents(
    company_id: int | None = None,
    year: int | None = None,
    document_type: str | None = None,
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = select(Document)

    if company_id is not None:
        query = query.where(
            Document.company_id == company_id
        )

    if year is not None:
        query = query.where(
            Document.fiscal_year == year
        )

    if document_type:
        query = query.where(
            Document.document_type == document_type
        )

    documents = (
        db.execute(
            query
            .order_by(Document.id)
            .offset(offset)
            .limit(limit)
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": document.id,
            "company_id": document.company_id,
            "document_type": document.document_type,
            "fiscal_year": document.fiscal_year,
            "title": document.title,
            "source": document.source,
            "source_url": document.source_url,
            "file_path": document.file_path,
            "file_hash": document.file_hash,
            "mime_type": document.mime_type,
        }
        for document in documents
    ]