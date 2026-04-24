"use client"

import { useEffect, useRef } from "react"

interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmLabel: string
    cancelLabel?: string
    variant?: "danger" | "default"
    loading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
                                  open,
                                  title,
                                  description,
                                  confirmLabel,
                                  cancelLabel = "Cancel",
                                  variant = "default",
                                  loading = false,
                                  onConfirm,
                                  onCancel,
                              }: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (open && !dialog.open) {
            dialog.showModal()
        } else if (!open && dialog.open) {
            dialog.close()
        }
    }, [open])

    const confirmClasses =
        variant === "danger"
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-slate-900 text-white hover:bg-slate-800"

    return (
        <dialog
            ref={dialogRef}
            onClose={onCancel}
            className="m-auto w-full max-w-md rounded-2xl bg-white p-0 shadow-xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
        >
            <div className="p-6">
                <h3 className="text-base font-semibold text-slate-900">
                    {title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{description}</p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition disabled:opacity-50 ${confirmClasses}`}
                    >
                        {loading ? "Please wait..." : confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    )
}