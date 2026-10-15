import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (query.length < 2) return NextResponse.json([]);
    if (!API_URL) return NextResponse.json({ error: 'API_URL missing' }, { status: 500 });
    try {
        const response = await fetch(`${API_URL}/api/companies?search=${encodeURIComponent(query)}&limit=8&sort=name&order=asc`, { next: { revalidate: 60 } });
        if (!response.ok) return NextResponse.json([], { status: response.status });
        const payload = await response.json();
        return NextResponse.json(payload.items.map((company: { ico: string; name: string }) => ({ ...company, municipality: null })));
    } catch {
        return NextResponse.json([]);
    }
}
