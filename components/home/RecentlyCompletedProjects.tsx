'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CompletedProject {
    id: number;
    number: string;
    name: string;
    description: string;
    amount: string;
    completionDate: string;
    organizationShort: string;
    imageKey: string;
}

const DEFAULT_IMAGE = '/images/home/complete/defaultCompleted.webp';

function truncate(text: string, max: number): string {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max).trimEnd() + '…';
}

function ProjectImage({ imageKey, alt }: { imageKey: string; alt: string }) {
    const [src, setSrc] = useState<string>(DEFAULT_IMAGE);

    useEffect(() => {
        if (!imageKey) return;

        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(
                    `/api/projectImages/projectImagethumbnails?key=${encodeURIComponent(imageKey)}`,
                );
                const data = await res.json();
                if (!cancelled) setSrc(data?.url ?? DEFAULT_IMAGE);
            } catch {
                if (!cancelled) setSrc(DEFAULT_IMAGE);
            }
        })();

        return () => { cancelled = true; };
    }, [imageKey]);

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 360px"
            className="object-cover"
            onError={() => setSrc(DEFAULT_IMAGE)}
            unoptimized
        />
    );
}

function ProjectCard({ project }: { project: CompletedProject }) {
    return (
        <Link
            href={`/projects/${project.id}`}
            className="group block snap-start shrink-0 w-[85vw] sm:w-[340px] lg:w-[360px]"
        >
            <article className="flex flex-col h-full">
                <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                    <ProjectImage imageKey={project.imageKey} alt={project.name} />

                    <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200">
                        <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-lg shadow-sm uppercase tracking-wide">
                            {project.number}
                        </span>
                    </div>

                    {project.amount && (
                        <div className="absolute bottom-3 right-3 z-10">
                            <span className="px-3 py-1.5 bg-slate-900/85 backdrop-blur-sm text-white text-sm font-semibold rounded-lg">
                                {project.amount}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-col flex-1">
                    <h3
                        className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-h-[2.75rem]"
                        title={project.name}
                    >
                        {project.name}
                    </h3>

                    {project.organizationShort && (
                        <p className="mt-1 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            {project.organizationShort}
                        </p>
                    )}

                    {project.description && (
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
                            {truncate(project.description, 120)}
                        </p>
                    )}

                    {project.completionDate && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Completed {project.completionDate}</span>
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}

export function RecentlyCompletedProjects() {
    const [projects, setProjects] = useState<CompletedProject[]>([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch('/api/home/recentCompletedProjects?limit=3');
                const data = await res.json();
                if (!cancelled) setProjects(data?.projects ?? []);
            } catch {
                if (!cancelled) setProjects([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    return (
        <section className="bg-white py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-10">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1.5">
                            Recently Completed Projects
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600">
                            Successful infrastructure initiatives across California
                        </p>
                    </div>
                    <Link
                        href="/projects?status=Closed"
                        className="inline-flex items-center gap-1.5 text-sm sm:text-base text-slate-700 hover:text-slate-900 font-semibold transition-colors group self-start sm:self-end"
                    >
                        View all
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex gap-4 sm:gap-6 overflow-hidden">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="shrink-0 w-[85vw] sm:w-[340px] lg:w-[360px] animate-pulse"
                            >
                                <div className="aspect-[4/3] sm:aspect-[16/10] bg-slate-200 rounded-2xl" />
                                <div className="mt-4 h-5 w-3/4 bg-slate-200 rounded" />
                                <div className="mt-2 h-3 w-1/4 bg-slate-200 rounded" />
                                <div className="mt-2 h-4 w-1/2 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <p className="text-slate-500 text-sm">No recently completed projects to display.</p>
                ) : (
                    <div
                        className="
                            flex gap-4 sm:gap-6
                            overflow-x-auto
                            snap-x snap-mandatory
                            scroll-smooth
                            -mx-4 sm:-mx-6 px-4 sm:px-6
                            pb-4
                            [scrollbar-width:none]
                            [&::-webkit-scrollbar]:hidden
                        "
                    >
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                        <div className="shrink-0 w-1 sm:w-2" aria-hidden />
                    </div>
                )}
            </div>
        </section>
    );
}