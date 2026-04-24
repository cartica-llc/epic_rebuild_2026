'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { geoPath, geoMercator, type GeoProjection } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { ChevronDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────
export type EpicProject = {
    PROJECT_ID: number;
    PROJECT_NUMBER: string;
    PROJECT_NAME: string;
    PROJECT_STATUS: string;
    EPIC_PERIOD: string;
    PROJECT_LEAD: string;
    COMMITTED_FUNDING_AMT: number;
    CONTRACTED_FUNDING_AMT: number;
    EXPENDED_FUNDING_AMT: number;
    MATCH_FUNDING: number;
    LEVERAGED_FUNDS: number;
    CPUC_DACLI: number;
    INVESTMENT_AREAS: string;
    coordinates: [number, number];
};

// ─── TODO: Replace with Snowflake query ──────────────────────────────
const epicProjects: EpicProject[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────
const INNOVATION_COLORS: Record<string, { dot: string; bg: string; border: string; label: string }> = {
    'Grid Decarbonization and Decentralization': { dot: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Grid Decarb' },
    'Resiliency and Safety': { dot: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Resiliency' },
    'Building Decarbonization': { dot: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', label: 'Building Decarb' },
    'Entrepreneurial Ecosystem': { dot: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Entrepreneurial' },
    'Low Carbon Transportation': { dot: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Low Carbon Transport' },
    'Industrial and Agricultural Innovation': { dot: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', label: 'Industrial / Ag' },
};
const DEFAULT_COLOR = { dot: '#475569', bg: '#f8fafc', border: '#e2e8f0', label: '' };

const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
};

function getAreas(p: EpicProject) { return p.INVESTMENT_AREAS.split(',').map((s) => s.trim()); }
function primaryArea(p: EpicProject) { return getAreas(p)[0]; }
function colorFor(area: string) { return INNOVATION_COLORS[area] ?? DEFAULT_COLOR; }
function allUniqueAreas(projects: EpicProject[]) {
    const set = new Set<string>();
    projects.forEach((p) => getAreas(p).forEach((a) => set.add(a)));
    return [...set];
}

// ─── Component ───────────────────────────────────────────────────────
export function Insight_LocationInsights() {
    const [californiaPath, setCaliforniaPath] = useState('');
    const [projection, setProjection] = useState<GeoProjection | null>(null);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showDACLI, setShowDACLI] = useState(false);
    const [activeArea, setActiveArea] = useState<string | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const areas = useMemo(() => allUniqueAreas(epicProjects), []);

    // Fetch California geometry
    useEffect(() => {
        fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
            .then((r) => r.json())
            .then((us: Topology) => {
                const states = topojson.feature(us, us.objects.states) as GeoJSON.FeatureCollection;
                const ca = states.features.find((d) => d.properties?.name === 'California');
                if (!ca) return;
                const proj = geoMercator().fitSize([380, 480], ca);
                const gen = geoPath().projection(proj);
                setCaliforniaPath(gen(ca) || '');
                setProjection(() => proj);
                setMapLoaded(true);
            })
            .catch(() => setMapLoaded(false));
    }, []);

    const projected = useMemo(() => {
        if (!projection) return [];
        return epicProjects
            .filter((p) => p.coordinates?.length === 2)
            .map((p) => {
                const pt = projection(p.coordinates);
                return { ...p, x: pt?.[0] ?? 0, y: pt?.[1] ?? 0 };
            });
    }, [projection]);

    const filtered = useMemo(() => {
        let list = projected;
        if (activeArea) list = list.filter((p) => getAreas(p).includes(activeArea));
        if (showDACLI) list = list.filter((p) => p.CPUC_DACLI === 1);
        return list;
    }, [projected, activeArea, showDACLI]);

    const spending = useMemo(() => {
        const acc = { committed: 0, contracted: 0, expended: 0, count: 0 };
        filtered.forEach((p) => { acc.committed += p.COMMITTED_FUNDING_AMT; acc.contracted += p.CONTRACTED_FUNDING_AMT; acc.expended += p.EXPENDED_FUNDING_AMT; acc.count += 1; });
        return acc;
    }, [filtered]);

    const clearFilters = () => { setActiveArea(null); setShowDACLI(false); setSelectedId(null); };
    const hasFilters = activeArea !== null || showDACLI;

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="relative bg-white px-4 py-6 md:px-6 md:py-8">
                <div className="space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Location &amp; Geographic Insights</h2>
                            <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-slate-500">Explore EPIC project locations across California.</p>
                        </div>
                        {hasFilters && (
                            <button onClick={clearFilters} className="self-start rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm hover:text-slate-900">Reset filters</button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">Investment Area</label>
                            <div className="relative">
                                <select value={activeArea ?? ''} onChange={(e) => { setActiveArea(e.target.value || null); setSelectedId(null); }} className="w-full min-w-[220px] appearance-none rounded-md border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
                                    <option value="">All Areas</option>
                                    {areas.map((area) => <option key={area} value={area}>{colorFor(area).label || area}</option>)}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <button type="button" onClick={() => { setShowDACLI((v) => !v); setSelectedId(null); }} className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${showDACLI ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-slate-900'}`}>DAC / LI</button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6">
                    <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #0f172a 8%, #64748b 40%, #cbd5e1 70%, transparent)' }} />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-5 px-4 py-5 md:px-6 md:py-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {([['Projects in View', spending.count], ['Committed', spending.committed], ['Contracted', spending.contracted], ['Expended', spending.expended]] as [string, number][]).map(([label, val]) => (
                        <div key={label} className="rounded-md border border-slate-200 bg-white p-4">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">{typeof val === 'number' && label !== 'Projects in View' ? fmt(val) : val}</p>
                        </div>
                    ))}
                </div>

                {/* Map */}
                <section className="rounded-md border border-slate-200 bg-white p-4 md:p-5">
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-900">EPIC projects by location</h4>
                        <p className="mt-1 text-sm text-slate-500">{filtered.length} project{filtered.length !== 1 ? 's' : ''} · California</p>
                    </div>

                    {/* Legend */}
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {areas.map((area) => {
                            const c = colorFor(area);
                            return <span key={area} className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full" style={{ background: c.dot }} />{c.label || area}</span>;
                        })}
                    </div>

                    <div className="relative overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                        <div className="mx-auto max-w-sm py-4">
                            <svg viewBox="0 0 380 480" className="block h-auto w-full">
                                {californiaPath && <path d={californiaPath} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />}
                                {filtered.map((p) => (
                                    <circle
                                        key={p.PROJECT_ID}
                                        cx={p.x} cy={p.y} r={6}
                                        fill={colorFor(primaryArea(p)).dot}
                                        stroke="#fff" strokeWidth={1.5}
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={() => setHoveredId(p.PROJECT_ID)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        onClick={() => setSelectedId(selectedId === p.PROJECT_ID ? null : p.PROJECT_ID)}
                                    />
                                ))}
                            </svg>
                        </div>

                        {epicProjects.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-xs text-slate-400">Connect Snowflake data to plot projects</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Project list */}
                <section className="rounded-md border border-slate-200 bg-white p-4 md:p-5">
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-900">Projects in view</h4>
                        <p className="mt-1 text-sm text-slate-500">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
                    </div>
                    {filtered.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="mb-1 text-sm font-semibold text-slate-900">{epicProjects.length === 0 ? 'No data loaded' : 'No projects match'}</p>
                            <p className="text-sm text-slate-500">{epicProjects.length === 0 ? 'Connect Snowflake to populate.' : 'Adjust filters above.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((p) => (
                                <div key={p.PROJECT_ID} onClick={() => setSelectedId(selectedId === p.PROJECT_ID ? null : p.PROJECT_ID)} className="cursor-pointer rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50/60">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-xs font-semibold text-slate-900 leading-tight">{p.PROJECT_NAME}</p>
                                        <span className="flex-shrink-0 text-xs font-semibold text-slate-900">{fmt(p.COMMITTED_FUNDING_AMT)}</span>
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: colorFor(primaryArea(p)).dot }} />
                                        <span>{colorFor(primaryArea(p)).label || primaryArea(p)}</span>
                                        <span>·</span>
                                        <span>{p.EPIC_PERIOD}</span>
                                        <span>·</span>
                                        <span>{p.PROJECT_STATUS}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}