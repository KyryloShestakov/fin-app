from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.reference import LegalForm

router = APIRouter(
    prefix="/api/legal-forms",
    tags=["legal-forms"],
)


@router.get("")
def get_legal_forms(
    db: Session = Depends(get_db),
):
    forms = (
        db.execute(
            select(LegalForm)
            .order_by(LegalForm.code)
        )
        .scalars()
        .all()
    )

    return [
        {
            "id": form.id,
            "code": form.code,
            "name": form.name,
            "short_name": form.short_name,
        }
        for form in forms
    ]