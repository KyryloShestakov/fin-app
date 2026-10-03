"use client";

import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { CompanyAnalytics } from "@/types/analytics";
import React from "react";

type FinancialChartProps = {
    analytics: CompanyAnalytics;
};

type ChartMetric =
    | "assets"
    | "revenue"
    | "profit"
    | "liabilities"
    | "receivables"
    | "cash";

const chartOptions: {
    key: ChartMetric;
    label: string;
    code: string;
}[] = [
    {
        key: "revenue",
        label: "Revenue",
        code: "net_turnover",
    },
    {
        key: "assets",
        label: "Assets",
        code: "assets",
    },
    {
        key: "profit",
        label: "Net profit",
        code: "net_profit",
    },
    {
        key: "liabilities",
        label: "Liabilities",
        code: "liabilities",
    },
    {
        key: "receivables",
        label: "Receivables",
        code: "receivables",
    },
    {
        key: "cash",
        label: "Cash",
        code: "cash",
    },
];

function formatAmount(value: number | null) {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return value.toLocaleString("cs-CZ", {
        maximumFractionDigits: 0,
    });
}

function formatAxisValue(value: number) {
    if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }

    if (Math.abs(value) >= 1_000) {
        return `${(value / 1_000).toFixed(0)}k`;
    }

    return String(value);
}

function getMetricValue(
    analytics: CompanyAnalytics,
    year: number,
    code: string,
) {
    const metric = analytics.metrics.find(
        (item) => item.code === code,
    );

    if (!metric) {
        return null;
    }

    if (year === analytics.period.current) {
        return metric.current;
    }

    if (year === analytics.period.previous) {
        return metric.previous;
    }

    return null;
}

export default function FinancialChart({
                                           analytics,
                                       }: FinancialChartProps) {
    const [selectedMetric, setSelectedMetric] =
        React.useState<ChartMetric>("revenue");

    const selectedOption = chartOptions.find(
        (option) => option.key === selectedMetric,
    );

    const years = [
        analytics.period.previous,
        analytics.period.current,
    ].filter(
        (year): year is number => year !== null,
    );

    const data = years.map((year) => ({
        year: String(year),
        value: getMetricValue(
            analytics,
            year,
            selectedOption?.code ?? "net_turnover",
        ),
    }));

    return (
        <section className="panel financial-chart-panel">
            <div className="financial-chart-header">
                <div>
                    <div className="panel-eyebrow">
                        FINANCIAL DEVELOPMENT
                    </div>

                    <h3>Financial performance</h3>

                    <p className="financial-chart-description">
                        Annual development based on reported financial
                        statements.
                    </p>
                </div>

                <div className="financial-chart-controls">
                    {chartOptions.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            className={`financial-chart-button ${
                                selectedMetric === option.key
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedMetric(option.key)
                            }
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="financial-chart">
                {data.length > 0 ? (
                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >
                        <LineChart
                            data={data}
                            margin={{
                                top: 15,
                                right: 20,
                                left: 5,
                                bottom: 5,
                            }}
                        >
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 12,
                                }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 11,
                                }}
                                tickFormatter={formatAxisValue}
                                width={55}
                            />

                            <Tooltip
                                formatter={(value) => [
                                    formatAmount(
                                        typeof value === "number"
                                            ? value
                                            : Number(value),
                                    ),
                                    selectedOption?.label ?? "",
                                ]}
                                labelFormatter={(label) =>
                                    `FY ${label}`
                                }
                            />

                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#17191d"
                                strokeWidth={2.5}
                                dot={{
                                    r: 4,
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="financial-chart-empty">
                        No financial data available.
                    </div>
                )}
            </div>
        </section>
    );
}