import { QuickActionLink } from "./QuickActionLink"
import type { QuickAction } from "./QuickActionLink"

interface QuickActionsProps {
    actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
                <p className="mt-1 text-sm text-slate-500">Common admin actions.</p>
            </div>

            <div className="grid gap-3">
                {actions.map((action) => (
                    <QuickActionLink key={action.href + action.label} action={action} />
                ))}
            </div>
        </div>
    )
}