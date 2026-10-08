"use client";

type CompaniesFiltersProps = {
    search: string;
    sector: string;
    size: string;
    legalForm: string;
    nace: string;
    turnoverMin: string;
    turnoverMax: string;

    onSearchChange: (value: string) => void;
    onSectorChange: (value: string) => void;
    onSizeChange: (value: string) => void;
    onLegalFormChange: (value: string) => void;
    onNaceChange: (value: string) => void;
    onTurnoverMinChange: (value: string) => void;
    onTurnoverMaxChange: (value: string) => void;

    onApply: () => void;
    onReset: () => void;
};

export default function CompaniesFilters({
                                             search,
                                             sector,
                                             size,
                                             legalForm,
                                             nace,
                                             turnoverMin,
                                             turnoverMax,
                                             onSearchChange,
                                             onSectorChange,
                                             onSizeChange,
                                             onLegalFormChange,
                                             onNaceChange,
                                             onTurnoverMinChange,
                                             onTurnoverMaxChange,
                                             onApply,
                                             onReset,
                                         }: CompaniesFiltersProps) {
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
                />

                <span className="search-shortcut">⌘ K</span>
            </div>

            <div className="filter-row">
                <select
                    value={sector}
                    onChange={(event) =>
                        onSectorChange(event.target.value)
                    }
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
                />

                <input
                    type="number"
                    placeholder="Legal form"
                    value={legalForm}
                    onChange={(event) =>
                        onLegalFormChange(event.target.value)
                    }
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Turnover min (tis. Kč)"
                    value={turnoverMin}
                    onChange={(event) =>
                        onTurnoverMinChange(event.target.value)
                    }
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Turnover max (tis. Kč)"
                    value={turnoverMax}
                    onChange={(event) =>
                        onTurnoverMaxChange(event.target.value)
                    }
                />

                {hasFilters && (
                    <>
                        <button
                            type="button"
                            className="filter-apply"
                            onClick={onApply}
                        >
                            Apply filters
                        </button>

                        <button
                            type="button"
                            className="filter-reset"
                            onClick={onReset}
                        >
                            Clear filters
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}