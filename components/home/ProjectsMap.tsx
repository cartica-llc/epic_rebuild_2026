// components/home/ProjectsMap.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { geoPath, geoMercator } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Feature, Geometry, GeoJsonProperties } from 'geojson';
import { ArrowRight, ChevronRight, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DacProject {
    id: number;
    number: string;
    name: string;
    funding: string;
    expended: string;
    location: string;
    rank: number;
}

interface Region {
    adminId: number;
    label: string;
    short: string;
    color: string;
    dacPct: number;
    dacExpended: string;
    totalExpended: string;
    projectCount: number;
    projects: DacProject[];
}

// ─── County FIPS → admin region ──────────────────────────────────────────────
// 0 = EPC/CEC (Central), 1 = SCE (SoCal), 2 = SDGE (San Diego), 3 = PGE (NorCal)

const COUNTY_FIPS_TO_ADMIN: Record<string, number> = {
    '06001': 3, '06003': 3, '06005': 3, '06007': 3, '06009': 3,
    '06011': 3, '06013': 3, '06015': 3, '06017': 3, '06019': 0,
    '06021': 3, '06023': 3, '06025': 2, '06027': 0, '06029': 0,
    '06031': 0, '06033': 3, '06035': 3, '06037': 1, '06039': 0,
    '06041': 3, '06043': 3, '06045': 3, '06047': 0, '06049': 3,
    '06051': 3, '06053': 3, '06055': 3, '06057': 3, '06059': 1,
    '06061': 3, '06063': 3, '06065': 1, '06067': 3, '06069': 3,
    '06071': 1, '06073': 2, '06075': 3, '06077': 3, '06079': 3,
    '06081': 3, '06083': 3, '06085': 3, '06087': 3, '06089': 3,
    '06091': 3, '06093': 3, '06095': 3, '06097': 3, '06099': 0,
    '06101': 3, '06103': 3, '06105': 3, '06107': 0, '06109': 3,
    '06111': 1, '06113': 3, '06115': 3,
};

const REGION_META: Record<number, { label: string; short: string; fill: string; activeFill: string }> = {
    3: { label: 'Northern California', short: 'NorCal',   fill: '#cbd5e1', activeFill: '#94a3b8' },
    0: { label: 'Central California',  short: 'Central',  fill: '#94a3b8', activeFill: '#64748b' },
    1: { label: 'Southern California', short: 'SoCal',    fill: '#64748b', activeFill: '#334155' },
    2: { label: 'San Diego',           short: 'San Diego',fill: '#1e293b', activeFill: '#020617' },
};

const REGION_ORDER = [3, 0, 1, 2];

// ─── Popup ────────────────────────────────────────────────────────────────────

function RegionPopup({ region, onClose }: { region: Region; onClose: () => void }) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 z-20 mx-2 mb-2 rounded-lg bg-white shadow-xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
        >
            {/* Gray header band — matches InvestmentAreas popup */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                        {region.label}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                        Top {region.projects.length} of {region.projectCount.toLocaleString()} DAC/LI projects
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors shrink-0 mt-0.5"
                    aria-label="Close"
                >
                    <X className="w-3 h-3 text-slate-500" />
                </button>
            </div>

            {/* Project rows */}
            <div className="p-3">
                {region.projects.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">No projects available.</p>
                ) : (
                    <div className="space-y-2">
                        {region.projects.map(project => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="flex items-center justify-between gap-3 text-xs py-1.5 hover:bg-slate-50 rounded px-2 -mx-2"
                            >
                                <span className="text-slate-700 truncate flex-1">
                                    {project.name}
                                </span>
                                <span className="font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                                    {project.funding}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Footer link */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                    <Link
                        href={`/projects?dacli=1&programAdminId=${region.adminId}&disadvantaged=1&lowIncome=1`}
                        className="text-xs font-medium text-slate-900 hover:text-slate-700 inline-flex items-center gap-1 group"
                    >
                        View all {region.short} DAC/LI projects
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ProjectsMap() {
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRegionId, setActiveRegionId] = useState<number | null>(null);
    const [regionPaths, setRegionPaths] = useState<Record<number, string>>({});
    const [regionCentroids, setRegionCentroids] = useState<Record<number, [number, number]>>({});

    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Fetch DAC/LI data
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res  = await fetch('/api/home/dacLiProjectsMap');
                const data = await res.json();
                if (cancelled) return;
                const sorted: Region[] = REGION_ORDER
                    .map(id => (data.regions as Region[]).find(r => r.adminId === id))
                    .filter((r): r is Region => !!r);
                setRegions(sorted);
            } catch {
                if (!cancelled) setRegions([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Build county paths grouped into regions
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json');
                const us  = await res.json();

                interface CountyProps { name: string; }
                const counties = topojson.feature(us, us.objects.counties) as unknown as {
                    features: Feature<Geometry, CountyProps>[];
                };

                const caCounties = counties.features.filter(f =>
                    String(f.id ?? '').padStart(5, '0').startsWith('06')
                );

                const caCollection = { type: 'FeatureCollection' as const, features: caCounties };
                const projection   = geoMercator().fitSize([400, 600], caCollection as never);
                const pathGen      = geoPath().projection(projection);

                const grouped: Record<number, Feature<Geometry, GeoJsonProperties>[]> = {};
                for (const feature of caCounties) {
                    const fips    = String(feature.id ?? '').padStart(5, '0');
                    const adminId = COUNTY_FIPS_TO_ADMIN[fips];
                    if (adminId === undefined) continue;
                    if (!grouped[adminId]) grouped[adminId] = [];
                    grouped[adminId].push(feature);
                }

                const paths: Record<number, string>               = {};
                const centroids: Record<number, [number, number]> = {};

                for (const [adminIdStr, features] of Object.entries(grouped)) {
                    const adminId = Number(adminIdStr);
                    paths[adminId] = features
                        .map(f => pathGen(f))
                        .filter((p): p is string => !!p)
                        .join(' ');

                    const pts = features
                        .map(f => pathGen.centroid(f))
                        .filter(c => !isNaN(c[0]) && !isNaN(c[1]));
                    if (pts.length) {
                        centroids[adminId] = [
                            pts.reduce((s, c) => s + c[0], 0) / pts.length,
                            pts.reduce((s, c) => s + c[1], 0) / pts.length,
                        ];
                    }
                }

                if (!cancelled) {
                    setRegionPaths(paths);
                    setRegionCentroids(centroids);
                }
            } catch (err) {
                console.error('County map load failed:', err);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (activeRegionId === null) return;
        function onPointerDown(e: MouseEvent) {
            if (mapContainerRef.current && !mapContainerRef.current.contains(e.target as Node)) {
                setActiveRegionId(null);
            }
        }
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [activeRegionId]);

    const activeRegion = regions.find(r => r.adminId === activeRegionId) ?? null;
    const mapReady     = Object.keys(regionPaths).length > 0;

    return (
        <section className="py-6 sm:py-10 max-w-screen-xl mx-auto">
            <div className="max-w-7xl mx-auto select-none">
                <div className="flex flex-col lg:flex-row gap-4">

                    {/* ── CONTENT ───────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full order-1 px-6"
                    >
                        <p className="text-slate-500 text-xs sm:text-sm mb-4 uppercase tracking-[0.2em] font-medium">
                            Community impact
                        </p>

                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[0.95] tracking-tight text-slate-900 mb-6">
                            Powering the places that need it most.
                        </h2>

                        <p className="text-slate-600 leading-relaxed text-lg sm:text-xl mb-8 max-w-lg">
                            A meaningful share of EPIC&rsquo;s funding goes directly to lower-income
                            and underserved communities across California. Click a region to explore
                            what&rsquo;s being built there.
                        </p>

                        <Link
                            href="/projects?dacli=1"
                            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-lg transition-colors group"
                        >
                            See all community projects
                            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>

                    {/* ── MAP ───────────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="w-full flex justify-center order-2 pt-4 md:pt-0"
                    >
                        <div
                            ref={mapContainerRef}
                            className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[520px]"
                        >
                            {loading || !mapReady ? (
                                <div className="aspect-[2/3] w-full bg-slate-200/40 rounded-lg animate-pulse" />
                            ) : (
                                <>
                                    <svg
                                        viewBox="0 0 400 600"
                                        className="w-full h-auto drop-shadow-2xl"
                                        xmlns="http://www.w3.org/2000/svg"
                                        role="img"
                                        aria-label="California map divided into EPIC program regions — click a region to see top DAC/LI projects"
                                    >
                                        {REGION_ORDER.map(adminId => {
                                            const meta     = REGION_META[adminId];
                                            const region   = regions.find(r => r.adminId === adminId);
                                            const path     = regionPaths[adminId];
                                            const centroid = regionCentroids[adminId];
                                            if (!path || !meta) return null;

                                            const isActive    = activeRegionId === adminId;
                                            const isDimmed    = activeRegionId !== null && !isActive;
                                            const fill        = isActive ? meta.activeFill : meta.fill;
                                            const fillOpacity = isDimmed ? 0.3 : 1;

                                            return (
                                                <g key={adminId}>
                                                    <path
                                                        d={path}
                                                        fill={fill}
                                                        fillOpacity={fillOpacity}
                                                        stroke="#f8fafc"
                                                        strokeWidth="0.8"
                                                        strokeLinejoin="round"
                                                        className="cursor-pointer transition-all duration-300"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setActiveRegionId(prev =>
                                                                prev === adminId ? null : adminId
                                                            );
                                                        }}
                                                    />

                                                    {centroid && !isDimmed && region && (
                                                        <g className="pointer-events-none" opacity={fillOpacity}>
                                                            <rect
                                                                x={centroid[0] - 36}
                                                                y={centroid[1] - 28}
                                                                width={72}
                                                                height={58}
                                                                rx={8}
                                                                ry={8}
                                                                fill={meta.activeFill}
                                                                opacity={0.75}
                                                            />
                                                            <text
                                                                x={centroid[0]}
                                                                y={centroid[1] - 13}
                                                                textAnchor="middle"
                                                                fontSize="9"
                                                                fontWeight="800"
                                                                fill="white"
                                                                opacity="0.7"
                                                                letterSpacing="0.1em"
                                                            >
                                                                {meta.short.toUpperCase()}
                                                            </text>
                                                            <text
                                                                x={centroid[0]}
                                                                y={centroid[1] + 4}
                                                                textAnchor="middle"
                                                                fontSize="14"
                                                                fontWeight="900"
                                                                fill="white"
                                                            >
                                                                {region.dacPct.toFixed(1)}%
                                                            </text>
                                                            <text
                                                                x={centroid[0]}
                                                                y={centroid[1] + 17}
                                                                textAnchor="middle"
                                                                fontSize="6.5"
                                                                fontWeight="600"
                                                                fill="white"
                                                                opacity="0.55"
                                                                letterSpacing="0.08em"
                                                            >
                                                                DAC/LI
                                                            </text>
                                                        </g>
                                                    )}
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    <AnimatePresence>
                                        {activeRegion && (
                                            <div className="absolute inset-x-0 bottom-0 z-20">
                                                <RegionPopup
                                                    region={activeRegion}
                                                    onClose={() => setActiveRegionId(null)}
                                                />
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}