'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

const DEFAULT_IMAGE = '/images/home/complete/defaultCompleted.webp';

function ProjectCard({ project, index }: { project: CompletedProject; index: number }) {
    const [imgSrc, setImgSrc] = useState<string>(project.imageUrl ?? DEFAULT_IMAGE);

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
            className="select-none snap-start shrink-0 w-[15rem] sm:w-[17rem] lg:w-[20rem]"
        >
            <Link href={`/projects/${project.id}`} className="group block">
                <article className="flex flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 shadow-sm">
                        <Image
                            src={imgSrc}
                            alt={project.name}
                            fill
                            sizes="(max-width: 640px) 75vw, (max-width: 1024px) 280px, 320px"
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                            onError={() => setImgSrc(DEFAULT_IMAGE)}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        {project.amount && (
                            <div className="absolute bottom-3 left-3">
                                <span className="rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-tight text-slate-900 shadow-sm backdrop-blur-md">
                                    {project.amount}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="mr-4 truncate text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                {project.organizationShort || 'Infrastructure'}
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

export function RecentlyCompletedProjects() {
    const [projects, setProjects] = useState<CompletedProject[]>([]);
    const [loading, setLoading] = useState(true);

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

                            <Link
                                href="/projects?status=Closed"
                                className=" group mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition-colors hover:text-slate-700 md:hidden"
                            >
                                View All
                                <ChevronRight className=" h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <Link
                            href="/projects?status=Closed"
                            className="pr-6 group mt-4 hidden items-center gap-2 whitespace-nowrap pr-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition-colors hover:text-slate-700 md:inline-flex"
                        >
                            View All
                            <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                        </Link>
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
                    <motion.div
                        className="flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto pb-12 pr-10 active:cursor-grabbing md:gap-8 md:pr-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        whileTap={{ cursor: 'grabbing' }}
                    >
                        {projects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}

                        <div className="w-10 shrink-0 md:w-16" aria-hidden="true" />
                    </motion.div>
                )}
            </div>
        </section>
    );
}