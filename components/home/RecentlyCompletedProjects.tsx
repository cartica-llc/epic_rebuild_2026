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
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className=" select-none snap-start shrink-0 w-[15rem] "
        >
            <Link href={`/projects/${project.id}`} className="group block">
                <article className="flex flex-col">
                    {/* Image Wrapper */}
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm">
                        <Image
                            src={imgSrc}
                            alt={project.name}
                            fill
                            sizes="(max-width: 640px) 85vw, 400px"
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                            onError={() => setImgSrc(DEFAULT_IMAGE)}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {project.amount && (
                            <div className="absolute bottom-3 left-3">
                                <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-[10px] font-bold tracking-tight text-slate-900 rounded-lg shadow-sm">
                                    {project.amount}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="mt-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 truncate mr-4">
                                {project.organizationShort || 'Infrastructure'}
                            </span>
                            <span className="text-[10px] uppercase font-medium text-slate-400 tabular-nums shrink-0">
                                {project.number}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {/* Project Title Truncation (1 Line) */}
                            <h3 className="text-lg font-semibold text-slate-900 leading-snug group-hover:text-slate-600 transition-colors duration-300 line-clamp-1" title={project.name}>
                                {project.name}
                            </h3>

                            {/* Project Description Truncation (2 Lines) */}
                            <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed min-h-[40px]">
                                {project.description}
                            </p>
                        </div>

                        {/* Date & Status */}
                        {project.completionDate && (
                            <div className="pt-1 flex items-center gap-2">
                              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">

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
        <section className="select-none bg-white  overflow-hidden">
            <div className="max-w-7xl mx-auto ">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-xl">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-slate-600 text-xs font-bold uppercase tracking-[0.3em] block mb-3"
                        >
                            Recently Completed
                        </motion.span>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900"
                        >
                            Project Milestones
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-5 text-lg text-slate-500 font-light leading-relaxed"
                        >
                            A look at the latest initiatives that have moved from planning to completion.
                        </motion.p>
                    </div>

                    <Link

                        href="/projects?status=Closed"

                        className="whitespace-nowrap px-8 inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-slate-400 hover:text-slate-600 transition-all group"

                    >

                        View All
                        <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />                    </Link>
                </header>

                {loading ? (
                    <div className="flex gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="shrink-0 w-[340px] animate-pulse">
                                <div className="aspect-[16/9] bg-slate-100 rounded-2xl mb-6" />
                                <div className="h-3 w-1/4 bg-slate-100 rounded mb-4" />
                                <div className="h-6 w-3/4 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-12 cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        whileTap={{ cursor: "grabbing" }}
                    >
                        {projects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}
                        <div className="shrink-0 w-8" aria-hidden="true" />
                    </motion.div>
                )}
            </div>
        </section>
    );
}