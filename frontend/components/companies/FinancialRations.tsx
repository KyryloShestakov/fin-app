import type { CompanyAnalytics } from "@/types/analytics";

type FinancialRatiosProps = {
    analytics: CompanyAnalytics;
};

type RatioDefinition = {
    key: keyof CompanyAnalytics["ratios"];
    label: string;
    description: string;
    suffix: string;
    percentage: boolean;
};

const ratioDefinitions: RatioDefinition[] = [
    {
        key: "current_ratio",
        label: "Current ratio",
        description: "Current assets / current liabilities",
        suffix: "x",
        percentage: false,
    },
    {
        key: "debt_to_assets",
        label: "Debt / assets",
        description: "Total liabilities relative to assets",
        suffix: "%",
        percentage: true,
    },
    {
        key: "profit_margin",
        label: "Profit margin",
        description: "Net profit relative to revenue",
        suffix: "%",
        percentage: true,
    },
    {
        key: "asset_turnover",
        label: "Asset turnover",
        description: "Revenue generated per unit of assets",
        suffix: "x",
        percentage: false,
    },
    {
        key: "receivables_to_assets",
        label: "Receivables / assets",
        description: "Receivables relative to total assets",
        suffix: "%",
        percentage: true,
    },
    {
        key: "cash_to_assets",
        label: "Cash / assets",
        description: "Cash relative to total assets",
        suffix: "%",
        percentage: true,
    },
    {
        key: "roa",
        label: "ROA",
        description: "Return on assets",
        suffix: "%",
        percentage: true,
    },
    {
        key: "roe",
        label: "ROE",
        description: "Return on equity",
        suffix: "%",
        percentage: true,
    },
];

function formatRatio(
    value: number | null,
    percentage: boolean,
) {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    const actualValue = percentage
        ? value * 100
        : value;

    return actualValue.toLocaleString("en-US", {
        maximumFractionDigits: 2,
    });
}

export default function FinancialRatios({
                                            analytics,
                                        }: FinancialRatiosProps) {
    return (
        <section className="panel financial-ratios-panel">
            <div className="panel-header">
                <div>
                    <div className="panel-eyebrow">
                        FINANCIAL ANALYSIS
                    </div>

                    <h3>Key financial ratios</h3>
                </div>

                <div className="financial-ratios-year">
                    FY {analytics.period.current}
                </div>
            </div>

            <div className="financial-ratios-grid">
                {ratioDefinitions.map((ratio) => {
                    const value =
                        analytics.ratios[ratio.key];

                    return (
                        <div
                            key={ratio.key}
                            className="financial-ratio-card"
                        >
                            <div className="financial-ratio-label">
                                {ratio.label}
                            </div>

                            <div className="financial-ratio-value">
                                {formatRatio(
                                    value,
                                    ratio.percentage,
                                )}

                                {value !== null && (
                                    <span>{ratio.suffix}</span>
                                )}
                            </div>

                            <div className="financial-ratio-description">
                                {ratio.description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}