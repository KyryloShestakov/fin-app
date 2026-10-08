import { NextRequest, NextResponse } from 'next/server';
const API_URL = process.env.API_URL;
export async function GET() {
    if (!API_URL) return NextResponse.json({ error: 'API_URL missing' }, { status: 500 });
    try {
        const r = await fetch(`${API_URL}/api/analytics/financial-table/metadata`, { cache: 'no-store' });
        return new NextResponse(await r.text(), { status: r.status, headers: { 'Content-Type': 'application/json' } });
    } catch { return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 }); }
}
export async function POST(request: NextRequest) {
    if (!API_URL) return NextResponse.json({ error: 'API_URL missing' }, { status: 500 });
    try {
        const body = await request.json();
        const r = await fetch(`${API_URL}/api/analytics/financial-table`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
        return new NextResponse(await r.text(), { status: r.status, headers: { 'Content-Type': 'application/json' } });
    } catch { return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 }); }
}
