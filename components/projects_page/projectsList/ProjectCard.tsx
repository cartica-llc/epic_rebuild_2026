// components/projects_page/projectsList/ProjectCard.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChartIcon, Pencil } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type { Project } from './ProjectsList';
import { ProjectThumbnail } from './ProjectThumbnail';
import { canEditProject } from '@/lib/permissions';

const DEFAULT_STATUS_STYLES = {
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-700',
};

const STATUS_CONFIG: Record<string, { dot: string; pill: string }> = {
    Active: {
        dot: 'bg-emerald-500',
        pill: 'bg-emerald-50 text-emerald-700',
    },
    Planning: {
        dot: 'bg-amber-500',
        pill: 'bg-amber-50 text-amber-700',
    },
    Completed: {
        dot: 'bg-slate-400',
        pill: 'bg-slate-100 text-slate-700',
    },
    'In Progress': {
        dot: 'bg-blue-500',
        pill: 'bg-blue-50 text-blue-700',
    },
};

const PERIOD_LABELS: Record<number, string> = {
    1: 'EPIC 1',
    2: 'EPIC 2',
    3: 'EPIC 3',
    4: 'EPIC 4',
};

const CARD_BG_STYLE = {
    background:
        'linear-gradient(99deg, #f8fafc, rgb(214, 222, 233) 59.24%, #d5dee9)',
};

const BLUR_MASK_STYLE = {
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    maskImage:
        'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
    WebkitMaskImage:
        'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
};

function formatAmount(amount?: string) {
    if (!amount) return '—';

    const num = parseFloat(amount.replace(/[$,]/g, ''));
    if (Number.isNaN(num)) return amount;

    const floorToOneDecimal = (value: number) => Math.floor(value * 10) / 10;

    if (num >= 1_000_000_000) {
        return `$${floorToOneDecimal(num / 1_000_000_000).toFixed(1)}B`;
    }

    if (num >= 1_000_000) {
        return `$${floorToOneDecimal(num / 1_000_000).toFixed(1)}M`;
    }

    if (num >= 1_000) {
        return `$${floorToOneDecimal(num / 1_000).toFixed(1)}K`;
    }

    return `$${Math.floor(num).toLocaleString()}`;
}

function getPeriodLabel(periodId?: string | number | null) {
    const numericPeriod = Number(periodId);
    return PERIOD_LABELS[numericPeriod] ?? null;
}

interface ProjectCardProps {
    project: Project;
    userOrganization?: string | null;
}

export function ProjectCard({ project, userOrganization }: ProjectCardProps) {
    const router = useRouter();
    const [isAmountHovered, setIsAmountHovered] = useState(false);

    const canEdit = canEditProject(userOrganization, project.programAdminId);
    const statusStyles = STATUS_CONFIG[project.status] ?? DEFAULT_STATUS_STYLES;
    const investmentProgramPeriod = getPeriodLabel(
        project.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID
    );

    const projectCode = project.code || '—';
    const projectName = project.name || 'Untitled Project';
    const projectLead = project.projectLead || '—';
    const organizationShort = project.organizationShort || '—';
    const investmentArea = project.investmentArea || 'No investment area';
    const committedDisplay = formatAmount(project.committed);

    const handleOpenProject = () => {
        router.push(`/projects/${project.id}`);
    };

    const handleEditProject = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        router.push(`/projects/${project.id}/edit`);
    };

    return (
        <div
            onClick={handleOpenProject}
            className="group cursor-pointer  border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-md"
        >
            <div className="flex items-stretch gap-4">
                {/* Left content */}
                <div className="min-w-0 flex-1 py-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            {project.status && (
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                                />
                            )}
                            <span>{projectCode}</span>
                        </span>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {organizationShort}
                        </span>

                        {investmentProgramPeriod && (
                            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                                {investmentProgramPeriod}
                            </span>
                        )}
                    </div>

                    <h3 className="truncate text-lg font-semibold leading-tight text-slate-900 md:text-[22px]">
                        {projectName}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span>{projectLead}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            <AreaChartIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="max-w-[220px] truncate">
                                {investmentArea}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Right visual panel */}
                <div className="relative w-[30%] min-w-[120px] max-w-[520px] shrink-0 self-stretch md:w-[35%] md:min-w-[280px]">
                    {canEdit && (
                        <button
                            type="button"
                            onClick={handleEditProject}
                            className="absolute -top-2 -right-2 z-30 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <Pencil className="h-3 w-3" />
                            Edit
                        </button>
                    )}

                    <div
                        className="relative h-full min-h-[120px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                        style={CARD_BG_STYLE}
                    >
                        <ProjectThumbnail
                            imageKey={project.imageKey}
                            alt={projectName}
                            className="absolute inset-0"
                            imageClassName="blur-[2px]"
                        />

                        <div
                            className="absolute right-0 bottom-0 left-0 z-10 flex items-end justify-end px-4 py-3 md:px-5 md:py-4"
                            onMouseEnter={() => setIsAmountHovered(true)}
                            onMouseLeave={() => setIsAmountHovered(false)}
                        >
                            <div
                                className="absolute inset-0"
                                style={BLUR_MASK_STYLE}
                            />

                            <div className="relative z-10 text-right">
                                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-700/80">
                                    Committed
                                </div>
                                <div className="mt-1 text-[24px] leading-none font-semibold text-slate-950 drop-shadow-sm md:text-[36px]">
                                    {committedDisplay}
                                </div>
                            </div>

                            <AnimatePresence>
                                {isAmountHovered && project.committed && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-4 bottom-full z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white shadow-lg"
                                    >
                                        {project.committed}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}