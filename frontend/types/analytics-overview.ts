export type AnalyticsSector = {
    code: string;
    name: string;
    companies: number;
    percentage: number;
};

export type AnalyticsSize = {
    code: string;
    name: string;
    companies: number;
    percentage: number;
};

export type AnalyticsLegalForm = {
    code: number;
    name: string | null;
    short_name: string | null;
    companies: number;
};

export type AnalyticsOverview = {
    overview: {
        companies: number;
        companies_with_sector: number;
        sectors: number;
        financial_statements: number;
        companies_with_financials: number;
        financial_coverage: number;
        latest_year: number | null;
    };

    sectors: AnalyticsSector[];
    sizes: AnalyticsSize[];
    legal_forms: AnalyticsLegalForm[];
};