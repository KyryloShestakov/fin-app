"use client";

import { useCallback } from "react";
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

    const updateParams = useCallback(
        (updates: Record<string, string | null>) => {
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
        },
        [pathname, router, searchParams],
    );

    const handleSearchChange = (value: string) => {
        updateParams({
            search: value || null,
            page: "1",
        });
    };

    const handleReset = () => {
        router.push(pathname);
    };

    const handlePageChange = (nextPage: number) => {
        updateParams({
            page: String(nextPage),
        });
    };

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
                search={search}
                sector={sector}
                size={size}
                legalForm={legalForm}
                nace={nace}
                turnoverMin={turnoverMin}
                turnoverMax={turnoverMax}
                onSearchChange={handleSearchChange}
                onSectorChange={(value) =>
                    updateParams({
                        sector: value || null,
                        page: "1",
                    })
                }
                onSizeChange={(value) =>
                    updateParams({
                        size: value || null,
                        page: "1",
                    })
                }
                onLegalFormChange={(value) =>
                    updateParams({
                        legal_form: value || null,
                        page: "1",
                    })
                }
                onNaceChange={(value) =>
                    updateParams({
                        nace: value || null,
                        page: "1",
                    })
                }
                onTurnoverMinChange={(value) =>
                    updateParams({
                        turnover_min: value || null,
                        page: "1",
                    })
                }
                onTurnoverMaxChange={(value) =>
                    updateParams({
                        turnover_max: value || null,
                        page: "1",
                    })
                }
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
                            onClick={() => handleSort("name")}
                        >
                            Name{" "}
                            {sort === "name" &&
                                (order === "asc" ? "↑" : "↓")}
                        </button>

                        <button
                            type="button"
                            className="sort-button"
                            onClick={() => handleSort("ico")}
                        >
                            IČO{" "}
                            {sort === "ico" &&
                                (order === "asc" ? "↑" : "↓")}
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