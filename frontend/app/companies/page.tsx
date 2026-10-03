import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import CompaniesExplorer from "@/components/companies/CompaniesExplorer";

import { getCompanies } from "@/lib/api";

const PAGE_SIZE = 50;

type SearchParams = {
    search?: string;
    sector?: string;
    size?: string;
    legal_form?: string;
    nace?: string;
    turnover_min?: string;
    turnover_max?: string;
    sort?: "id" | "name" | "ico";
    order?: "asc" | "desc";
    page?: string;
};

type CompaniesPageProps = {
    searchParams: Promise<SearchParams>;
};

export default async function CompaniesPage({
                                                searchParams,
                                            }: CompaniesPageProps) {
    const params = await searchParams;

    const search = params.search ?? "";
    const sector = params.sector ?? "";
    const size = params.size ?? "";
    const legalForm = params.legal_form ?? "";
    const nace = params.nace ?? "";
    const turnoverMin = params.turnover_min ?? "";
    const turnoverMax = params.turnover_max ?? "";

    const sort = params.sort ?? "id";
    const order = params.order ?? "asc";

    const page = Math.max(
        Number(params.page ?? "1") || 1,
        1,
    );

    const data = await getCompanies({
        search: search || undefined,
        sector: sector || undefined,
        size: size || undefined,
        legal_form: legalForm
            ? Number(legalForm)
            : undefined,
        nace: nace || undefined,
        turnover_min: turnoverMin
            ? Number(turnoverMin)
            : undefined,
        turnover_max: turnoverMax
            ? Number(turnoverMax)
            : undefined,
        sort,
        order,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
    });

    return (
        <div className="app-shell">
            <Sidebar />

            <div className="main-area">
                <Header />

                <main className="dashboard">
                    <CompaniesExplorer
                        data={data}
                        search={search}
                        sector={sector}
                        size={size}
                        legalForm={legalForm}
                        nace={nace}
                        turnoverMin={turnoverMin}
                        turnoverMax={turnoverMax}
                        sort={sort}
                        order={order}
                        page={page}
                    />
                </main>
            </div>
        </div>
    );
}