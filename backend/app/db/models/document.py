from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    __table_args__ = (
        Index(
            "idx_documents_company",
            "company_id",
        ),
        Index(
            "idx_documents_year",
            "fiscal_year",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    company_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "companies.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    document_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    fiscal_year: Mapped[int | None] = mapped_column(
        Integer
    )

    title: Mapped[str | None] = mapped_column(
        Text
    )

    source: Mapped[str | None] = mapped_column(
        String(100)
    )

    source_url: Mapped[str | None] = mapped_column(
        Text
    )

    file_path: Mapped[str | None] = mapped_column(
        Text
    )

    file_hash: Mapped[str | None] = mapped_column(
        String(128)
    )

    mime_type: Mapped[str | None] = mapped_column(
        String(100)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    company = relationship(
        "Company",
        back_populates="documents",
    )