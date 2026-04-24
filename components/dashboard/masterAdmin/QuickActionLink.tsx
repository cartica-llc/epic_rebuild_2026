"use client"

import Link from "next/link"
import { ArrowRight, Plus, Users, UserPlus, ShieldCheck } from "lucide-react"

export interface QuickAction {
    label: string
    href: string
    icon: "plus" | "users" | "user-plus" | "shield-check"
}

const iconMap = {
    plus: Plus,
    users: Users,
    "user-plus": UserPlus,
    "shield-check": ShieldCheck,
} as const

interface QuickActionLinkProps {
    action: QuickAction
}

export function QuickActionLink({ action }: QuickActionLinkProps) {
    const Icon = iconMap[action.icon]

    return (
        <Link
            href={action.href}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200/70 transition hover:bg-slate-100 hover:ring-slate-300"
        >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
          {action.label}
      </span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
    )
}