import type { CompanyAnalytics } from "@/types/analytics";

type FinancialTableProps = {
    analytics: CompanyAnalytics;
};

function formatValue(value: number | null) {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return value.toLocaleString("cs-CZ", {
        maximumFractionDigits: 0,
    });
}

function formatChange(value: number | null) {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    const prefix = value > 0 ? "+" : "";

    return `${prefix}${value.toFixed(1)}%`;
}

export default function FinancialTable({
                                           analytics,
                                       }: FinancialTableProps) {
    const currentYear = analytics.period.current;
    const previousYear = analytics.period.previous;

    const metrics = analytics.metrics.filter(
        (metric) =>
            metric.category === "balance_sheet" ||
            metric.category === "income_statement",
    );

    return (
        <section className="panel financial-table-panel">
            <div className="panel-header">
                <div>
                    <div className="panel-eyebrow">
                        FINANCIAL STATEMENT
                    </div>

                    <h3>Reported financial data</h3>
                </div>

                <div className="financial-table-currency">
                    CZK
                </div>
            </div>

            <div className="financial-table-wrapper">
                <table className="financial-table">
                    <thead>
                    <tr>
                        <th>Metric</th>

                        {previousYear && (
                            <th>{previousYear}</th>
                        )}

                        <th>{currentYear}</th>

                        <th>Change</th>
                    </tr>
                    </thead>

                    <tbody>
                    {metrics.map((metric) => (
                        <tr key={metric.code}>
                            <td>
                                <div className="financial-metric-name">
                                    {metric.name}
                                </div>

                                <div className="financial-metric-code">
                                    {metric.code}
                                </div>
                            </td>

                            {previousYear && (
                                <td>
                                    {formatValue(metric.previous)}
                                </td>
                            )}

                            <td>
                                {formatValue(metric.current)}
                            </td>

                            <td>
                  <span
                      className={
                          metric.change === null
                              ? "financial-change"
                              : metric.change > 0
                                  ? "financial-change positive"
                                  : metric.change < 0
                                      ? "financial-change negative"
                                      : "financial-change"
                      }
                  >
                    {formatChange(metric.change)}
                  </span>
                            </td>
                        </tr>
                    ))}

                    {metrics.length === 0 && (
                        <tr>
                            <td
                                colSpan={4}
                                className="financial-table-empty"
                            >
                                No financial metrics available.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}