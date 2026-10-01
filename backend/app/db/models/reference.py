from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Sector(Base):
    __tablename__ = "sectors"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


class CompanySize(Base):
    __tablename__ = "company_sizes"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    min_assets: Mapped[float | None] = mapped_column(
        Numeric(20, 2)
    )

    max_assets: Mapped[float | None] = mapped_column(
        Numeric(20, 2)
    )

    min_turnover: Mapped[float | None] = mapped_column(
        Numeric(20, 2)
    )

    max_turnover: Mapped[float | None] = mapped_column(
        Numeric(20, 2)
    )


class LegalForm(Base):
    __tablename__ = "legal_forms"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    code: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=True,
    )

    name: Mapped[str | None] = mapped_column(Text)

    short_name: Mapped[str | None] = mapped_column(Text)


class NaceCode(Base):
    __tablename__ = "nace_codes"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    version: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    name: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        UniqueConstraint(
            "code",
            "version",
            name="nace_codes_code_version_key",
        ),
    )


class DataSource(Base):
    __tablename__ = "data_sources"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    source_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    url: Mapped[str | None] = mapped_column(Text)

    description: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )