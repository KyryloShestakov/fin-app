import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

export async function POST(request: NextRequest) {
    if (!API_URL) return NextResponse.json({ error: 'API_URL missing' }, { status: 500 });
    try {
        const response = await fetch(`${API_URL}/api/analytics/financial-table/insights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(await request.json()),
            cache: 'no-store',
        });
        return new NextResponse(await response.text(), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch {
        return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
    }
}
