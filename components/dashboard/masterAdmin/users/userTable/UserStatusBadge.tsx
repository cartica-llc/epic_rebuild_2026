import type { ConfirmationStatus } from "@/app/(dashboard)/dashboard/master/users/config"


const statusStyles: Record<ConfirmationStatus, string> = {
    "Confirmed": "bg-emerald-50 text-emerald-700",
    "Pending Confirmation": "bg-amber-50 text-amber-700",
    "Force Change Password": "bg-blue-50 text-blue-700",
    "Reset Required": "bg-orange-50 text-orange-700",
    "Unknown": "bg-slate-100 text-slate-500",
}

interface UserStatusBadgeProps {
    status: ConfirmationStatus
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
        >
            {status}
        </span>
    )
}