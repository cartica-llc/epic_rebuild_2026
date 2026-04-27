"use client"

import { useReducer, useMemo, useCallback } from "react"
import Link from "next/link"
import type { CognitoUser } from "@/app/(dashboard)/dashboard/master/users/config"

import { UserFilters } from "./UserFilters"
import { UserTable } from "./UserTable"
import { UserMobileList } from "./UserMobileList"

const USERS_PER_PAGE = 6

interface FiltersState {
    searchTerm: string
    roleFilter: string
    orgFilter: string
    currentPage: number
}

type FiltersAction =
    | { type: "SET_SEARCH"; value: string }
    | { type: "SET_ROLE"; value: string }
    | { type: "SET_ORG"; value: string }
    | { type: "SET_PAGE"; value: number }

function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
    switch (action.type) {
        case "SET_SEARCH":
            return { ...state, searchTerm: action.value, currentPage: 1 }
        case "SET_ROLE":
            return { ...state, roleFilter: action.value, currentPage: 1 }
        case "SET_ORG":
            return { ...state, orgFilter: action.value, currentPage: 1 }
        case "SET_PAGE":
            return { ...state, currentPage: action.value }
    }
}

interface UsersPageClientProps {
    users: CognitoUser[]
    roles: string[]
    organizations: string[]
}

export function UsersPageClient({
                                    users,
                                    roles,
                                    organizations,
                                }: UsersPageClientProps) {
    const [state, dispatch] = useReducer(filtersReducer, {
        searchTerm: "",
        roleFilter: "all",
        orgFilter: "all",
        currentPage: 1,
    })

    const filteredUsers = useMemo(() => {
        const query = state.searchTerm.trim().toLowerCase()

        return users.filter((user) => {
            const matchesSearch =
                query.length === 0 ||
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)

            const matchesRole = state.roleFilter === "all" || user.role === state.roleFilter
            const matchesOrg = state.orgFilter === "all" || user.organization === state.orgFilter

            return matchesSearch && matchesRole && matchesOrg
        })
    }, [users, state.searchTerm, state.roleFilter, state.orgFilter])

    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / USERS_PER_PAGE),
    )

    const safePage = Math.min(state.currentPage, totalPages)

    const paginatedUsers = useMemo(() => {
        const start = (safePage - 1) * USERS_PER_PAGE
        return filteredUsers.slice(start, start + USERS_PER_PAGE)
    }, [filteredUsers, safePage])

    const startResult =
        filteredUsers.length === 0 ? 0 : (safePage - 1) * USERS_PER_PAGE + 1
    const endResult = Math.min(safePage * USERS_PER_PAGE, filteredUsers.length)

    const handlePageChange = useCallback(
        (page: number) => dispatch({ type: "SET_PAGE", value: page }),
        [],
    )

    return (
        <div className=" bg-slate-50 text-slate-900">
            <div className="pt-34 pb-16">
                <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="mb-1 text-xs font-medium text-slate-500">
                                    Administration
                                </p>
                                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                    User Management
                                </h1>
                            </div>

                            <Link
                                href="/dashboard/master/users/create"
                                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
                            >
                                Add New User
                            </Link>
                        </div>
                    </div>

                    <div className="mb-6">
                        <UserFilters
                            totalUsers={users.length}
                            searchTerm={state.searchTerm}
                            onSearchChange={(v) => dispatch({ type: "SET_SEARCH", value: v })}
                            roleFilter={state.roleFilter}
                            onRoleFilterChange={(v) => dispatch({ type: "SET_ROLE", value: v })}
                            roles={roles}
                            orgFilter={state.orgFilter}
                            onOrgFilterChange={(v) => dispatch({ type: "SET_ORG", value: v })}
                            organizations={organizations}
                        />
                    </div>

                    <UserTable
                        users={paginatedUsers}
                        startResult={startResult}
                        endResult={endResult}
                        totalFiltered={filteredUsers.length}
                        currentPage={safePage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />

                    <UserMobileList
                        users={paginatedUsers}
                        startResult={startResult}
                        endResult={endResult}
                        totalFiltered={filteredUsers.length}
                        currentPage={safePage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    )
}