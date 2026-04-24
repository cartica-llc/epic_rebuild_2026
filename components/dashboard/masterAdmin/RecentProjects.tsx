"use client"

import Link from "next/link"
import { FolderKanban } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import type { ProjectStatus } from "./StatusBadge"

export interface RecentProject {
    id: string
    name: string
    createdAt: string
    status: ProjectStatus
    href: string
}

interface RecentProjectsProps {
    projects: RecentProject[]
}

export function RecentProjects({ projects }: RecentProjectsProps) {
    if (projects.length === 0) {
        return (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 md:p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderKanban className="h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">No projects yet.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 md:p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        Recent Created Projects
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Most recently added projects.
                    </p>
                </div>
                <FolderKanban className="h-5 w-5 text-slate-400" />
            </div>

            <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-3 py-3 text-xs font-semibold">Project Name</th>
                        <th className="px-3 py-3 text-xs font-semibold">Created</th>
                        <th className="px-3 py-3 text-xs font-semibold">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {projects.map((project, idx) => (
                        <tr
                            key={project.id}
                            className={`${
                                idx % 2 === 0 ? "bg-slate-50/60" : "bg-white"
                            } border-b border-slate-100 transition-colors hover:bg-slate-50`}
                        >
                            <td className="px-3 py-3">
                                <Link
                                    href={project.href}
                                    className="font-medium text-slate-800 hover:text-slate-950"
                                >
                                    {project.name}
                                </Link>
                            </td>
                            <td className="px-3 py-3 text-slate-600">{project.createdAt}</td>
                            <td className="px-3 py-3">
                                <StatusBadge status={project.status} />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}