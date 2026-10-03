import type {
    CompaniesResponse,
    CompanyFilters,
} from "@/types/company";
import type { CompanyAnalytics } from "@/types/analytics";
import type { AnalyticsOverview } from "@/types/analytics-overview";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status} ${response.statusText}`,
        );
    }

    return response.json();
}

export async function getCompanies(
    filters: CompanyFilters = {},
): Promise<CompaniesResponse> {
    const params = new URLSearchParams();

    if (filters.search) {
        params.set("search", filters.search);
    }

    if (filters.sector) {
        params.set("sector", filters.sector);
    }

    if (filters.size) {
        params.set("size", filters.size);
    }

    if (filters.legal_form !== undefined) {
        params.set("legal_form", String(filters.legal_form));
    }

    if (filters.nace) {
        params.set("nace", filters.nace);
    }

    // if (filters.year !== undefined) {
    //     params.set("year", String(filters.year));
    // }

    if (filters.turnover_min !== undefined) {
        params.set("turnover_min", String(filters.turnover_min));
    }

    if (filters.turnover_max !== undefined) {
        params.set("turnover_max", String(filters.turnover_max));
    }

    params.set("sort", filters.sort ?? "id");
    params.set("order", filters.order ?? "asc");
    params.set("limit", String(filters.limit ?? 50));
    params.set("offset", String(filters.offset ?? 0));

    return apiFetch<CompaniesResponse>(
        `/api/companies?${params.toString()}`,
    );
}

export async function getCompanyAnalytics(
    ico: string,
): Promise<CompanyAnalytics> {
    return apiFetch<CompanyAnalytics>(
        `/api/companies/${ico}/analytics`,
    );
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return apiFetch<AnalyticsOverview>(
        "/api/analytics/overview",
    );
}