import type { CompanyAnalytics } from "@/types/analytics";

type CompanyKpisProps = {
    analytics: CompanyAnalytics;
};

function formatValue(
    value: number | null,
    suffix = "",
) {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return `${value.toLocaleString("cs-CZ", {
        maximumFractionDigits: 1,
    })}${suffix}`;
}

function formatChange(value: number | null) {
    if (value === null || !Number.isFinite(value)) {
        return "No comparison";
    }

    const prefix = value > 0 ? "+" : "";

    return `${prefix}${value.toFixed(1)}% vs previous year`;
}

export default function CompanyKpis({
                                        analytics,
                                    }: CompanyKpisProps) {
    const currentYear = analytics.period.current;

    const assets = analytics.metrics.find(
        (metric) => metric.code === "assets",
    );

    const revenue = analytics.metrics.find(
        (metric) => metric.code === "net_turnover",
    );

    const profit = analytics.metrics.find(
        (metric) => metric.code === "net_profit",
    );

    return (
        <section className="company-kpis">
            <div className="company-kpi">
                <div className="company-kpi-label">
                    Assets
                </div>

                <div className="company-kpi-value">
                    {formatValue(assets?.current ?? null)}
                </div>

                <div className="company-kpi-footer">
                    {formatChange(assets?.change ?? null)}
                </div>

                <div className="company-kpi-year">
                    FY {currentYear}
                </div>
            </div>

            <div className="company-kpi">
                <div className="company-kpi-label">
                    Revenue
                </div>

                <div className="company-kpi-value">
                    {formatValue(revenue?.current ?? null)}
                </div>

                <div className="company-kpi-footer">
                    {formatChange(revenue?.change ?? null)}
                </div>

                <div className="company-kpi-year">
                    FY {currentYear}
                </div>
            </div>

            <div className="company-kpi">
                <div className="company-kpi-label">
                    Net profit
                </div>

                <div className="company-kpi-value">
                    {formatValue(profit?.current ?? null)}
                </div>

                <div className="company-kpi-footer">
                    {formatChange(profit?.change ?? null)}
                </div>

                <div className="company-kpi-year">
                    FY {currentYear}
                </div>
            </div>

            <div className="company-kpi">
                <div className="company-kpi-label">
                    Profit margin
                </div>

                <div className="company-kpi-value">
                    {formatValue(
                        analytics.ratios.profit_margin,
                        "%",
                    )}
                </div>

                <div className="company-kpi-footer">
                    Current period
                </div>

                <div className="company-kpi-year">
                    FY {currentYear}
                </div>
            </div>
        </section>
    );
}