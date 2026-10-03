export type AnalyticsPeriod = {
    current: number;
    previous: number | null;
};

export type AnalyticsGrowth = {
    revenue: number | null;
    assets: number | null;
    profit: number | null;
    receivables: number | null;
    inventory: number | null;
    cash: number | null;
};

export type AnalyticsRatios = {
    current_ratio: number | null;
    debt_to_assets: number | null;
    profit_margin: number | null;
    asset_turnover: number | null;
    receivables_to_assets: number | null;
    cash_to_assets: number | null;
    roa: number | null;
    roe: number | null;
};

export type AnalyticsMetric = {
    code: string;
    name: string;
    category: string | null;
    unit: string | null;
    current: number | null;
    previous: number | null;
    change: number | null;
};

export type CompanyAnalytics = {
    company: {
        id: number;
        ico: string;
        name: string;
    };
    period: AnalyticsPeriod;
    growth: AnalyticsGrowth;
    ratios: AnalyticsRatios;
    metrics: AnalyticsMetric[];
};