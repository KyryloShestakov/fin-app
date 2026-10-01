from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Company(Base):
    __tablename__ = "companies"

    __table_args__ = (
        Index("idx_companies_name", "name"),
        Index("idx_companies_sector", "sector_id"),
        Index("idx_companies_legal_form", "legal_form_id"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    ico: Mapped[str] = mapped_column(
        String(8),
        nullable=False,
        unique=True,
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    sector_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("sectors.id"),
    )

    legal_form_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("legal_forms.id"),
    )

    ciss2010: Mapped[int | None] = mapped_column(Integer)

    iczuj: Mapped[int | None] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    sector = relationship("Sector")

    legal_form = relationship("LegalForm")

    addresses = relationship(
        "CompanyAddress",
        back_populates="company",
    )

    nace_codes = relationship(
        "CompanyNace",
        back_populates="company",
    )

    size_classifications = relationship(
        "CompanySizeClassification",
        back_populates="company",
    )

    registry_data = relationship(
        "CompanyRegistryData",
        back_populates="company",
    )

    financial_statements = relationship(
        "FinancialStatement",
        back_populates="company",
    )

    documents = relationship(
        "Document",
        back_populates="company",
    )


class CompanyAddress(Base):
    __tablename__ = "company_addresses"

    __table_args__ = (
        Index(
            "idx_company_addresses_company",
            "company_id",
        ),
        Index(
            "idx_company_addresses_municipality",
            "municipality",
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

    address_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="registered",
    )

    kodadm: Mapped[int | None] = mapped_column(Integer)

    text_address: Mapped[str | None] = mapped_column(Text)

    psc: Mapped[str | None] = mapped_column(
        String(10)
    )

    municipality: Mapped[str | None] = mapped_column(
        Text
    )

    district_part: Mapped[str | None] = mapped_column(
        Text
    )

    street: Mapped[str | None] = mapped_column(
        Text
    )

    house_type: Mapped[str | None] = mapped_column(
        String(20)
    )

    house_number: Mapped[str | None] = mapped_column(
        String(50)
    )

    orientation_number: Mapped[str | None] = mapped_column(
        String(50)
    )

    okres_lau: Mapped[str | None] = mapped_column(
        String(20)
    )

    valid_from: Mapped[date | None] = mapped_column(
        Date
    )

    valid_to: Mapped[date | None] = mapped_column(
        Date
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    company = relationship(
        "Company",
        back_populates="addresses",
    )


class CompanyNace(Base):
    __tablename__ = "company_nace"

    __table_args__ = (
        UniqueConstraint(
            "company_id",
            "nace_id",
            name="company_nace_company_id_nace_id_key",
        ),
        Index(
            "idx_company_nace_company",
            "company_id",
        ),
        Index(
            "idx_company_nace_nace",
            "nace_id",
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

    nace_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("nace_codes.id"),
        nullable=False,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    valid_from: Mapped[date | None] = mapped_column(
        Date
    )

    valid_to: Mapped[date | None] = mapped_column(
        Date
    )

    company = relationship(
        "Company",
        back_populates="nace_codes",
    )

    nace = relationship("NaceCode")


class CompanySizeClassification(Base):
    __tablename__ = "company_size_classifications"

    __table_args__ = (
        UniqueConstraint(
            "company_id",
            "fiscal_year",
            name="company_size_classifications_company_id_fiscal_year_key",
        ),
        Index(
            "idx_company_size_company",
            "company_id",
        ),
        Index(
            "idx_company_size_year",
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

    size_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("company_sizes.id"),
        nullable=False,
    )

    source_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("data_sources.id"),
    )

    company = relationship(
        "Company",
        back_populates="size_classifications",
    )

    size = relationship("CompanySize")

    source = relationship("DataSource")


class CompanyRegistryData(Base):
    __tablename__ = "company_registry_data"

    __table_args__ = (
        Index(
            "idx_registry_company",
            "company_id",
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

    ddatvzn: Mapped[date | None] = mapped_column(
        Date
    )

    ddatzan: Mapped[date | None] = mapped_column(
        Date
    )

    zpzan: Mapped[date | None] = mapped_column(
        Date
    )

    ddatpakt: Mapped[date | None] = mapped_column(
        Date
    )

    datplat: Mapped[date | None] = mapped_column(
        Date
    )

    priznak: Mapped[str | None] = mapped_column(
        Text
    )

    valid_from: Mapped[date | None] = mapped_column(
        Date
    )

    valid_to: Mapped[date | None] = mapped_column(
        Date
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
        back_populates="registry_data",
    )

    source = relationship("DataSource")