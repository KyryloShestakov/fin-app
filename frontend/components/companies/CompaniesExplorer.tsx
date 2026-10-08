"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CompaniesResponse } from "@/types/company";

import CompaniesFilters from "./CompaniesFilters";
import CompaniesTable from "./CompaniesTable";
import Pagination from "./Pagination";

type SortField = "id" | "name" | "ico";
type SortOrder = "asc" | "desc";

type CompaniesExplorerProps = {
    data: CompaniesResponse;
    search: string;
    sector: string;
    size: string;
    legalForm: string;
    nace: string;
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
                                              turnoverMin,
                                              turnoverMax,
                                              sort,
                                              order,
                                              page,
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
    const [draftTurnoverMin, setDraftTurnoverMin] =
        useState(turnoverMin);
    const [draftTurnoverMax, setDraftTurnoverMax] =
        useState(turnoverMax);

    // ---------------------------------------------------------
    // SYNC DRAFT WITH URL / SERVER STATE
    // ---------------------------------------------------------

    useEffect(() => {
        setDraftSearch(search);
        setDraftSector(sector);
        setDraftSize(size);
        setDraftLegalForm(legalForm);
        setDraftNace(nace);
        setDraftTurnoverMin(turnoverMin);
        setDraftTurnoverMax(turnoverMax);
    }, [
        search,
        sector,
        size,
        legalForm,
        nace,
        turnoverMin,
        turnoverMax,
    ]);

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
            turnover_min: draftTurnoverMin || null,
            turnover_max: draftTurnoverMax || null,
            page: "1",
        });
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
                turnoverMin={draftTurnoverMin}
                turnoverMax={draftTurnoverMax}
                onSearchChange={setDraftSearch}
                onSectorChange={setDraftSector}
                onSizeChange={setDraftSize}
                onLegalFormChange={setDraftLegalForm}
                onNaceChange={setDraftNace}
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