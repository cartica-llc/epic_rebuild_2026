"use client"

import { useReducer, useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { ConfirmDialog } from "@/components/dashboard/masterAdmin/users/ConfirmDialog"
import { UserStatusBadge } from "@/components/dashboard/masterAdmin/users/userTable/UserStatusBadge"
import type { CognitoUser, UserFormData } from "@/app/(dashboard)/dashboard/master/users/config"


interface UserFormProps {
    mode: "create" | "edit"
    roles: string[]
    organizations: string[]
    initialData?: CognitoUser
    onSubmit: (data: UserFormData) => Promise<{ success: boolean; error?: string }>
    onDelete?: () => Promise<{ success: boolean; error?: string }>
    onResend?: () => Promise<{ success: boolean; error?: string }>
    onResetPassword?: () => Promise<{ success: boolean; error?: string }>
}

interface FormState {
    name: string
    email: string
    role: string
    organization: string
    error: string | null
}

type FormAction =
    | { type: "SET_FIELD"; field: keyof UserFormData; value: string }
    | { type: "SET_ERROR"; error: string | null }

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.field]: action.value, error: null }
        case "SET_ERROR":
            return { ...state, error: action.error }
    }
}

export function UserForm({
                             mode,
                             roles,
                             organizations,
                             initialData,
                             onSubmit,
                             onDelete,
                             onResend,
                             onResetPassword,
                         }: UserFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isDeleting, startDelete] = useTransition()
    const [isResending, startResend] = useTransition()
    const [isResetting, startReset] = useTransition()

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showResendDialog, setShowResendDialog] = useState(false)
    const [showResetDialog, setShowResetDialog] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)

    const [state, dispatch] = useReducer(formReducer, {
        name: initialData?.name ?? "",
        email: initialData?.email ?? "",
        role: initialData?.role ?? roles[0] ?? "",
        organization: initialData?.organization ?? organizations[0] ?? "",
        error: null,
    })

    function handleChange(field: keyof UserFormData, value: string) {
        dispatch({ type: "SET_FIELD", field, value })
    }

    function handleSubmit() {
        if (!state.name.trim() || !state.email.trim()) {
            dispatch({ type: "SET_ERROR", error: "Name and email are required." })
            return
        }

        startTransition(async () => {
            const result = await onSubmit({
                name: state.name.trim(),
                email: state.email.trim(),
                role: state.role,
                organization: state.organization,
            })

            if (result.success) {
                router.push("/dashboard/master/users")
            } else {
                dispatch({ type: "SET_ERROR", error: result.error ?? "Something went wrong." })
            }
        })
    }

    function handleDelete() {
        if (!onDelete) return
        startDelete(async () => {
            const result = await onDelete()
            if (result.success) {
                router.push("/dashboard/master/users")
            } else {
                dispatch({ type: "SET_ERROR", error: result.error ?? "Failed to delete user." })
                setShowDeleteDialog(false)
            }
        })
    }

    function handleResend() {
        if (!onResend) return
        startResend(async () => {
            const result = await onResend()
            setShowResendDialog(false)
            if (result.success) {
                setResendSuccess(true)
                dispatch({ type: "SET_ERROR", error: null })
            } else {
                dispatch({ type: "SET_ERROR", error: result.error ?? "Failed to resend password." })
            }
        })
    }

    function handleResetPassword() {
        if (!onResetPassword) return
        startReset(async () => {
            const result = await onResetPassword()
            setShowResetDialog(false)
            if (result.success) {
                setResetSuccess(true)
                dispatch({ type: "SET_ERROR", error: null })
            } else {
                dispatch({ type: "SET_ERROR", error: result.error ?? "Failed to reset password." })
            }
        })
    }

    const title = mode === "create" ? "Add New User" : "Edit User"
    const subtitle =
        mode === "create"
            ? "The user will receive a temporary password via email."
            : "Update user details and role assignment."

    const confirmationStatus = initialData?.confirmationStatus
    const showResendOption =
        mode === "edit" &&
        onResend &&
        (confirmationStatus === "Force Change Password" ||
            confirmationStatus === "Pending Confirmation")

    return (
        <div className="bg-slate-50 text-slate-900">
            <div className="pt-24 pb-16">
                <div className="mx-auto max-w-2xl px-4 sm:px-6">
                    <div className="mb-8">
                        <p className="mb-1 text-xs font-medium text-slate-500">
                            Administration
                        </p>
                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
                    </div>

                    {state.error && (
                        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/70">
                            {state.error}
                        </div>
                    )}

                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
                        <div className="p-6">
                            <div className="grid gap-5">
                                <div>
                                    <label
                                        htmlFor="user-name"
                                        className="mb-2 block text-xs font-medium text-slate-500"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="user-name"
                                        type="text"
                                        placeholder="e.g. Jordan Ramirez"
                                        value={state.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/70 outline-none transition focus:ring-2 focus:ring-slate-300"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="user-email"
                                        className="mb-2 block text-xs font-medium text-slate-500"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        id="user-email"
                                        type="email"
                                        placeholder="e.g. jordan@example.com"
                                        value={state.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        disabled={mode === "edit"}
                                        className="w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/70 outline-none transition focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                    {mode === "edit" && (
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Email cannot be changed after creation.
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="user-role"
                                            className="mb-2 block text-xs font-medium text-slate-500"
                                        >
                                            Role
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="user-role"
                                                value={state.role}
                                                onChange={(e) => handleChange("role", e.target.value)}
                                                className="w-full appearance-none rounded-xl bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 outline-none transition focus:ring-2 focus:ring-slate-300"
                                            >
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
                                            htmlFor="user-org"
                                            className="mb-2 block text-xs font-medium text-slate-500"
                                        >
                                            Organization
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="user-org"
                                                value={state.organization}
                                                onChange={(e) => handleChange("organization", e.target.value)}
                                                className="w-full appearance-none rounded-xl bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 outline-none transition focus:ring-2 focus:ring-slate-300"
                                            >
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

                        {/* Account Status — edit mode only */}
                        {mode === "edit" && confirmationStatus && (
                            <div className="border-t border-slate-100 px-6 py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs font-medium text-slate-500">Account Status</p>
                                        <UserStatusBadge status={confirmationStatus} />
                                    </div>

                                    {showResendOption && (
                                        resendSuccess ? (
                                            <span className="text-xs font-medium text-emerald-600">
                                                Password resent
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => setShowResendDialog(true)}
                                                disabled={isResending}
                                                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                                            >
                                                Resend Temporary Password
                                            </button>
                                        )
                                    )}

                                    {confirmationStatus === "Confirmed" && onResetPassword && (
                                        resetSuccess ? (
                                            <span className="text-xs font-medium text-emerald-600">
                                                Password reset email sent
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => setShowResetDialog(true)}
                                                disabled={isResetting}
                                                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                                            >
                                                Reset Password
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions footer */}
                        <div className="border-t border-slate-100 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/dashboard/master/users"
                                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        Cancel
                                    </Link>

                                    {mode === "edit" && onDelete && (
                                        <button
                                            onClick={() => setShowDeleteDialog(true)}
                                            className="rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete User
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isPending
                                        ? mode === "create"
                                            ? "Creating..."
                                            : "Saving..."
                                        : mode === "create"
                                            ? "Create User"
                                            : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            {onDelete && (
                <ConfirmDialog
                    open={showDeleteDialog}
                    title="Delete User"
                    description={`Are you sure you want to permanently delete ${initialData?.name ?? "this user"}? This will remove their account, group memberships, and all associated data. This action cannot be undone.`}
                    confirmLabel="Yes, Delete User"
                    variant="danger"
                    loading={isDeleting}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            )}

            {onResend && (
                <ConfirmDialog
                    open={showResendDialog}
                    title="Resend Temporary Password"
                    description={`This will send a new temporary password to ${initialData?.email ?? "this user"}. The user will need to change it on their next sign-in.`}
                    confirmLabel="Resend Password"
                    loading={isResending}
                    onConfirm={handleResend}
                    onCancel={() => setShowResendDialog(false)}
                />
            )}

            {onResetPassword && (
                <ConfirmDialog
                    open={showResetDialog}
                    title="Reset Password"
                    description={`This will send a password reset code to ${initialData?.email ?? "this user"}. They will need to use the code to set a new password.`}
                    confirmLabel="Send Reset Code"
                    loading={isResetting}
                    onConfirm={handleResetPassword}
                    onCancel={() => setShowResetDialog(false)}
                />
            )}
        </div>
    )
}