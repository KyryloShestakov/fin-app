import Link from "next/link";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/dashboard/StatCard";

export default function DashboardPage() {
    return (
        <div className="app-shell">
            <Sidebar />

            <div className="main-area">
                <Header />
                <main className="dashboard dashboard-home">
                    {/* Hero */}

                    <section className="hero">
                        <div className="hero-content">
                            <div className="eyebrow">
                                FINANCIAL INTELLIGENCE PLATFORM
                            </div>

                            <h2>
                                Understand Czech companies
                                <br />
                                through their data.
                            </h2>

                            <p>
                                Explore company profiles, financial statements,
                                registry data and analytical indicators in one
                                structured platform.
                            </p>

                            <div className="hero-actions">
                                <Link
                                    href="/companies"
                                    className="primary-button"
                                >
                                    Explore companies
                                    <span>→</span>
                                </Link>

                                <Link
                                    href="/analytics"
                                    className="secondary-button"
                                >
                                    View analytics
                                </Link>
                            </div>
                        </div>

                        <div className="hero-meta">
                            <div className="hero-meta-label">
                                DATABASE STATUS
                            </div>

                            <div className="hero-meta-status">
                                <span className="status-dot" />
                                Connected
                            </div>

                            <div className="hero-meta-text">
                                Supabase PostgreSQL
                            </div>
                        </div>
                    </section>

                    {/* Dataset statistics */}

                    <section className="stats-grid">
                        <StatCard
                            label="Companies"
                            value="5,469"
                            description="Companies currently available"
                        />

                        <StatCard
                            label="Sectors"
                            value="18"
                            description="Economic sectors represented"
                        />

                        <StatCard
                            label="Latest year"
                            value="2024"
                            description="Latest financial reporting year"
                        />

                        <StatCard
                            label="Data sources"
                            value="3+"
                            description="Registry and financial sources"
                        />
                    </section>

                    {/* Main overview */}

                    <section className="dashboard-grid dashboard-overview-grid">
                        <div className="panel intelligence-panel">
                            <div className="panel-header">
                                <div>
                                    <div className="panel-eyebrow">
                                        PLATFORM OVERVIEW
                                    </div>

                                    <h3>
                                        Company intelligence
                                    </h3>
                                </div>

                                <span className="panel-badge">
                                    2024
                                </span>
                            </div>

                            <div className="intelligence-grid">
                                <div className="intelligence-item">
                                    <div className="intelligence-number">
                                        5,469
                                    </div>

                                    <div className="intelligence-label">
                                        Companies
                                    </div>

                                    <p>
                                        Searchable company profiles with
                                        registry and classification data.
                                    </p>

                                    <Link href="/companies">
                                        Explore companies →
                                    </Link>
                                </div>

                                <div className="intelligence-item">
                                    <div className="intelligence-number">
                                        2024
                                    </div>

                                    <div className="intelligence-label">
                                        Financial statements
                                    </div>

                                    <p>
                                        Structured financial metrics extracted
                                        from company statements.
                                    </p>

                                    <Link href="/companies">
                                        Explore financials →
                                    </Link>
                                </div>

                                <div className="intelligence-item">
                                    <div className="intelligence-number">
                                        18
                                    </div>

                                    <div className="intelligence-label">
                                        Economic sectors
                                    </div>

                                    <p>
                                        Companies classified by their economic
                                        activity.
                                    </p>

                                    <Link href="/analytics">
                                        View analytics →
                                    </Link>
                                </div>

                                <div className="intelligence-item">
                                    <div className="intelligence-number">
                                        3+
                                    </div>

                                    <div className="intelligence-label">
                                        Data sources
                                    </div>

                                    <p>
                                        Registry, financial and document
                                        information combined in one model.
                                    </p>

                                    <Link href="/companies">
                                        Browse data →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="panel coverage-panel">
                            <div className="panel-header">
                                <div>
                                    <div className="panel-eyebrow">
                                        DATA COVERAGE
                                    </div>

                                    <h3>
                                        Available intelligence
                                    </h3>
                                </div>
                            </div>

                            <div className="coverage-list">
                                <div className="coverage-row">
                                    <div className="coverage-icon">
                                        C
                                    </div>

                                    <div className="coverage-content">
                                        <strong>
                                            Company registry
                                        </strong>

                                        <span>
                                            Identity, legal form, addresses
                                            and classification
                                        </span>
                                    </div>

                                    <span className="coverage-status">
                                        Available
                                    </span>
                                </div>

                                <div className="coverage-row">
                                    <div className="coverage-icon">
                                        €
                                    </div>

                                    <div className="coverage-content">
                                        <strong>
                                            Financial statements
                                        </strong>

                                        <span>
                                            Balance sheet and income statement
                                            metrics
                                        </span>
                                    </div>

                                    <span className="coverage-status">
                                        Available
                                    </span>
                                </div>

                                <div className="coverage-row">
                                    <div className="coverage-icon">
                                        ↗
                                    </div>

                                    <div className="coverage-content">
                                        <strong>
                                            Financial analysis
                                        </strong>

                                        <span>
                                            Growth, liquidity, leverage and
                                            profitability ratios
                                        </span>
                                    </div>

                                    <span className="coverage-status">
                                        Available
                                    </span>
                                </div>

                                <div className="coverage-row">
                                    <div className="coverage-icon">
                                        □
                                    </div>

                                    <div className="coverage-content">
                                        <strong>
                                            Documents
                                        </strong>

                                        <span>
                                            Source documents connected to
                                            company records
                                        </span>
                                    </div>

                                    <span className="coverage-status">
                                        Available
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Explore */}

                    <section className="quick-section">
                        <div className="quick-section-header">
                            <div>
                                <div className="panel-eyebrow">
                                    EXPLORE DATA
                                </div>

                                <h3>
                                    Start your analysis
                                </h3>

                                <p>
                                    Move from the company database to detailed
                                    financial and analytical views.
                                </p>
                            </div>
                        </div>

                        <div className="quick-grid">
                            <Link
                                href="/companies"
                                className="quick-card"
                            >
                                <span className="quick-icon">
                                    ◫
                                </span>

                                <strong>
                                    Company Explorer
                                </strong>

                                <span>
                                    Search, filter and inspect companies
                                    across the database.
                                </span>

                                <b>
                                    Open explorer →
                                </b>
                            </Link>

                            <Link
                                href="/analytics"
                                className="quick-card"
                            >
                                <span className="quick-icon">
                                    ⌁
                                </span>

                                <strong>
                                    Market Analytics
                                </strong>

                                <span>
                                    Explore aggregated company and financial
                                    statistics.
                                </span>

                                <b>
                                    Open analytics →
                                </b>
                            </Link>

                            <Link
                                href="/companies/07944888"
                                className="quick-card"
                            >
                                <span className="quick-icon">
                                    ↗
                                </span>

                                <strong>
                                    Company Profile
                                </strong>

                                <span>
                                    See how financial intelligence is presented
                                    for an individual company.
                                </span>

                                <b>
                                    View example →
                                </b>
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}