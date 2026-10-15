"use client";

import { useEffect, useState } from "react";

type CompaniesFiltersProps = {
    search: string;
    sector: string;
    size: string;
    legalForm: string;
    nace: string;
    municipality: string;
    turnoverMin: string;
    turnoverMax: string;

    onSearchChange: (value: string) => void;
    onSuggestionSelect: (value: string) => void;
    onSectorChange: (value: string) => void;
    onSizeChange: (value: string) => void;
    onLegalFormChange: (value: string) => void;
    onNaceChange: (value: string) => void;
    onMunicipalityChange: (value: string) => void;
    onTurnoverMinChange: (value: string) => void;
    onTurnoverMaxChange: (value: string) => void;

    onApply: () => void;
    onReset: () => void;
    isLoading?: boolean;
};

export default function CompaniesFilters({
                                             search,
                                             sector,
                                             size,
                                             legalForm,
                                             nace,
                                             municipality,
                                             turnoverMin,
                                             turnoverMax,
                                             onSearchChange,
                                             onSuggestionSelect,
                                             onSectorChange,
                                             onSizeChange,
                                             onLegalFormChange,
                                             onNaceChange,
                                             onMunicipalityChange,
                                             onTurnoverMinChange,
                                             onTurnoverMaxChange,
                                             onApply,
                                         onReset,
                                         isLoading = false,
                                         }: CompaniesFiltersProps) {
    const [suggestions, setSuggestions] = useState<{ ico: string; name: string; municipality: string | null }[]>([]);

    useEffect(() => {
        const term = search.trim();
        if (term.length < 2) { queueMicrotask(() => setSuggestions([])); return; }
        const timer = window.setTimeout(() => {
            fetch(`/api/company-suggestions?q=${encodeURIComponent(term)}`)
                .then(response => response.ok ? response.json() : [])
                .then(setSuggestions)
                .catch(() => setSuggestions([]));
        }, 180);
        return () => window.clearTimeout(timer);
    }, [search]);
    const hasFilters =
        search ||
        sector ||
        size ||
        legalForm ||
        nace ||
        turnoverMin ||
        turnoverMax;

    return (
        <section className="companies-filters">
            <div className="companies-search">
                <span className="search-icon">⌕</span>

                <input
                    type="text"
                    placeholder="Search by company name or IČO..."
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    disabled={isLoading}
                />

                {suggestions.length > 0 && (
                    <div className="company-search-suggestions">
                        {suggestions.map((company) => (
                            <button key={company.ico} type="button" onClick={() => { setSuggestions([]); onSuggestionSelect(company.ico); }}>
                                <strong>{company.name}</strong><span>IČO {company.ico}{company.municipality ? ` · ${company.municipality}` : ""}</span>
                            </button>
                        ))}
                    </div>
                )}

                <span className="search-shortcut">⌘ K</span>
            </div>

            <div className="filter-row">
                <select
                    value={sector}
                    onChange={(event) =>
                        onSectorChange(event.target.value)
                    }
                    disabled={isLoading}
                >
                    <option value="">All sectors</option>
                    <option value="A">Agriculture</option>
                    <option value="C">Manufacturing</option>
                    <option value="F">Construction</option>
                    <option value="G">Trade</option>
                    <option value="I">Accommodation</option>
                    <option value="J">Information</option>
                    <option value="L">Real estate</option>
                    <option value="M">Professional activities</option>
                </select>

                <select
                    value={size}
                    onChange={(event) =>
                        onSizeChange(event.target.value)
                    }
                    disabled={isLoading}
                >
                    <option value="">All sizes</option>
                    <option value="MICRO">Micro</option>
                    <option value="SMALL">Small</option>
                    <option value="BIG">Big</option>
                </select>

                <input
                    type="text"
                    placeholder="NACE code"
                    value={nace}
                    onChange={(event) =>
                        onNaceChange(event.target.value)
                    }
                    disabled={isLoading}
                />

                <input
                    type="text"
                    placeholder="Registered city"
                    value={municipality}
                    onChange={(event) => onMunicipalityChange(event.target.value)}
                    disabled={isLoading}
                />

                <input
                    type="number"
                    placeholder="Legal form"
                    value={legalForm}
                    onChange={(event) =>
                        onLegalFormChange(event.target.value)
                    }
                    disabled={isLoading}
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Turnover min (tis. Kč)"
                    value={turnoverMin}
                    onChange={(event) =>
                        onTurnoverMinChange(event.target.value)
                    }
                    disabled={isLoading}
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Turnover max (tis. Kč)"
                    value={turnoverMax}
                    onChange={(event) =>
                        onTurnoverMaxChange(event.target.value)
                    }
                    disabled={isLoading}
                />

                {hasFilters && (
                    <>
                        <button
                            type="button"
                            className="filter-apply"
                            onClick={onApply}
                            disabled={isLoading}
                        >
                            Apply filters
                        </button>

                        <button
                            type="button"
                            className="filter-reset"
                            onClick={onReset}
                            disabled={isLoading}
                        >
                            Clear filters
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}
