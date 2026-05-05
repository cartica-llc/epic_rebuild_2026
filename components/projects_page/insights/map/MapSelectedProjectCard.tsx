// components/projects_page/insights/map/MapSelectedProjectCard.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import { colorForArea } from './shared/colors';
import { formatMoneyShort } from '../spending/shared/format';
import type { MapProject } from './shared/types';

interface MapSelectedProjectCardProps {
    project: MapProject;
    onClose: () => void;
}

export function MapSelectedProjectCard({
                                           project,
                                           onClose,
                                       }: MapSelectedProjectCardProps) {
    const router = useRouter();

    // Funding bar widths use Committed as the baseline (the largest envelope).
    const baseline = Math.max(
        project.committedFunding,
        project.contractedFunding,
        1,
    );

    const fundingRows: { label: string; value: number; color: string }[] = [
        {
            label: 'Committed',
            value: project.committedFunding,
            color: 'bg-slate-300',
        },
        {
            label: 'Contracted',
            value: project.contractedFunding,
            color: 'bg-slate-500',
        },
        {
            label: 'Expended',
            value: project.expendedFunding,
            color: 'bg-emerald-700',
        },
        {
            label: 'Match',
            value: project.matchFunding,
            color: 'bg-sky-500',
        },
        {
            label: 'Leveraged',
            value: project.leveragedFunds,
            color: 'bg-violet-500',
        },
    ];

    return (
        <section className="rounded-md border-2 border-slate-300 bg-white p-4 md:p-5">
            <header className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {project.projectNumber || '—'}
                        {project.epicPeriod && (
                            <>
                                <span className="mx-1.5 text-slate-300">·</span>
                                {project.epicPeriod}
                            </>
                        )}
                        {project.projectStatus && (
                            <>
                                <span className="mx-1.5 text-slate-300">·</span>
                                {project.projectStatus}
                            </>
                        )}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold leading-tight text-slate-900">
                        {project.projectName ?? 'Untitled project'}
                    </h4>
                    {project.projectLead && (
                        <p className="mt-1 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">Lead:</span>{' '}
                            {project.projectLead}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close project details"
                    className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <X className="h-4 w-4" />
                </button>
            </header>

            {/* Investment area badges — branded backgrounds */}
            {(project.investmentAreas.length > 0 || project.cpucDacli) && (
                <div className="mb-5 flex flex-wrap gap-1.5">
                    {project.investmentAreas.map((area) => {
                        const c = colorForArea(area);
                        return (
                            <span
                                key={area}
                                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                                style={{
                                    background: c.bg,
                                    color: c.dot,
                                    borderColor: c.border,
                                }}
                            >
                                <span
                                    className="inline-block h-1.5 w-1.5 rounded-full"
                                    style={{ background: c.dot }}
                                />
                                {c.label || area}
                            </span>
                        );
                    })}
                    {project.cpucDacli && (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                            DAC / LI
                        </span>
                    )}
                </div>
            )}

            {/* Funding breakdown */}
            <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Funding breakdown
                </p>
                <div className="space-y-3">
                    {fundingRows.map(({ label, value, color }) => {
                        const pct = Math.min(100, (value / baseline) * 100);
                        return (
                            <div key={label}>
                                <div className="mb-1 flex items-center justify-between text-xs">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="font-medium text-slate-900">
                                        {formatMoneyShort(value)}
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${color}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3">
                <button
                    type="button"
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                >
                    View full project page
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </section>
    );
}