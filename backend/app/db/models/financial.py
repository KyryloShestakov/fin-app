from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class FinancialMetric(Base):
    __tablename__ = "financial_metrics"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    category: Mapped[str | None] = mapped_column(
        String(50)
    )

    unit: Mapped[str | None] = mapped_column(
        String(30)
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    values = relationship(
        "FinancialValue",
        back_populates="metric",
    )


class FinancialStatement(Base):
    __tablename__ = "financial_statements"

    __table_args__ = (
        UniqueConstraint(
            "company_id",
            "fiscal_year",
            "statement_type",
            name="financial_statements_company_id_fiscal_year_statement_type_key",
        ),
        Index(
            "idx_financial_statements_company",
            "company_id",
        ),
        Index(
            "idx_financial_statements_year",
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

    fiscal_year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    statement_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    source_document_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(
            "documents.id",
            ondelete="SET NULL",
        ),
    )

    source_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("data_sources.id"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    company = relationship(
        "Company",
        back_populates="financial_statements",
    )

    values = relationship(
        "FinancialValue",
        back_populates="statement",
    )

    source = relationship("DataSource")

    source_document = relationship(
        "Document",
        foreign_keys=[source_document_id],
    )


class FinancialValue(Base):
    __tablename__ = "financial_values"

    __table_args__ = (
        UniqueConstraint(
            "statement_id",
            "metric_id",
            name="financial_values_statement_id_metric_id_key",
        ),
        Index(
            "idx_financial_values_statement",
            "statement_id",
        ),
        Index(
            "idx_financial_values_metric",
            "metric_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    statement_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "financial_statements.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    metric_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("financial_metrics.id"),
        nullable=False,
    )

    value: Mapped[float | None] = mapped_column(
        Numeric(30, 2)
    )

    source_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("data_sources.id"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    statement = relationship(
        "FinancialStatement",
        back_populates="values",
    )

    metric = relationship(
        "FinancialMetric",
        back_populates="values",
    )

    source = relationship("DataSource")