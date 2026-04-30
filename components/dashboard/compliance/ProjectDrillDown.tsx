// components/dashboard/compliance/ProjectDrillDown.tsx
'use client';

import React from 'react';
import { CalendarCheck, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

import { STAGE_REQUIREMENTS } from './fieldRequirements';
import {
    applicableStages,
    daysAgoLabel,
    daysBetween,
    formatDate,
    isCompletedStatus,
    stageCompliance,
} from './helpers';
import type { EnrichedProject } from './types';
import { CadenceBadge, ComplianceBar, FlagPill } from './uiPrimitives';

export function ProjectDrillDown({ project, today }: { project: EnrichedProject; today: Date }) {
    const stages = applicableStages(project.projectStatus);

    return (
        <div className="space-y-3 pt-1">

            {(project.flags.length > 0 || project.endDate || project.lastUpdate) && (
                <div className="space-y-2">
                    {project.flags.length > 0 && (
                        <div className="space-y-1.5">
                            {project.flags.map((flag) => (
                                <FlagPill key={flag.id} flag={flag} />
                            ))}
                        </div>
                    )}

                    {(project.endDate || project.lastUpdate) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                            {project.endDate && (
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarCheck className="h-3 w-3 text-slate-400" />
                                    End:{' '}
                                    <span className="font-medium text-slate-700">
                                        {formatDate(project.endDate)}
                                    </span>
                                    {!isCompletedStatus(project.projectStatus) &&
                                        daysBetween(project.endDate, today) > 0 && (
                                            <span className="font-semibold text-rose-600">
                                                ({daysBetween(project.endDate, today)}d overdue)
                                            </span>
                                        )}
                                </span>
                            )}
                            {project.lastUpdate && (
                                <span className="inline-flex items-center gap-1.5">
                                    <RefreshCw className="h-3 w-3 text-slate-400" />
                                    Updated:{' '}
                                    <span className="font-medium text-slate-700">
                                        {daysAgoLabel(project.lastUpdate, today)}
                                    </span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {stages.map((sName) => {
                const stageDef = STAGE_REQUIREMENTS.find((s) => s.stage === sName)!;
                const { filled, total, missing, complete } = stageCompliance(project, stageDef);

                if (complete) {
                    return (
                        <div
                            key={sName}
                            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px]"
                        >
                            <CheckCircle2 className="h-4 w-4 text-teal-600" />
                            <span className="font-semibold text-slate-700">{sName}</span>
                            <span className="text-slate-500">— all {total} fields complete</span>
                        </div>
                    );
                }

                // Use 'red' for the bar since stage is incomplete
                return (
                    <div
                        key={sName}
                        className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <XCircle className="h-4 w-4 text-rose-600" />
                                <span className="text-xs font-semibold text-slate-800">{sName} stage</span>
                                <span className="text-[11px] text-slate-500">— {missing.length} missing</span>
                            </div>
                            <span className="font-mono text-[11px] tabular-nums text-slate-500">
                                {filled}/{total}
                            </span>
                        </div>

                        <ComplianceBar filled={filled} total={total} level="red" showCount={false} />

                        <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {missing.map((field) => (
                                <li
                                    key={field.key}
                                    className="flex items-center gap-2 text-[11px] text-slate-700"
                                >
                                    <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                                    <span className="flex-1 truncate">{field.label}</span>
                                    <CadenceBadge cadence={field.cadence} />
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}