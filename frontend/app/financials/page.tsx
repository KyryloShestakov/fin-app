
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import FinancialDataExplorer from "@/components/analitics/FinancialDataExplorer";

export default function FinancialsPage() {
    return (
        <div className="app-shell">
            <Sidebar />

            <div className="main-area">
                <Header />

                <main className="dashboard">
                    <div className="financials-page">

                        {/* Page heading */}
                        <section className="financials-heading">
                            <div>
                                <div className="panel-eyebrow">
                                    FINANCIAL DATABASE
                                </div>

                                <h2>Financials</h2>

                                <p>
                                    Explore, filter and compare financial
                                    indicators across Czech companies.
                                </p>
                            </div>
                        </section>

                        {/* Financial data table */}
                        <section className="financials-content">
                            <FinancialDataExplorer />
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}
