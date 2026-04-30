// components/dashboard/compliance/uiPrimitives.tsx
'use client';

import React from 'react';
import {
    AlertOctagon,
    CheckCircle2,
    ChevronDown,
    Info,
    PauseCircle,
    TimerOff,
    XCircle,
} from 'lucide-react';

import {
    CADENCE_LABELS,
    CADENCE_STYLES,
} from '@/components/project_forms/StageProgressBar';

import type { Cadence, ComplianceLevel, Flag, FlagId } from './types';


export const LEVEL_STYLES: Record<ComplianceLevel, { bg: string; text: string; ring: string; label: string }> = {
    green: { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200', label: 'Compliant' },
    red: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', label: 'Incomplete' },
};

export const LEVEL_DOT: Record<ComplianceLevel, string> = {
    green: 'bg-teal-500',
    red: 'bg-rose-500',
};

export const LEVEL_BAR: Record<ComplianceLevel, string> = {
    green: 'bg-teal-500',
    red: 'bg-rose-400',
};

export const LEVEL_ICON: Record<ComplianceLevel, React.ReactNode> = {
    green: <CheckCircle2 className="h-4 w-4 text-teal-600" />,
    red: <XCircle className="h-4 w-4 text-rose-600" />,
};

// ── Flag styles ───────────────────────────────────────────────────────────

export const FLAG_META: Record<
    FlagId,
    { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; ring: string; short: string }
> = {
    'past-end-date': {
        icon: TimerOff,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        ring: 'ring-rose-200',
        short: 'Past End',
    },
    'no-recent-update': {
        icon: PauseCircle,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        ring: 'ring-amber-200',
        short: 'Stale',
    },
    'closed-incomplete': {
        icon: AlertOctagon,
        color: 'text-red-700',
        bg: 'bg-red-50',
        ring: 'ring-red-300',
        short: 'Closed Incomplete',
    },
};

// ── Status pill ──────────────────────────────────────────────────────────


function statusStyle(status: string): string {
    const k = status.trim().toLowerCase();

    // "in progress", "active", "ongoing"
    if (k === 'active' || k === 'in progress' || k === 'in-progress' || k === 'ongoing') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    }
    // "pending", "awarded", "approved" — awaiting work to start
    if (k === 'pending' || k === 'awarded' || k === 'approved') {
        return 'bg-amber-50 text-amber-700 ring-amber-200';
    }
    // "completed", "complete", "closed", "closed-out", "finished"
    if (
        k === 'completed' ||
        k === 'complete' ||
        k === 'closed' ||
        k === 'closed-out' ||
        k === 'closeout' ||
        k === 'finished'
    ) {
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
    // "draft", "new"
    if (k === 'draft' || k === 'new') {
        return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
    // "cancelled", "rejected", "withdrawn", "terminated"
    if (
        k === 'cancelled' ||
        k === 'canceled' ||
        k === 'rejected' ||
        k === 'withdrawn' ||
        k === 'terminated'
    ) {
        return 'bg-rose-50 text-rose-700 ring-rose-200';
    }
    // Unknown — neutral
    return 'bg-slate-100 text-slate-600 ring-slate-200';
}

export function StatusPill({ status }: { status: string }) {
    const label = status?.trim() ? status : '—';
    return (
        <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${statusStyle(label)}`}
        >
            {label}
        </span>
    );
}

// ── Cadence badge — uses styles from project_forms ───────────────────────

export function CadenceBadge({ cadence }: { cadence: Cadence }) {
    return (
        <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                CADENCE_STYLES[cadence] ?? CADENCE_STYLES['if-needed']
            }`}
        >
            {CADENCE_LABELS[cadence] ?? cadence}
        </span>
    );
}

// ── Filter select ────────────────────────────────────────────────────────

export function FilterSelect({
                                 value,
                                 onChange,
                                 options,
                                 'aria-label': ariaLabel,
                             }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    'aria-label'?: string;
}) {
    return (
        <div className="relative">
            <select
                aria-label={ariaLabel}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>
    );
}

// ── Section ──────────────────────────────────────────────────────────────

export function Section({
                            title,
                            description,
                            children,
                            actions,
                            padded = true,
                        }: {
    title?: string;
    description?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    padded?: boolean;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white">
            {(title || description || actions) && (
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
                    <div>
                        {title && <h4 className="text-sm font-semibold text-slate-900">{title}</h4>}
                        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
                    </div>
                    {actions && <div className="shrink-0">{actions}</div>}
                </div>
            )}
            <div className={padded ? 'p-5' : ''}>{children}</div>
        </section>
    );
}

// ── Summary stat card (compact, with optional help tooltip and click action) ─────────────

export function StatCard({
                             label,
                             value,
                             sub,
                             accent,
                             help,
                             onClick,
                             active = false,
                         }: {
    label: string;
    value: string;
    sub?: string;
    accent?: ComplianceLevel | 'flag';
    help?: string;
    onClick?: () => void;
    active?: boolean;
}) {
    const dotColor =
        accent === 'flag'
            ? 'bg-rose-500'
            : accent
                ? LEVEL_DOT[accent]
                : 'bg-slate-300';


    const activeRing =
        accent === 'flag'
            ? 'ring-rose-300'
            : accent === 'green'
                ? 'ring-teal-300'
                : accent === 'red'
                    ? 'ring-rose-300'
                    : 'ring-slate-300';

    const baseCls = 'rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition';
    const interactiveCls = onClick
        ? `cursor-pointer hover:border-slate-300 hover:shadow-sm ${active ? `ring-2 ring-inset ${activeRing}` : ''}`
        : '';

    const inner = (
        <>
            <div className="flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
                {help && (
                    <span
                        title={help}
                        aria-label={help}
                        className="ml-0.5 inline-flex cursor-help text-slate-300 transition hover:text-slate-500"
                    >
                        <Info className="h-3 w-3" />
                    </span>
                )}
            </div>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
        </>
    );

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-pressed={active}
                className={`${baseCls} ${interactiveCls}`}
            >
                {inner}
            </button>
        );
    }

    return <div className={baseCls}>{inner}</div>;
}

// ── Compliance bar ───────────────────────────────────────────────────────

export function ComplianceBar({
                                  filled,
                                  total,
                                  level,
                                  showCount = true,
                              }: {
    filled: number;
    total: number;
    level: ComplianceLevel;
    showCount?: boolean;
}) {
    const pct = total > 0 ? (filled / total) * 100 : 100;
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                    className={`h-full rounded-full transition-all ${LEVEL_BAR[level]}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showCount && (
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-500">
                    {filled}/{total}
                </span>
            )}
        </div>
    );
}

// ── Flag chip (compact, with overflow) ───────────────────────────────────

export function FlagChips({ flags }: { flags: Flag[] }) {
    if (flags.length === 0) {
        return <span className="text-xs text-slate-300">—</span>;
    }

    // Critical flags first
    const sorted = [...flags].sort((a, b) =>
        a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1,
    );
    const primary = sorted[0];
    const meta = FLAG_META[primary.id];
    const Icon = meta.icon;
    const overflow = sorted.length - 1;

    return (
        <div className="flex items-center gap-1">
            <span
                title={primary.detail}
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${meta.bg} ${meta.color} ${meta.ring}`}
            >
                <Icon className="h-2.5 w-2.5" />
                {meta.short}
            </span>
            {overflow > 0 && (
                <span
                    title={sorted
                        .slice(1)
                        .map((f) => `${f.label} — ${f.detail}`)
                        .join('\n')}
                    className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
                >
                    +{overflow}
                </span>
            )}
        </div>
    );
}

// Full flag pill — used inside the drill-down where space allows
export function FlagPill({ flag }: { flag: Flag }) {
    const meta = FLAG_META[flag.id];
    const Icon = meta.icon;
    return (
        <div className={`flex items-start gap-2 rounded-md px-2.5 py-1.5 text-xs ring-1 ring-inset ${meta.bg} ${meta.ring}`}>
            <Icon className={`mt-0.5 h-3 w-3 shrink-0 ${meta.color}`} />
            <div>
                <span className={`font-semibold ${meta.color}`}>{flag.label}</span>
                <span className="ml-1.5 text-slate-600">{flag.detail}</span>
            </div>
        </div>
    );
}