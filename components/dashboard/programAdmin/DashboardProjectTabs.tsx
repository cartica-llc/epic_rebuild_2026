// components/dashboard/program_admin/DashboardProjectTabs.tsx

'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { DashboardProject } from './types';

function formatDateOnly(dateStr: string | null): string {
    if (!dateStr) return '—';

    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return '—';

    const [, year, month, day] = match;

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const m = parseInt(month, 10) - 1;

    return `${months[m]} ${parseInt(day, 10)}, ${year}`;
}

function useIsClient() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
}

function LocalTime({ dateStr }: { dateStr: string | null }) {
    const isClient = useIsClient();

    if (!isClient || !dateStr) return null;

    const d = new Date(dateStr);

    if (isNaN(d.getTime())) return null;

    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;

    const tz =
        new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
            .formatToParts(d)
            .find((p) => p.type === 'timeZoneName')?.value ?? '';

    return (
        <span className="text-slate-400">
            {' '}
            {h12}:{m} {ampm} {tz}
        </span>
    );
}

interface ProjectTableProps {
    projects: DashboardProject[];
    emptyMessage: string;
    hideStatus?: boolean;
}

function ProjectTable({ projects, emptyMessage, hideStatus = false }: ProjectTableProps) {
    if (projects.length === 0) {
        return <div className="py-12 text-center text-sm text-slate-400">{emptyMessage}</div>;
    }

    return (
        <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
                <colgroup>
                    <col className={hideStatus ? 'w-[27%]' : 'w-[22%]'} />
                    <col className={hideStatus ? 'w-[35%]' : 'w-[30%]'} />

                    {!hideStatus && <col className="w-[18%]" />}

                    <col className={hideStatus ? 'w-[23%]' : 'w-[20%]'} />
                    <col className={hideStatus ? 'w-[15%]' : 'w-[10%]'} />
                </colgroup>

                <thead>
                <tr className="border-b border-slate-200">
                    <th className="px-2 py-3 text-xs font-semibold text-slate-500">
                        <span className="block truncate">Project Number</span>
                    </th>

                    <th className="px-2 py-3 text-xs font-semibold text-slate-500">
                        <span className="block truncate">Project Name</span>
                    </th>

                    {!hideStatus && (
                        <th className="px-2 py-3 text-xs font-semibold text-slate-500">
                            <span className="block truncate">Status</span>
                        </th>
                    )}

                    <th className="px-2 py-3 text-xs font-semibold text-slate-500">
                        <span className="block truncate">Last Modified</span>
                    </th>

                    <th className="px-2 py-3 text-right text-xs font-semibold text-slate-500">
                        <span className="block truncate">Actions</span>
                    </th>
                </tr>
                </thead>

                <tbody>
                {projects.map((project, idx) => (
                    <tr
                        key={project.projectId}
                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                            idx % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                    >
                        <td className="min-w-0 px-2 py-3 font-mono text-xs font-medium text-slate-900">
                            <Link
                                href={`/projects/${project.projectId}`}
                                className="block truncate hover:text-slate-600 hover:underline"
                                title={project.projectNumber}
                            >
                                {project.projectNumber}
                            </Link>
                        </td>

                        <td className="min-w-0 px-2 py-3">
                            <Link
                                href={`/projects/${project.projectId}`}
                                className="block truncate font-medium text-slate-700 hover:text-slate-950"
                                title={project.projectName}
                            >
                                {project.projectName}
                            </Link>
                        </td>

                        {!hideStatus && (
                            <td className="min-w-0 px-2 py-3">
                                    <span
                                        className={`block truncate rounded-full px-2 py-0.5 text-center text-xs font-medium ${
                                            project.isActive
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}
                                        title={project.projectStatus || (project.isActive ? 'Active' : 'Inactive')}
                                    >
                                        {project.projectStatus || (project.isActive ? 'Active' : 'Inactive')}
                                    </span>
                            </td>
                        )}

                        <td className="min-w-0 px-2 py-3 text-xs text-slate-500">
                                <span
                                    className="block truncate"
                                    title={formatDateOnly(project.modifiedDate)}
                                >
                                    {formatDateOnly(project.modifiedDate)}
                                </span>

                            <span className="hidden sm:inline">
                                    <LocalTime dateStr={project.modifiedDate} />
                                </span>
                        </td>

                        <td className="min-w-0 px-2 py-3 text-right">
                            <Link
                                href={`/projects/${project.projectId}/edit`}
                                className="inline-flex max-w-full items-center justify-center rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                                title={`Edit ${project.projectName}`}
                            >
                                <span className="block truncate">Edit</span>
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

interface Props {
    activeProjects: DashboardProject[];
    inactiveProjects: DashboardProject[];
}

export function DashboardProjectTabs({ activeProjects, inactiveProjects }: Props) {
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

    const tabs = [
        { id: 'active' as const, label: 'Recently Added', count: activeProjects.length },
        { id: 'inactive' as const, label: 'Unpublished', count: inactiveProjects.length },
    ];

    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 pt-4 sm:px-5 sm:pt-5">
                <div className="flex min-w-0 gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex min-w-0 items-center gap-1.5 rounded-t-lg px-3 py-2.5 text-sm font-medium transition-colors sm:gap-2 sm:px-4 ${
                                activeTab === tab.id
                                    ? 'border-b-2 border-slate-900 text-slate-900'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <span className="truncate">{tab.label}</span>

                            {tab.count > 0 && (
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        activeTab === tab.id
                                            ? tab.id === 'inactive'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-slate-100 text-slate-700'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-1 sm:p-2">
                {activeTab === 'active' ? (
                    <ProjectTable
                        projects={activeProjects}
                        emptyMessage="No active projects found."
                    />
                ) : (
                    <>
                        <div className="mx-2 mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
                            <svg className="h-3.5 w-3.5 shrink-0 text-amber-500" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                <path
                                    d="M8 5v3M8 10.5v.01"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <span className="min-w-0">
                                These projects are not visible to the public on the portfolio website.
                            </span>
                        </div>

                        <ProjectTable
                            projects={inactiveProjects}
                            emptyMessage="No unpublished projects."
                            hideStatus
                        />
                    </>
                )}
            </div>
        </div>
    );
}