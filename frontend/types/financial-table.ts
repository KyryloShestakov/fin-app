export type Metric = { code: string; name: string; category: string | null; unit: string | null };
export type MetricFilter = { code: string; operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'is_null' | 'is_not_null'; value?: string | null; value_to?: string | null };
export type TableQuery = { page: number; page_size: 50; year: number | null; search: string; sort_by: string; sort_dir: 'asc' | 'desc'; filters: MetricFilter[] };
export type TableResponse = { page: number; page_size: 50; total: number; total_pages: number; year: number | null; rows: FinancialTableRow[] };
export type FinancialTableRow = { company_id: number; ico: string; name: string; sector: { code: string; name: string } | null; municipality: string | null; values: Record<string, string | null> };
export type CompanyInsight = {
    company_id: number; ico: string; name: string; sector: { code: string; name: string } | null;
    health_score: number | null;
    health_checks: { label: string; score: number; maximum: number; value: number }[];
    metrics: { revenue: number | null; revenue_growth: number | null; profit_margin: number | null; debt_to_assets: number | null; current_ratio: number | null };
    sector_benchmark: { revenue: number | null; profit_margin: number | null; debt_to_assets: number | null; current_ratio: number | null; sample_size: number } | null;
};
export type InsightsResponse = { year: number | null; companies: CompanyInsight[] };
export type TableMetadata = { years: number[]; metrics: Metric[] };
