import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import CompanyHeader from "@/components/companies/CompanyHeader";
import CompanyKpis from "@/components/companies/CompanyKpis";
import CompanyTabs from "@/components/companies/CompanyTabs";
import FinancialChart from "@/components/companies/CompanyFinancialChart";
import FinancialTable from "@/components/companies/ComapnyFinancilTable";
import FinancialRatios from "@/components/companies/FinancialRations";

import { getCompanyAnalytics } from "@/lib/server-api";

type CompanyPageProps = {
    params: Promise<{
        ico: string;
    }>;
};

export default async function CompanyPage({
                                              params,
                                          }: CompanyPageProps) {
    const { ico } = await params;

    const analytics = await getCompanyAnalytics(ico);

    return (
        <div className="app-shell">
            <Sidebar />

            <div className="main-area">
                <Header />

                <main className="dashboard">
                    <div className="company-page">
                        <CompanyHeader
                            name={analytics.company.name}
                            ico={analytics.company.ico}
                        />

                        <CompanyTabs
                            ico={analytics.company.ico}
                        />

                        <CompanyKpis
                            analytics={analytics}
                        />

                        <FinancialChart
                            analytics={analytics}
                        />

                        <FinancialTable
                            analytics={analytics}
                        />

                        <FinancialRatios
                            analytics={analytics}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}