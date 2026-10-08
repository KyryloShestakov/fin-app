'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CompanyInsight, FinancialTableRow, MetricFilter, TableMetadata, TableQuery, TableResponse } from '@/types/financial-table';
import './css/financial-explorer.css';

const OPERATORS: MetricFilter['operator'][] = ['gte', 'lte', 'gt', 'lt', 'eq', 'ne', 'between', 'is_null', 'is_not_null'];
const LABELS: Record<string, string> = { gte: '≥', lte: '≤', gt: '>', lt: '<', eq: '=', ne: '≠', between: 'Between', is_null: 'Empty', is_not_null: 'Not empty' };
const STORAGE_KEY = 'finscope-watchlists';
type Watchlists = Record<string, FinancialTableRow[]>;
const format = (value: string | number | null | undefined, digits = 2) => value == null ? '—' : Number(value).toLocaleString('cs-CZ', { maximumFractionDigits: digits });
const percent = (value: number | null | undefined) => value == null ? '—' : `${(value * 100).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })}%`;

export default function FinancialDataExplorer() {
    const [metadata, setMetadata] = useState<TableMetadata>({ years: [], metrics: [] });
    const [query, setQuery] = useState<TableQuery>({ page: 1, page_size: 50, year: null, search: '', sort_by: 'name', sort_dir: 'asc', filters: [] });
    const [result, setResult] = useState<TableResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [metricCode, setMetricCode] = useState('');
    const [operator, setOperator] = useState<MetricFilter['operator']>('gte');
    const [value, setValue] = useState('');
    const [valueTo, setValueTo] = useState('');
    const [searchDraft, setSearchDraft] = useState('');
    const [watchlists, setWatchlists] = useState<Watchlists>({ Watchlist: [] });
    const [activeList, setActiveList] = useState('Watchlist');
    const [newList, setNewList] = useState('');
    const [comparison, setComparison] = useState<FinancialTableRow[]>([]);
    const [insights, setInsights] = useState<CompanyInsight[]>([]);
    const skipInitialWatchlistWrite = useRef(true);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{"Watchlist":[]}') as Watchlists;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setWatchlists({ Watchlist: [], ...stored });
        } catch { /* retain the default list when browser storage is malformed */ }
        fetch('/api/financial-explorer').then(async response => { if (!response.ok) throw Error(`Metadata HTTP ${response.status}`); return response.json(); }).then((data: TableMetadata) => { setMetadata(data); if (data.metrics.length) setMetricCode(data.metrics[0].code); }).catch(reason => setError(String(reason)));
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true); setError('');
        fetch('/api/financial-explorer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query), signal: controller.signal })
            .then(async response => { if (!response.ok) throw Error(`Table HTTP ${response.status}: ${await response.text()}`); return response.json(); })
            .then((data: TableResponse) => setResult(data))
            .catch(reason => { if (reason.name !== 'AbortError') setError(String(reason)); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [query]);
    useEffect(() => {
        if (!comparison.length) return;
        fetch('/api/financial-explorer/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_ids: comparison.map(company => company.company_id), year: result?.year ?? null }) })
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Unable to load comparison insights')))
            .then(data => setInsights(data.companies)).catch(reason => setError(String(reason)));
    }, [comparison, result?.year]);
    useEffect(() => {
        if (skipInitialWatchlistWrite.current) { skipInitialWatchlistWrite.current = false; return; }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists));
    }, [watchlists]);

    const metricMap = useMemo(() => new Map(metadata.metrics.map(metric => [metric.code, metric])), [metadata.metrics]);
    const locations = useMemo(() => Object.entries((result?.rows ?? []).reduce<Record<string, number>>((all, row) => { if (row.municipality) all[row.municipality] = (all[row.municipality] ?? 0) + 1; return all; }, {})).sort(([, a], [, b]) => b - a).slice(0, 6), [result]);
    const activeCompanies = watchlists[activeList] ?? [];
    const changeSort = (code: string) => setQuery(current => ({ ...current, page: 1, sort_by: code, sort_dir: current.sort_by === code && current.sort_dir === 'asc' ? 'desc' : 'asc' }));
    const addFilter = () => { if (!metricCode || (!['is_null', 'is_not_null'].includes(operator) && (!value.trim() || (operator === 'between' && !valueTo.trim())))) return; setQuery(current => ({ ...current, page: 1, filters: [...current.filters, { code: metricCode, operator, value: value || null, value_to: valueTo || null }] })); setValue(''); setValueTo(''); };
    const toggleSaved = (company: FinancialTableRow) => setWatchlists(current => { const list = current[activeList] ?? []; return { ...current, [activeList]: list.some(item => item.company_id === company.company_id) ? list.filter(item => item.company_id !== company.company_id) : [...list, company] }; });
    const toggleCompare = (company: FinancialTableRow) => setComparison(current => current.some(item => item.company_id === company.company_id) ? current.filter(item => item.company_id !== company.company_id) : current.length < 4 ? [...current, company] : current);
    const createList = () => { const name = newList.trim(); if (name && !watchlists[name]) { setWatchlists(current => ({ ...current, [name]: [] })); setActiveList(name); } setNewList(''); };
    const isSaved = (company: FinancialTableRow) => activeCompanies.some(item => item.company_id === company.company_id);
    const isCompared = (company: FinancialTableRow) => comparison.some(item => item.company_id === company.company_id);

    return <section className="financial-explorer">
        <div className="fe-heading"><div><div className="panel-eyebrow">FINANCIAL DATA</div><h3>Financial Data Explorer</h3><p>Explore, save and compare company financial indicators.</p></div><span>{result?.total.toLocaleString('cs-CZ') ?? '—'} companies</span></div>
        <div className="fe-toolbar"><form onSubmit={event => { event.preventDefault(); setQuery(current => ({ ...current, page: 1, search: searchDraft })); }}><input value={searchDraft} onChange={event => setSearchDraft(event.target.value)} placeholder="Search company or IČO"/><button type="submit">Search</button></form><label>Year <select value={query.year ?? ''} onChange={event => setQuery(current => ({ ...current, page: 1, year: event.target.value ? Number(event.target.value) : null }))}><option value="">Latest</option>{metadata.years.map(year => <option key={year} value={year}>{year}</option>)}</select></label><button onClick={() => { setQuery({ page: 1, page_size: 50, year: null, search: '', sort_by: 'name', sort_dir: 'asc', filters: [] }); setSearchDraft(''); }}>Reset</button></div>
        <div className="fe-filter"><select aria-label="Financial metric" value={metricCode} onChange={event => setMetricCode(event.target.value)}>{metadata.metrics.map(metric => <option key={metric.code} value={metric.code}>{metric.name} ({metric.code})</option>)}</select><select aria-label="Operator" value={operator} onChange={event => setOperator(event.target.value as MetricFilter['operator'])}>{OPERATORS.map(item => <option key={item} value={item}>{LABELS[item]}</option>)}</select>{!['is_null', 'is_not_null'].includes(operator) && <input type="number" step="any" placeholder="Value" value={value} onChange={event => setValue(event.target.value)}/>} {operator === 'between' && <input type="number" step="any" placeholder="To" value={valueTo} onChange={event => setValueTo(event.target.value)}/>}<button onClick={addFilter}>+ Add filter</button></div>
        {query.filters.length > 0 && <div className="fe-chips">{query.filters.map((filter, index) => <button key={`${filter.code}-${index}`} onClick={() => setQuery(current => ({ ...current, page: 1, filters: current.filters.filter((_, itemIndex) => itemIndex !== index) }))}>{metricMap.get(filter.code)?.name ?? filter.code} {LABELS[filter.operator]} {filter.value ?? ''}{filter.operator === 'between' ? ` – ${filter.value_to}` : ''} ×</button>)}</div>}
        {error && <p className="fe-error" role="alert">{error}</p>}
        <section className="fe-workspace"><div className="fe-watchlist"><div><span className="fe-section-label">SAVED COMPANIES</span><select value={activeList} onChange={event => setActiveList(event.target.value)}>{Object.keys(watchlists).map(name => <option key={name}>{name}</option>)}</select></div><div className="fe-new-list"><input value={newList} onChange={event => setNewList(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') createList(); }} placeholder="New list name"/><button onClick={createList}>Create</button></div><p>{activeCompanies.length ? `${activeCompanies.length} saved · ${activeCompanies.slice(0, 2).map(company => company.name).join(', ')}${activeCompanies.length > 2 ? '…' : ''}` : 'Save companies from the table to build a watchlist.'}</p></div><div className="fe-map"><span className="fe-section-label">LOCATION MAP</span><p>Registered-office footprint in the current result set</p><div className="fe-map-points">{locations.length ? locations.map(([place, count], index) => <span className={`fe-map-point point-${index}`} key={place}>{count}<small>{place}</small></span>) : <span className="muted-value">No address data in this result.</span>}</div></div></section>
        {comparison.length > 0 && <section className="fe-comparison"><div className="fe-comparison-heading"><div><span className="fe-section-label">COMPARE COMPANIES</span><h4>{comparison.length} of 4 selected</h4></div><button onClick={() => setComparison([])}>Clear comparison</button></div><div className="fe-insights">{comparison.map(company => { const insight = insights.find(item => item.company_id === company.company_id); return <article key={company.company_id} className="fe-insight-card"><div><strong>{company.name}</strong><span>{company.sector?.name ?? 'No sector'}</span></div><b className={insight?.health_score != null && insight.health_score >= 70 ? 'score-good' : 'score-neutral'}>{insight?.health_score ?? '—'}<small>/100 health</small></b><dl><div><dt>Revenue</dt><dd>{format(insight?.metrics.revenue ?? null, 0)}</dd></div><div><dt>Margin</dt><dd>{percent(insight?.metrics.profit_margin)}</dd></div><div><dt>Debt / assets</dt><dd>{percent(insight?.metrics.debt_to_assets)}</dd></div><div><dt>Sector median margin</dt><dd>{percent(insight?.sector_benchmark?.profit_margin)}</dd></div></dl><p className="fe-score-note">{insight?.health_checks.length ? insight.health_checks.map(check => `${check.label}: ${check.score}/${check.maximum}`).join(' · ') : 'Loading score or insufficient financial data.'}</p></article>; })}</div></section>}
        <div className="fe-scroll" aria-busy={loading}><table><thead><tr><th className="fe-sticky fe-ico">Save</th><th className="fe-sticky fe-name"><button onClick={() => changeSort('name')}>Company {query.sort_by === 'name' ? (query.sort_dir === 'asc' ? '↑' : '↓') : '↕'}</button></th><th><button onClick={() => changeSort('ico')}>IČO {query.sort_by === 'ico' ? (query.sort_dir === 'asc' ? '↑' : '↓') : '↕'}</button></th><th>Compare</th>{metadata.metrics.map(metric => <th key={metric.code} title={`${metric.code} · ${metric.unit ?? ''}`}><button onClick={() => changeSort(metric.code)}>{metric.name} {query.sort_by === metric.code ? (query.sort_dir === 'asc' ? '↑' : '↓') : '↕'}</button></th>)}</tr></thead><tbody>{result?.rows.map(row => <tr key={row.company_id}><td className="fe-sticky fe-ico"><button className={`fe-icon-button ${isSaved(row) ? 'is-active' : ''}`} aria-label="Save company" onClick={() => toggleSaved(row)}>★</button></td><td className="fe-sticky fe-name"><a href={`/companies/${row.ico}`}>{row.name}</a><small>{row.sector?.code ?? '—'} · {row.municipality ?? 'Location unknown'}</small></td><td>{row.ico}</td><td><label className="fe-compare-toggle"><input type="checkbox" checked={isCompared(row)} disabled={!isCompared(row) && comparison.length >= 4} onChange={() => toggleCompare(row)}/><span>Compare</span></label></td>{metadata.metrics.map(metric => <td key={metric.code} className="fe-number">{format(row.values[metric.code])}</td>)}</tr>)}{!loading && result?.rows.length === 0 && <tr><td colSpan={metadata.metrics.length + 4}>No companies found</td></tr>}</tbody></table></div>
        <div className="fe-mobile-cards">{result?.rows.map(row => <article key={row.company_id} className="fe-company-card"><div><button className={`fe-icon-button ${isSaved(row) ? 'is-active' : ''}`} aria-label="Save company" onClick={() => toggleSaved(row)}>★</button><a href={`/companies/${row.ico}`}>{row.name}</a><span>{row.ico} · {row.sector?.name ?? 'No sector'}</span></div><label className="fe-compare-toggle"><input type="checkbox" checked={isCompared(row)} disabled={!isCompared(row) && comparison.length >= 4} onChange={() => toggleCompare(row)}/> Compare</label><dl>{metadata.metrics.slice(0, 3).map(metric => <div key={metric.code}><dt>{metric.name}</dt><dd>{format(row.values[metric.code])}</dd></div>)}</dl></article>)}</div>
        <div className="fe-footer"><span>{loading ? 'Loading…' : `Page ${query.page} of ${result?.total_pages ?? 0} · 50 per page`}</span><div><button disabled={loading || query.page <= 1} onClick={() => setQuery(current => ({ ...current, page: current.page - 1 }))}>Previous</button><button disabled={loading || query.page >= (result?.total_pages ?? 0)} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))}>Next</button></div></div>
    </section>;
}
