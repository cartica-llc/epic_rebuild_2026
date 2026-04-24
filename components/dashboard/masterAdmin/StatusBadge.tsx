export type ProjectStatus = "Active" | "Review" | "Published"

const statusStyles: Record<ProjectStatus, string> = {
    Published: "bg-emerald-50 text-emerald-700",
    Review: "bg-amber-50 text-amber-700",
    Active: "bg-slate-100 text-slate-700",
}

interface StatusBadgeProps {
    status: ProjectStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
        >
      {status}
    </span>
    )
}