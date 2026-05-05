// components/projects_page/insights/map/MapProjectCard.tsx

'use client';

import { formatMoneyShort } from '../spending/shared/format';
import type { MapProject } from './shared/types';

interface MapProjectCardProps {
    project: MapProject;
    isSelected: boolean;
    onSelect: () => void;
}

export function MapProjectCard({
                                   project,
                                   isSelected,
                                   onSelect,
                               }: MapProjectCardProps) {
    const primaryArea = project.investmentAreas[0];

    return (
        <div
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={`cursor-pointer rounded-md border bg-white p-3 transition ${
                isSelected
                    ? 'border-slate-400 bg-slate-50 ring-1 ring-inset ring-slate-300'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {project.projectNumber || '—'}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold leading-tight text-slate-900">
                        {project.projectName ?? 'Untitled project'}
                    </p>
                </div>
                <span className="flex-shrink-0 text-xs font-semibold text-slate-900">
                    {formatMoneyShort(project.committedFunding)}
                </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                {primaryArea && <span>{primaryArea}</span>}
                {project.epicPeriod && (
                    <>
                        {primaryArea && <span>·</span>}
                        <span>{project.epicPeriod}</span>
                    </>
                )}
                {project.projectStatus && (
                    <>
                        <span>·</span>
                        <span>{project.projectStatus}</span>
                    </>
                )}
                {project.city && (
                    <>
                        <span>·</span>
                        <span>{project.city}</span>
                    </>
                )}
                {project.cpucDacli && (
                    <span className="ml-1 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                        <span className="inline-block h-1 w-1 rounded-full bg-amber-500" />
                        DAC / LI
                    </span>
                )}
            </div>
        </div>
    );
}