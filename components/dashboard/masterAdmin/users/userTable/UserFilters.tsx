"use client"

import { ChevronDown } from "lucide-react"

interface UserFiltersProps {
    totalUsers: number
    searchTerm: string
    onSearchChange: (value: string) => void
    roleFilter: string
    onRoleFilterChange: (value: string) => void
    roles: string[]
    orgFilter: string
    onOrgFilterChange: (value: string) => void
    organizations: string[]
}

export function UserFilters({
                                totalUsers,
                                searchTerm,
                                onSearchChange,
                                roleFilter,
                                onRoleFilterChange,
                                roles,
                                orgFilter,
                                onOrgFilterChange,
                                organizations,
                            }: UserFiltersProps) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                    <p className="text-xs font-medium text-slate-500">Total Users</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {totalUsers}
                    </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_260px]">
                    <div>
                        <label
                            htmlFor="user-search"
                            className="mb-2 block text-xs font-medium text-slate-500"
                        >
                            Search User
                        </label>
                        <input
                            id="user-search"
                            type="text"
                            placeholder="Search by name or email"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full appearance-none rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/70 outline-none transition focus:ring-2 focus:ring-slate-300"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="role-filter"
                            className="mb-2 block text-xs font-medium text-slate-500"
                        >
                            Role
                        </label>
                        <div className="relative">
                            <select
                                id="role-filter"
                                value={roleFilter}
                                onChange={(e) => onRoleFilterChange(e.target.value)}
                                className="w-full appearance-none rounded-xl bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 outline-none transition focus:ring-2 focus:ring-slate-300"
                            >
                                <option value="all">All roles</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="org-filter"
                            className="mb-2 block text-xs font-medium text-slate-500"
                        >
                            Organization
                        </label>
                        <div className="relative">
                            <select
                                id="org-filter"
                                value={orgFilter}
                                onChange={(e) => onOrgFilterChange(e.target.value)}
                                className="w-full appearance-none rounded-xl bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 outline-none transition focus:ring-2 focus:ring-slate-300"
                            >
                                <option value="all">All organizations</option>
                                {organizations.map((org) => (
                                    <option key={org} value={org}>
                                        {org}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}