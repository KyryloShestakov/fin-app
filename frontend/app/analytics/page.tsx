import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import { getAnalyticsOverview } from "@/lib/server-api";

export default async function AnalyticsPage() {
    const data = await getAnalyticsOverview();
    const overview = data.overview;

    return (
        <div className="app-shell">
            <Sidebar />

            <div className="main-area">
                <Header />

                <main className="dashboard">
                    <div className="analytics-page">
                        <section className="analytics-heading">
                            <div>
                                <div className="panel-eyebrow">
                                    MARKET ANALYTICS
                                </div>

                                <h2>Company landscape</h2>

                                <p>
                                    Explore the structure and financial coverage
                                    of the Czech company dataset.
                                </p>
                            </div>

                            <div className="analytics-period">
                                <span className="analytics-period-label">
                                    Latest financial year
                                </span>

                                <strong>
                                    {overview.latest_year ?? "—"}
                                </strong>
                            </div>
                        </section>

                        <section className="analytics-kpis">
                            <div className="analytics-kpi">
                                <div className="analytics-kpi-label">
                                    Companies
                                </div>

                                <div className="analytics-kpi-value">
                                    {overview.companies.toLocaleString("cs-CZ")}
                                </div>

                                <div className="analytics-kpi-description">
                                    Companies in current dataset
                                </div>
                            </div>

                            <div className="analytics-kpi">
                                <div className="analytics-kpi-label">
                                    Sectors
                                </div>

                                <div className="analytics-kpi-value">
                                    {data.sectors.length}
                                </div>

                                <div className="analytics-kpi-description">
                                    NACE-based sectors
                                </div>
                            </div>

                            <div className="analytics-kpi">
                                <div className="analytics-kpi-label">
                                    Financial statements
                                </div>

                                <div className="analytics-kpi-value">
                                    {overview.financial_statements.toLocaleString(
                                        "cs-CZ",
                                    )}
                                </div>

                                <div className="analytics-kpi-description">
                                    Statements available
                                </div>
                            </div>

                            <div className="analytics-kpi">
                                <div className="analytics-kpi-label">
                                    Financial coverage
                                </div>

                                <div className="analytics-kpi-value">
                                    {overview.financial_coverage}%
                                </div>

                                <div className="analytics-kpi-description">
                                    Companies with financial data
                                </div>
                            </div>
                        </section>

                        <section className="analytics-main-grid">
                            <div className="panel analytics-panel">
                                <div className="analytics-panel-header">
                                    <div>
                                        <div className="panel-eyebrow">
                                            STRUCTURE
                                        </div>

                                        <h3>Companies by sector</h3>
                                    </div>

                                    <span className="analytics-panel-count">
                                        {overview.companies.toLocaleString(
                                            "cs-CZ",
                                        )}
                                    </span>
                                </div>

                                <div className="sector-analytics-list">
                                    {data.sectors.slice(0, 10).map((sector) => (
                                        <div
                                            className="sector-analytics-row"
                                            key={sector.code}
                                        >
                                            <div className="sector-analytics-info">
                                                <div className="sector-analytics-code">
                                                    {sector.code}
                                                </div>

                                                <div className="sector-analytics-name">
                                                    {sector.name}
                                                </div>
                                            </div>

                                            <div className="sector-analytics-bar-wrapper">
                                                <div className="sector-analytics-bar">
                                                    <div
                                                        className="sector-analytics-bar-fill"
                                                        style={{
                                                            width: `${Math.min(
                                                                sector.percentage,
                                                                100,
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="sector-analytics-value">
                                                <strong>
                                                    {sector.companies.toLocaleString(
                                                        "cs-CZ",
                                                    )}
                                                </strong>

                                                <span>
                                                    {sector.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="panel analytics-panel">
                                <div className="analytics-panel-header">
                                    <div>
                                        <div className="panel-eyebrow">
                                            COMPANY SIZE
                                        </div>

                                        <h3>Size distribution</h3>
                                    </div>
                                </div>

                                <div className="size-analytics-list">
                                    {data.sizes.map((size) => (
                                        <div
                                            className="size-analytics-row"
                                            key={size.code}
                                        >
                                            <div className="size-analytics-heading">
                                                <span>
                                                    {size.name || size.code}
                                                </span>

                                                <strong>
                                                    {size.companies.toLocaleString(
                                                        "cs-CZ",
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="size-analytics-bar">
                                                <div
                                                    className="size-analytics-fill"
                                                    style={{
                                                        width: `${Math.min(
                                                            size.percentage,
                                                            100,
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="size-analytics-percentage">
                                                {size.percentage}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="analytics-secondary-grid">
                            <div className="panel analytics-panel">
                                <div className="analytics-panel-header">
                                    <div>
                                        <div className="panel-eyebrow">
                                            FINANCIAL DATA
                                        </div>

                                        <h3>Data coverage</h3>
                                    </div>
                                </div>

                                <div className="coverage-analytics">
                                    <div className="coverage-analytics-number">
                                        {overview.companies_with_financials.toLocaleString(
                                            "cs-CZ",
                                        )}
                                    </div>

                                    <div className="coverage-analytics-label">
                                        companies with financial statements
                                    </div>

                                    <div className="coverage-analytics-progress">
                                        <div
                                            className="coverage-analytics-fill"
                                            style={{
                                                width: `${overview.financial_coverage}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="coverage-analytics-footer">
                                        <span>Financial coverage</span>

                                        <strong>
                                            {overview.financial_coverage}%
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="panel analytics-panel">
                                <div className="analytics-panel-header">
                                    <div>
                                        <div className="panel-eyebrow">
                                            LEGAL STRUCTURE
                                        </div>

                                        <h3>Top legal forms</h3>
                                    </div>
                                </div>

                                <div className="legal-form-list">
                                    {data.legal_forms
                                        .slice(0, 6)
                                        .map((form) => (
                                            <div
                                                className="legal-form-row"
                                                key={form.code}
                                            >
                                                <div>
                                                    <strong>
                                                        {form.short_name ||
                                                            form.name ||
                                                            `Form ${form.code}`}
                                                    </strong>

                                                    <span>
                                                        Code {form.code}
                                                    </span>
                                                </div>

                                                <strong>
                                                    {form.companies.toLocaleString(
                                                        "cs-CZ",
                                                    )}
                                                </strong>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </section>

                        <section className="analytics-footer-panel">
                            <div>
                                <div className="panel-eyebrow">
                                    DATASET
                                </div>

                                <h3>Connected to live company data</h3>

                                <p>
                                    Analytics are calculated from the current
                                    PostgreSQL dataset and are not static
                                    dashboard values.
                                </p>
                            </div>

                            <div className="analytics-footer-status">
                                <span className="status-dot" />

                                API connected
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}