"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import type { CognitoUser } from "@/app/(dashboard)/dashboard/master/users/config"
import { resendTemporaryPassword } from "@/app/(dashboard)/dashboard/master/users/manageUsers"
import { UserAvatar } from "./UserAvatar"
import { UserStatusBadge } from "./UserStatusBadge"
import { PaginationCompact } from "./Pagination"
import { ConfirmDialog } from "../ConfirmDialog"

interface UserMobileListProps {
    users: CognitoUser[]
    startResult: number
    endResult: number
    totalFiltered: number
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function UserMobileList({
                                   users,
                                   startResult,
                                   endResult,
                                   totalFiltered,
                                   currentPage,
                                   totalPages,
                                   onPageChange,
                               }: UserMobileListProps) {
    const [resendTarget, setResendTarget] = useState<CognitoUser | null>(null)
    const [isResending, startResend] = useTransition()
    const [resendResult, setResendResult] = useState<{ userId: string; success: boolean } | null>(null)

    function handleResend() {
        if (!resendTarget) return
        const targetId = resendTarget.id
        startResend(async () => {
            const result = await resendTemporaryPassword(targetId)
            setResendResult({ userId: targetId, success: result.success })
            setResendTarget(null)
        })
    }

    const needsResend = (user: CognitoUser) =>
        user.confirmationStatus === "Force Change Password" ||
        user.confirmationStatus === "Pending Confirmation"

    return (
        <div className="space-y-4 lg:hidden">
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/70">
                <h2 className="text-base font-semibold text-slate-900">Users</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Showing {startResult}–{endResult} of {totalFiltered}
                </p>
            </div>

            {users.length > 0 ? (
                users.map((user) => (
                    <div
                        key={user.id}
                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 gap-3">
                                <UserAvatar name={user.name} size="sm" />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        {user.name}
                                    </h3>
                                    <p className="mt-1 break-all text-xs text-slate-500">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                                {needsResend(user) && (
                                    resendResult?.userId === user.id && resendResult.success ? (
                                        <span className="px-2 py-1.5 text-xs font-medium text-emerald-600">
                                            Sent
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setResendTarget(user)}
                                            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                                        >
                                            Resend
                                        </button>
                                    )
                                )}
                                <Link
                                    href={`/dashboard/master/users/${user.id}`}
                                    className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Role</p>
                                <p className="mt-1 text-slate-800">{user.role}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Organization</p>
                                <p className="mt-1 text-slate-800">{user.organization}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Status</p>
                                <div className="mt-1">
                                    <UserStatusBadge status={user.confirmationStatus} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">
                    No users match the current filters.
                </div>
            )}

            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/70">
                <PaginationCompact
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>

            <ConfirmDialog
                open={resendTarget !== null}
                title="Resend Temporary Password"
                description={`This will send a new temporary password to ${resendTarget?.email ?? "this user"}. They will need to change it on their next sign-in.`}
                confirmLabel="Resend Password"
                loading={isResending}
                onConfirm={handleResend}
                onCancel={() => setResendTarget(null)}
            />
        </div>
    )
}