import type { AnalyticsOverview } from "@/types/analytics-overview";
import type { CompanyAnalytics } from "@/types/analytics";

const API_URL = process.env.API_URL;

if (!API_URL) {
    throw new Error("API_URL is not defined");
}

async function serverFetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status} ${response.statusText}`,
        );
    }

    return response.json();
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return serverFetch<AnalyticsOverview>("/api/analytics/overview");
}

export async function getCompanyAnalytics(
    ico: string,
): Promise<CompanyAnalytics> {
    return serverFetch<CompanyAnalytics>(
        `/api/companies/${ico}/analytics`,
    );
}