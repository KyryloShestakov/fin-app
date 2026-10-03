from __future__ import annotations

from pydantic import BaseModel


class CompanyAnalyticsPeriod(BaseModel):
    current: int
    previous: int | None


class CompanyAnalyticsGrowth(BaseModel):
    revenue: float | None
    assets: float | None
    profit: float | None
    receivables: float | None
    inventory: float | None
    cash: float | None


class CompanyAnalyticsRatios(BaseModel):
    current_ratio: float | None
    debt_to_assets: float | None
    profit_margin: float | None
    asset_turnover: float | None
    receivables_to_assets: float | None
    cash_to_assets: float | None
    roa: float | None
    roe: float | None


class CompanyAnalyticsMetric(BaseModel):
    code: str
    name: str
    category: str | None
    unit: str | None
    current: float | None
    previous: float | None
    change: float | None


class CompanyAnalyticsResponse(BaseModel):
    company: dict
    period: CompanyAnalyticsPeriod
    growth: CompanyAnalyticsGrowth
    ratios: CompanyAnalyticsRatios
    metrics: list[CompanyAnalyticsMetric]