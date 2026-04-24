"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import type { CognitoUser } from "@/app/(dashboard)/dashboard/master/users/config"
import { resendTemporaryPassword } from "@/app/(dashboard)/dashboard/master/users/manageUsers"
import { UserAvatar } from "./UserAvatar"
import { UserStatusBadge } from "./UserStatusBadge"
import { Pagination } from "./Pagination"
import { ConfirmDialog } from "../ConfirmDialog"

interface UserTableProps {
    users: CognitoUser[]
    startResult: number
    endResult: number
    totalFiltered: number
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function UserTable({
                              users,
                              startResult,
                              endResult,
                              totalFiltered,
                              currentPage,
                              totalPages,
                              onPageChange,
                          }: UserTableProps) {
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
        <div className="hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 lg:block">
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">Users</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Showing {startResult}–{endResult} of {totalFiltered}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-5 py-3 text-xs font-semibold">Name</th>
                        <th className="px-5 py-3 text-xs font-semibold">Email</th>
                        <th className="px-5 py-3 text-xs font-semibold">Role</th>
                        <th className="px-5 py-3 text-xs font-semibold">Organization</th>
                        <th className="px-5 py-3 text-xs font-semibold">Status</th>
                        <th className="w-[180px] px-5 py-3 text-right text-xs font-semibold">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.length > 0 ? (
                        users.map((user, idx) => (
                            <tr
                                key={user.id}
                                className={`${
                                    idx % 2 === 0 ? "bg-slate-50/60" : "bg-white"
                                } border-b border-slate-100 transition-colors hover:bg-slate-50`}
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar name={user.name} />
                                        <p className="font-medium text-slate-900">{user.name}</p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600">
                                    {user.email}
                                </td>
                                <td className="px-5 py-4">
                                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                            {user.role}
                                        </span>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600">
                                    {user.organization}
                                </td>
                                <td className="px-5 py-4">
                                    <UserStatusBadge status={user.confirmationStatus} />
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {needsResend(user) && (
                                            resendResult?.userId === user.id && resendResult.success ? (
                                                <span className="px-3 py-1.5 text-xs font-medium text-emerald-600">
                                                        Sent
                                                    </span>
                                            ) : (
                                                <button
                                                    onClick={() => setResendTarget(user)}
                                                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    Resend
                                                </button>
                                            )
                                        )}
                                        <Link
                                            href={`/dashboard/master/users/${user.id}`}
                                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-5 py-14 text-center text-sm text-slate-500"
                            >
                                No users match the current filters.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                </p>
                <Pagination
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