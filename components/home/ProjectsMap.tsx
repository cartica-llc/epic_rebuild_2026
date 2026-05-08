// components/home/ProjectsMap.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { geoPath, geoMercator } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import { ChevronRight, MapPin } from 'lucide-react';

interface MapProject {
    id: number;
    number: string;
    name: string;
    description: string;
    funding: string;
    location: string;
    organizationShort: string;
    coordinates: [number, number] | null;
}

const FALLBACK_PATH =
    'M 180 10 L 200 8 L 220 12 L 235 20 L 245 35 L 252 55 L 257 75 L 260 95 L 263 115 L 265 135 L 267 155 L 269 175 L 271 195 L 273 215 L 275 235 L 277 255 L 279 275 L 281 295 L 283 315 L 285 335 L 287 355 L 289 375 L 291 395 L 293 415 L 295 435 L 297 455 L 299 475 L 301 495 L 303 515 L 304 535 L 305 555 L 304 570 L 300 580 L 290 585 L 275 587 L 260 586 L 245 583 L 230 578 L 215 571 L 200 562 L 185 551 L 170 538 L 155 523 L 142 506 L 130 487 L 120 466 L 112 443 L 105 418 L 100 391 L 97 362 L 95 331 L 94 298 L 95 263 L 98 226 L 103 187 L 110 146 L 120 103 L 132 58 L 145 25 L 160 12 L 170 10 Z';

export function ProjectsMap() {
    const [projects, setProjects] = useState<MapProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredProject, setHoveredProject] = useState<number | null>(null);
    const [californiaPath, setCaliforniaPath] = useState<string>('');
    const [projectedCoords, setProjectedCoords] = useState<Array<[number, number]>>([]);

    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch('/api/home/recentUpdatedProjectsMap?limit=4');
                const data = await res.json();

                if (!cancelled) {
                    setProjects(data?.projects ?? []);
                }
            } catch {
                if (!cancelled) {
                    setProjects([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (projects.length === 0) return;

        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(
                    'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
                );

                const us = await res.json();

                interface StateProps {
                    name: string;
                }

                const states = topojson.feature(
                    us,
                    us.objects.states
                ) as unknown as {
                    features: Feature<Geometry, StateProps>[];
                };

                const california = states.features.find(
                    (d) => d.properties.name === 'California'
                );

                if (!california) {
                    throw new Error('California not found in atlas');
                }

                const projection = geoMercator().fitSize(
                    [400, 500],
                    california
                );

                const pathGenerator = geoPath().projection(projection);

                const path = pathGenerator(california);

                if (cancelled) return;

                if (path) {
                    setCaliforniaPath(path);
                }

                const coords: Array<[number, number]> = projects
                    .filter((p) => p.coordinates !== null)
                    .map((p) => {
                        const projected = projection(p.coordinates!);

                        return projected ?? [0, 0];
                    });

                setProjectedCoords(coords);
            } catch (err) {
                if (cancelled) return;

                console.error('Error loading California map data:', err);

                setCaliforniaPath(FALLBACK_PATH);
                setProjectedCoords([]);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [projects]);

    const projectsWithCoords = projects.filter(
        (p) => p.coordinates !== null
    );

    const hovered =
        hoveredProject !== null
            ? projects.find((p) => p.id === hoveredProject)
            : null;

    return (
        <section className="py-6 sm:py-10 px-4 max-w-screen-xl mx-auto">
            <div className="max-w-7xl mx-auto">

                {/* MOBILE = STACKED */}
                {/* DESKTOP = 2 COLUMN */}
                <div className="flex flex-col lg:flex-row gap-10 ">

                    {/* CONTENT */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full order-1"
                    >
                        <p className="text-slate-500 text-xs sm:text-sm mb-4 uppercase tracking-[0.2em] font-medium">
                            Recently updated projects
                        </p>

                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[0.95] tracking-tight text-slate-900 mb-6">
                            Where is EPIC turning plans into progress?
                        </h2>

                        <p className="text-slate-600 leading-relaxed text-lg sm:text-xl mb-8 max-w-lg">
                            Hover to see what&rsquo;s changed and then open the
                            full list to explore every project with recent
                            updates.
                        </p>

                        <Link
                            href="/projects?sort=recent"
                            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-lg transition-colors group"
                        >
                            View all recently updated projects

                            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>

                    {/* MAP */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="w-full flex justify-center order-2 pt-4 md:pt-0"
                    >
                        <div className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[520px]">

                            {loading ? (
                                <div className="aspect-[4/5] w-full bg-slate-200/40 rounded-lg animate-pulse" />
                            ) : projectsWithCoords.length === 0 ? (
                                <div className="aspect-[4/5] w-full flex items-center justify-center text-slate-500 text-sm">
                                    No mapped project updates available.
                                </div>
                            ) : (
                                <>
                                    <svg
                                        ref={svgRef}
                                        viewBox="0 0 400 500"
                                        className="w-full h-auto drop-shadow-2xl"
                                        xmlns="http://www.w3.org/2000/svg"
                                        role="img"
                                        aria-label="Map of California with recent project locations"
                                    >
                                        {californiaPath && (
                                            <path
                                                d={californiaPath}
                                                fill="#475569"
                                                stroke="#94a3b8"
                                                strokeWidth="3"
                                                className="transition-colors duration-300 hover:fill-[#5a6d8a]"
                                            />
                                        )}

                                        <g
                                            opacity="0.1"
                                            stroke="#cbd5e1"
                                            strokeWidth="0.5"
                                        >
                                            <line x1="0" y1="125" x2="400" y2="125" />
                                            <line x1="0" y1="250" x2="400" y2="250" />
                                            <line x1="0" y1="375" x2="400" y2="375" />
                                            <line x1="100" y1="0" x2="100" y2="500" />
                                            <line x1="200" y1="0" x2="200" y2="500" />
                                            <line x1="300" y1="0" x2="300" y2="500" />
                                        </g>

                                        {projectedCoords.map((coord, index) => {
                                            const project =
                                                projectsWithCoords[index];

                                            if (!project) return null;

                                            const [x, y] = coord;

                                            const isHovered =
                                                hoveredProject === project.id;

                                            return (
                                                <g key={project.id}>
                                                    {isHovered && (
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="20"
                                                            fill="#3b82f6"
                                                            opacity="0.2"
                                                            className="animate-pulse"
                                                        />
                                                    )}

                                                    {isHovered && (
                                                        <motion.circle
                                                            cx={x}
                                                            cy={y}
                                                            r="12"
                                                            fill="none"
                                                            stroke="#60a5fa"
                                                            strokeWidth="2"
                                                            initial={{
                                                                scale: 0.5,
                                                                opacity: 0.8,
                                                            }}
                                                            animate={{
                                                                scale: 2,
                                                                opacity: 0,
                                                            }}
                                                            transition={{
                                                                duration: 1.5,
                                                                repeat: Infinity,
                                                            }}
                                                        />
                                                    )}

                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r={isHovered ? 12 : 10}
                                                        fill="#3b82f6"
                                                        stroke="#60a5fa"
                                                        strokeWidth={
                                                            isHovered ? 3 : 2
                                                        }
                                                        className="cursor-pointer transition-all duration-200"
                                                        style={{
                                                            opacity: isHovered
                                                                ? 1
                                                                : 0.9,
                                                            filter: isHovered
                                                                ? 'drop-shadow(0 0 8px #3b82f6)'
                                                                : 'none',
                                                        }}
                                                        onMouseEnter={() =>
                                                            setHoveredProject(
                                                                project.id
                                                            )
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoveredProject(null)
                                                        }
                                                        onFocus={() =>
                                                            setHoveredProject(
                                                                project.id
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            setHoveredProject(null)
                                                        }
                                                        tabIndex={0}
                                                        role="button"
                                                        aria-label={`${project.name} in ${project.location}`}
                                                    />

                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r={isHovered ? 5 : 4}
                                                        fill="white"
                                                        className="pointer-events-none transition-all duration-200"
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    <AnimatePresence>
                                        {hovered && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                    y: 10,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                    y: 0,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                    y: 10,
                                                }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-5 border-2 border-blue-200 z-10 pointer-events-none w-[260px] sm:w-[300px]"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    {hovered.organizationShort && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                                            {
                                                                hovered.organizationShort
                                                            }
                                                        </span>
                                                    )}

                                                    {hovered.number && (
                                                        <span className="text-[10px] font-mono text-slate-500">
                                                            {hovered.number}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="font-semibold text-slate-900 mb-2 text-base sm:text-lg leading-tight line-clamp-2">
                                                    {hovered.name}
                                                </div>

                                                {hovered.location && (
                                                    <div className="text-sm text-slate-600 mb-3 flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4 shrink-0" />

                                                        <span className="truncate">
                                                            {hovered.location}
                                                        </span>
                                                    </div>
                                                )}

                                                {hovered.funding && (
                                                    <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-3">
                                                        {hovered.funding}
                                                    </div>
                                                )}

                                                {hovered.description && (
                                                    <div className="text-xs text-slate-500 leading-relaxed pt-3 border-t border-slate-200 line-clamp-3">
                                                        {hovered.description}
                                                    </div>
                                                )}
                                            </motion.div>
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