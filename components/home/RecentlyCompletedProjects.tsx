'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useMotionValue, useMotionValueEvent, animate } from 'motion/react';
import { ProjectFallbackArt } from './ProjectFallbackArt';

interface CompletedProject {
    id: number;
    number: string;
    name: string;
    description: string;
    amount: string;
    completionDate: string;
    organizationShort: string;
    imageUrl: string | null;
}

function getDisplayOrgShort(organizationShort?: string) {
    return organizationShort === 'EPC' ? 'CEC' : organizationShort;
}

function ProjectCard({ project, index }: { project: CompletedProject; index: number }) {
    const [imgError, setImgError] = useState(false);
    const showFallback = !project.imageUrl || imgError;
    const displayOrgShort = getDisplayOrgShort(project.organizationShort);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="select-none shrink-0 w-[15rem] sm:w-[17rem] lg:w-[20rem]"
        >
            <Link href={`/projects/${project.id}`} className="group block" draggable={false}>
                <article className="flex flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 shadow-sm">
                        {showFallback ? (
                            <ProjectFallbackArt organizationShort={displayOrgShort} />
                        ) : (
                            <Image
                                src={project.imageUrl as string}
                                alt={project.name}
                                fill
                                sizes="(max-width: 640px) 75vw, (max-width: 1024px) 280px, 320px"
                                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                                onError={() => setImgError(true)}
                                draggable={false}
                            />
                        )}

                        {!showFallback && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        )}

                        {project.amount && (
                            <div className="absolute bottom-3 left-3 z-30">
                                <span className="rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-tight text-slate-900 shadow-sm backdrop-blur-md">
                                    {project.amount}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="mr-4 truncate text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                {displayOrgShort || 'Infrastructure'}
                            </span>

                            <span className="shrink-0 text-[10px] font-medium uppercase tabular-nums text-slate-400">
                                {project.number}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h3
                                className="line-clamp-1 text-lg font-semibold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-slate-600"
                                title={project.name}
                            >
                                {project.name}
                            </h3>

                            <p className="line-clamp-2 min-h-[40px] text-sm font-light leading-relaxed text-slate-500">
                                {project.description}
                            </p>
                        </div>

                        {project.completionDate && (
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                    Completed {project.completionDate}
                                </span>
                            </div>
                        )}
                    </div>
                </article>
            </Link>
        </motion.div>
    );
}

const SPRING = { type: 'spring', stiffness: 300, damping: 34 } as const;

export function RecentlyCompletedProjects() {
    const [projects, setProjects] = useState<CompletedProject[]>([]);
    const [loading, setLoading] = useState(true);

    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const [maxDrag, setMaxDrag] = useState(0);
    const [xValue, setXValue] = useState(0);
    useMotionValueEvent(x, 'change', setXValue);
    const canScrollLeft = xValue < -4;
    const canScrollRight = xValue > -(maxDrag - 4);
    const suppressClickRef = useRef(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/home/recentCompletedProjects?limit=5');
                const data = await res.json();
                setProjects(data?.projects ?? []);
            } catch {
                setProjects([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    useLayoutEffect(() => {
        const viewportEl = viewportRef.current;
        const trackEl = trackRef.current;
        if (!viewportEl || !trackEl) return;

        const recompute = () => {
            const next = Math.max(0, trackEl.scrollWidth - viewportEl.clientWidth);
            setMaxDrag(next);
            if (x.get() < -next) animate(x, -next, SPRING);
        };

        recompute();
        const observer = new ResizeObserver(recompute);
        observer.observe(viewportEl);
        observer.observe(trackEl);
        return () => observer.disconnect();
    }, [projects, x]);

    const scrollByAmount = (direction: 1 | -1) => {
        const viewportEl = viewportRef.current;
        if (!viewportEl) return;
        const target = Math.min(0, Math.max(-maxDrag, x.get() - direction * viewportEl.clientWidth * 0.85));
        animate(x, target, SPRING);
    };


    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (delta === 0) return;
        e.preventDefault();
        const next = Math.min(0, Math.max(-maxDrag, x.get() - delta));
        x.set(next);
    };

    return (
        <section className="select-none overflow-hidden bg-white">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 md:mb-16">
                    <div className="flex items-start justify-between gap-6">
                        <div className="max-w-3xl">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-slate-500 text-xs sm:text-sm mb-6 uppercase tracking-[0.2em] font-medium"
                            >
                                Recently Completed
                            </motion.span>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[0.95] tracking-tight text-slate-900 my-4"
                            >
                                Project Milestones
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-slate-500"
                            >
                                A look at the latest initiatives that have moved from planning to completion.
                            </motion.p>

                            {/*<Link*/}
                            {/*    href="/projects?status=Closed"*/}
                            {/*    className=" group mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition-colors hover:text-slate-700 md:hidden"*/}
                            {/*>*/}
                            {/*    View All*/}
                            {/*    <ChevronRight className=" h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />*/}
                            {/*</Link>*/}
                        </div>

                        <div className="mt-4 hidden items-center gap-3 md:flex">

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => scrollByAmount(-1)}
                                    disabled={!canScrollLeft}
                                    aria-label="Scroll to previous projects"
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollByAmount(1)}
                                    disabled={!canScrollRight}
                                    aria-label="Scroll to next projects"
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/*<Link*/}
                            {/*    href="/projects?status=Closed"*/}
                            {/*    className="pr-6 group inline-flex items-center gap-2 whitespace-nowrap pr-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition-colors hover:text-slate-700"*/}
                            {/*>*/}
                            {/*    View All*/}
                            {/*    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />*/}
                            {/*</Link>*/}
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex gap-6 pr-10 md:gap-8 md:pr-16">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-[15rem] shrink-0 animate-pulse sm:w-[17rem] lg:w-[20rem]"
                            >
                                <div className="mb-6 aspect-[16/9] rounded-2xl bg-slate-100" />
                                <div className="mb-4 h-3 w-1/4 rounded bg-slate-100" />
                                <div className="h-6 w-3/4 rounded bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div ref={viewportRef} className="pb-12" onWheel={handleWheel}>
                        <motion.div
                            ref={trackRef}
                            className="flex w-max cursor-grab gap-6 pr-10 active:cursor-grabbing md:gap-8 md:pr-16"
                            style={{ x, touchAction: 'pan-y' }}
                            drag="x"
                            dragConstraints={{ left: -maxDrag, right: 0 }}
                            dragElastic={0.12}
                            dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
                            whileTap={{ cursor: 'grabbing' }}
                            onDragEnd={(_, info) => {
                                if (Math.abs(info.offset.x) > 5) {
                                    suppressClickRef.current = true;
                                    setTimeout(() => {
                                        suppressClickRef.current = false;
                                    }, 0);
                                }
                            }}
                            onClickCapture={(e) => {
                                if (suppressClickRef.current) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }}
                        >
                            {projects.map((project, index) => (
                                <ProjectCard key={project.id} project={project} index={index} />
                            ))}
                        </motion.div>
                    </div>
                )}
            </div>
        </section>
    );
}