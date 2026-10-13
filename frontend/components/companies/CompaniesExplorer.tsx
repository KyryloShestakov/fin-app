"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CompaniesResponse } from "@/types/company";

import CompaniesFilters from "./CompaniesFilters";
import CompaniesTable from "./CompaniesTable";
import Pagination from "./Pagination";

type SortField = "id" | "name" | "ico";
type SortOrder = "asc" | "desc";
type SavedView = { name: string; query: string };
const SAVED_VIEWS_KEY = "finscope-company-views";

type CompaniesExplorerProps = {
    data: CompaniesResponse;
    search: string;
    sector: string;
    size: string;
    legalForm: string;
    nace: string;
    municipality: string;
    turnoverMin: string;
    turnoverMax: string;
    sort: SortField;
    order: SortOrder;
    page: number;
};

export default function CompaniesExplorer({
                                              data,
                                              search,
                                              sector,
                                              size,
                                              legalForm,
                                              nace,
                                              municipality,
                                              turnoverMin,
                                              turnoverMax,
                                              sort,
                                              order,
                                          }: CompaniesExplorerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // ---------------------------------------------------------
    // DRAFT FILTERS
    // ---------------------------------------------------------

    const [draftSearch, setDraftSearch] = useState(search);
    const [draftSector, setDraftSector] = useState(sector);
    const [draftSize, setDraftSize] = useState(size);
    const [draftLegalForm, setDraftLegalForm] =
        useState(legalForm);
    const [draftNace, setDraftNace] = useState(nace);
    const [draftMunicipality, setDraftMunicipality] = useState(municipality);
    const [draftTurnoverMin, setDraftTurnoverMin] =
        useState(turnoverMin);
    const [draftTurnoverMax, setDraftTurnoverMax] =
        useState(turnoverMax);
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [viewName, setViewName] = useState("");
    const savedViewsReady = useRef(false);

    // ---------------------------------------------------------
    // SYNC DRAFT WITH URL / SERVER STATE
    // ---------------------------------------------------------

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftSearch(search);
        setDraftSector(sector);
        setDraftSize(size);
        setDraftLegalForm(legalForm);
        setDraftNace(nace);
        setDraftMunicipality(municipality);
        setDraftTurnoverMin(turnoverMin);
        setDraftTurnoverMax(turnoverMax);
    }, [
        search,
        sector,
        size,
        legalForm,
        nace,
        municipality,
        turnoverMin,
        turnoverMax,
    ]);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(SAVED_VIEWS_KEY) ?? "[]") as SavedView[];
            Promise.resolve(stored).then((views) => { savedViewsReady.current = true; setSavedViews(views); });
        } catch { savedViewsReady.current = true; }
    }, []);

    useEffect(() => {
        if (savedViewsReady.current) localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews));
    }, [savedViews]);

    // ---------------------------------------------------------
    // URL UPDATE
    // ---------------------------------------------------------

    const updateParams = (
        updates: Record<string, string | null>,
    ) => {
        const params = new URLSearchParams(
            searchParams.toString(),
        );

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        const queryString = params.toString();

        router.push(
            queryString
                ? `${pathname}?${queryString}`
                : pathname,
        );
    };

    // ---------------------------------------------------------
    // APPLY FILTERS
    // ---------------------------------------------------------

    const handleApplyFilters = () => {
        updateParams({
            search: draftSearch || null,
            sector: draftSector || null,
            size: draftSize || null,
            legal_form: draftLegalForm || null,
            nace: draftNace || null,
            municipality: draftMunicipality || null,
            turnover_min: draftTurnoverMin || null,
            turnover_max: draftTurnoverMax || null,
            page: "1",
        });
    };

    const handleSuggestionSelect = (value: string) => {
        setDraftSearch(value);
        updateParams({
            search: value,
            sector: draftSector || null,
            size: draftSize || null,
            legal_form: draftLegalForm || null,
            nace: draftNace || null,
            municipality: draftMunicipality || null,
            turnover_min: draftTurnoverMin || null,
            turnover_max: draftTurnoverMax || null,
            page: "1",
        });
    };

    const exportVisibleRows = () => {
        const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
        const rows = data.items.map(company => [company.ico, company.name, company.sector?.code ?? "", company.sector?.name ?? "", company.legal_form?.short_name ?? company.legal_form?.name ?? ""]);
        const csv = [["IČO", "Company", "Sector code", "Sector", "Legal form"], ...rows].map(row => row.map(escape).join(",")).join("\n");
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a"); link.href = url; link.download = "companies-export.csv"; link.click(); URL.revokeObjectURL(url);
    };
    const saveCurrentView = () => {
        const name = viewName.trim();
        if (!name) return;
        const query = searchParams.toString();
        setSavedViews(current => [...current.filter(view => view.name !== name), { name, query }]);
        setViewName("");
    };

    // ---------------------------------------------------------
    // RESET
    // ---------------------------------------------------------

    const handleReset = () => {
        setDraftSearch("");
        setDraftSector("");
        setDraftSize("");
        setDraftLegalForm("");
        setDraftNace("");
        setDraftMunicipality("");
        setDraftTurnoverMin("");
        setDraftTurnoverMax("");

        router.push(pathname);
    };

    // ---------------------------------------------------------
    // PAGINATION
    // ---------------------------------------------------------

    const handlePageChange = (nextPage: number) => {
        updateParams({
            page: String(nextPage),
        });
    };

    // ---------------------------------------------------------
    // SORT
    // ---------------------------------------------------------

    const handleSort = (field: SortField) => {
        const nextOrder =
            sort === field && order === "asc"
                ? "desc"
                : "asc";

        updateParams({
            sort: field,
            order: nextOrder,
            page: "1",
        });
    };

    return (
        <div className="companies-page">
            <div className="page-heading">
                <div className="panel-eyebrow">
                    COMPANY EXPLORER
                </div>

                <h2>Companies</h2>

                <p>
                    Search, filter and explore Czech companies
                    across registry and financial data.
                </p>
            </div>

            <CompaniesFilters
                search={draftSearch}
                sector={draftSector}
                size={draftSize}
                legalForm={draftLegalForm}
                nace={draftNace}
                municipality={draftMunicipality}
                turnoverMin={draftTurnoverMin}
                turnoverMax={draftTurnoverMax}
                onSearchChange={setDraftSearch}
                onSuggestionSelect={handleSuggestionSelect}
                onSectorChange={setDraftSector}
                onSizeChange={setDraftSize}
                onLegalFormChange={setDraftLegalForm}
                onNaceChange={setDraftNace}
                onMunicipalityChange={setDraftMunicipality}
                onTurnoverMinChange={setDraftTurnoverMin}
                onTurnoverMaxChange={setDraftTurnoverMax}
                onApply={handleApplyFilters}
                onReset={handleReset}
            />

            <section className="panel companies-panel">
                <div className="panel-header">
                    <div>
                        <div className="panel-eyebrow">
                            COMPANY DATABASE
                        </div>

                        <h3>
                            {data.pagination.total.toLocaleString()}{" "}
                            companies
                        </h3>
                    </div>

                    <div className="company-sort-controls">
                        <button type="button" className="sort-button" onClick={exportVisibleRows}>Export CSV</button>
                        <button
                            type="button"
                            className="sort-button"
                            onClick={() =>
                                handleSort("name")
                            }
                        >
                            Name{" "}
                            {sort === "name" &&
                                (order === "asc"
                                    ? "↑"
                                    : "↓")}
                        </button>

                        <button
                            type="button"
                            className="sort-button"
                            onClick={() =>
                                handleSort("ico")
                            }
                        >
                            IČO{" "}
                            {sort === "ico" &&
                                (order === "asc"
                                    ? "↑"
                                    : "↓")}
                        </button>
                    </div>
                </div>

                <div className="company-views">
                    <input value={viewName} onChange={event => setViewName(event.target.value)} onKeyDown={event => { if (event.key === "Enter") saveCurrentView(); }} placeholder="Save current filters as…" />
                    <button type="button" onClick={saveCurrentView}>Save view</button>
                    {savedViews.length > 0 && <select aria-label="Saved views" defaultValue="" onChange={event => { if (event.target.value) router.push(`${pathname}?${event.target.value}`); }}><option value="">Open saved view…</option>{savedViews.map(view => <option key={view.name} value={view.query}>{view.name}</option>)}</select>}
                </div>

                <CompaniesTable
                    companies={data.items}
                    loading={false}
                />

                <Pagination
                    total={data.pagination.total}
                    limit={data.pagination.limit}
                    offset={data.pagination.offset}
                    onPageChange={handlePageChange}
                />
            </section>
        </div>
    );
}
