export type CompanySector = {
    code: string;
    name: string;
};

export type CompanyLegalForm = {
    code: number;
    name: string | null;
    short_name: string | null;
};

export type Company = {
    id: number;
    ico: string;
    name: string;
    sector: CompanySector | null;
    legal_form: CompanyLegalForm | null;
};

export type CompanyPagination = {
    total: number;
    limit: number;
    offset: number;
};

export type CompaniesResponse = {
    items: Company[];
    pagination: CompanyPagination;
};

export type CompanyFilters = {
    search?: string;
    sector?: string;
    size?: string;
    legal_form?: number;
    nace?: string;
    turnover_min?: number;
    turnover_max?: number;
    sort?: "id" | "name" | "ico";
    order?: "asc" | "desc";
    limit?: number;
    offset?: number;
};