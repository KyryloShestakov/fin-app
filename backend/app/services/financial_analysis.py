from __future__ import annotations

from typing import Any


def calculate_growth(
    current: float | None,
    previous: float | None,
) -> float | None:
    """
    Calculate year-over-year growth in percent.

    Example:
        previous = 100
        current = 120
        result = 20.0
    """
    if current is None or previous is None:
        return None

    if previous == 0:
        return None

    return ((current - previous) / abs(previous)) * 100


def calculate_current_ratio(
    current_assets: float | None,
    current_liabilities: float | None,
) -> float | None:
    if current_assets is None or current_liabilities in (None, 0):
        return None

    return current_assets / current_liabilities


def calculate_debt_to_assets(
    liabilities: float | None,
    assets: float | None,
) -> float | None:
    if liabilities is None or assets in (None, 0):
        return None

    return liabilities / assets


def calculate_profit_margin(
    profit: float | None,
    revenue: float | None,
) -> float | None:
    if profit is None or revenue in (None, 0):
        return None

    return profit / revenue


def calculate_asset_turnover(
    revenue: float | None,
    assets: float | None,
) -> float | None:
    if revenue is None or assets in (None, 0):
        return None

    return revenue / assets


def calculate_receivables_to_assets(
    receivables: float | None,
    assets: float | None,
) -> float | None:
    if receivables is None or assets in (None, 0):
        return None

    return receivables / assets


def calculate_cash_to_assets(
    cash: float | None,
    assets: float | None,
) -> float | None:
    if cash is None or assets in (None, 0):
        return None

    return cash / assets


def calculate_roa(
    profit: float | None,
    assets: float | None,
) -> float | None:
    if profit is None or assets in (None, 0):
        return None

    return profit / assets


def calculate_roa_percent(
    profit: float | None,
    assets: float | None,
) -> float | None:
    roa = calculate_roa(profit, assets)

    if roa is None:
        return None

    return roa * 100


def calculate_roe(
    profit: float | None,
    assets: float | None,
    liabilities: float | None,
) -> float | None:
    if (
        profit is None
        or assets is None
        or liabilities is None
    ):
        return None

    equity = assets - liabilities

    if equity == 0:
        return None

    return profit / equity
def calculate_revenue(
    metrics: dict[str, float | None],
) -> float | None:
    """
    Revenue is calculated from:

        revenue_products_services
        +
        revenue_goods

    If both values are unavailable, net_turnover is used
    as a fallback.
    """
    products = metrics.get("revenue_products_services")
    goods = metrics.get("revenue_goods")

    if products is not None or goods is not None:
        return (products or 0) + (goods or 0)

    return metrics.get("net_turnover")


def build_growth_analysis(
    current: dict[str, float | None],
    previous: dict[str, float | None],
) -> dict[str, float | None]:
    current_revenue = calculate_revenue(current)
    previous_revenue = calculate_revenue(previous)

    return {
        "revenue": calculate_growth(
            current_revenue,
            previous_revenue,
        ),
        "assets": calculate_growth(
            current.get("assets"),
            previous.get("assets"),
        ),
        "profit": calculate_growth(
            current.get("net_profit"),
            previous.get("net_profit"),
        ),
        "receivables": calculate_growth(
            current.get("receivables"),
            previous.get("receivables"),
        ),
        "inventory": calculate_growth(
            current.get("inventory"),
            previous.get("inventory"),
        ),
        "cash": calculate_growth(
            current.get("cash"),
            previous.get("cash"),
        ),
    }


def build_ratio_analysis(
    metrics: dict[str, float | None],
) -> dict[str, float | None]:
    revenue = calculate_revenue(metrics)

    return {
        "current_ratio": calculate_current_ratio(
            metrics.get("current_assets"),
            metrics.get("current_liabilities"),
        ),
        "debt_to_assets": calculate_debt_to_assets(
            metrics.get("liabilities"),
            metrics.get("assets"),
        ),
        "profit_margin": calculate_profit_margin(
            metrics.get("net_profit"),
            revenue,
        ),
        "asset_turnover": calculate_asset_turnover(
            revenue,
            metrics.get("assets"),
        ),
        "receivables_to_assets": calculate_receivables_to_assets(
            metrics.get("receivables"),
            metrics.get("assets"),
        ),
        "cash_to_assets": calculate_cash_to_assets(
            metrics.get("cash"),
            metrics.get("assets"),
        ),
        "roa": calculate_roa_percent(
            metrics.get("net_profit"),
            metrics.get("assets"),
        ),
        "roe": (
            calculate_roe(
                metrics.get("net_profit"),
                metrics.get("assets"),
                metrics.get("liabilities"),
            )
            * 100
            if calculate_roe(
                metrics.get("net_profit"),
                metrics.get("assets"),
                metrics.get("liabilities"),
            )
            is not None
            else None
        ),
    }


def build_metric_map(
    statements: list[dict[str, Any]],
) -> dict[int, dict[str, float | None]]:
    """
    Convert financial statements into:

        {
            2023: {
                "assets": 100,
                "net_profit": 10,
                ...
            },
            2024: {
                ...
            }
        }
    """
    result: dict[int, dict[str, float | None]] = {}

    for statement in statements:
        year = statement["year"]

        metrics: dict[str, float | None] = {}

        for metric in statement.get("metrics", []):
            metrics[metric["code"]] = metric.get("value")

        result[year] = metrics

    return result