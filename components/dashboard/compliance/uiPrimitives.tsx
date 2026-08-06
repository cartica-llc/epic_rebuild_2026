'use client';

import React from 'react';
import {
    AlarmClock,
    AlertOctagon,
    AlertTriangle,
    Banknote,
    CalendarClock,
    CalendarX,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    FileWarning,
    Hourglass,
    Info,
    PauseCircle,
    TimerOff,
    XCircle,
} from 'lucide-react';

import {
    CADENCE_LABELS,
    CADENCE_STYLES,
} from '@/components/project_forms/StageProgressBar';

import type {
    Cadence,
    ComplianceLevel,
    ConsistencyFlag,
    ConsistencyFlagId,
    Flag,
    FlagId,
    FlagSeverity,
} from './types';

export const LEVEL_STYLES: Record<ComplianceLevel, { bg: string; text: string; ring: string; label: string }> = {
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-300', label: 'Compliant' },
    red: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-300', label: 'Incomplete' },
};

export const LEVEL_DOT: Record<ComplianceLevel, string> = {
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
};

export const LEVEL_BAR: Record<ComplianceLevel, string> = {
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
};

export const LEVEL_ICON: Record<ComplianceLevel, React.ReactNode> = {
    green: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    red: <XCircle className="h-4 w-4 text-rose-600" />,
};

export interface FlagMetaEntry {
    icon: React.ComponentType<{ className?: string }>;

    color: string;
    bg: string;
    ring: string;

    chipBg: string;
    chipText: string;
    short: string;
    label: string;
    description: string;
}

export const FLAG_META: Record<FlagId, FlagMetaEntry> = {
    'past-end-date': {
        icon: TimerOff,
        color: 'text-rose-600',
        bg: 'bg-white',
        ring: 'ring-rose-200',
        chipBg: 'bg-white ring-1 ring-inset ring-rose-200',
        chipText: 'text-rose-600',
        short: 'Past End',
        label: 'Past End Date',
        description: 'End date has passed, but the project status is not Completed.',
    },
    'no-recent-update': {
        icon: PauseCircle,
        color: 'text-amber-600',
        bg: 'bg-white',
        ring: 'ring-amber-200',
        chipBg: 'bg-white ring-1 ring-inset ring-amber-200',
        chipText: 'text-amber-600',
        short: 'Stale',
        label: 'No Recent Update',
        description: 'Pending or Active project with no modifications in 90+ days.',
    },
    'closed-incomplete': {
        icon: AlertOctagon,
        color: 'text-rose-700',
        bg: 'bg-white',
        ring: 'ring-rose-300',
        chipBg: 'bg-white ring-1 ring-inset ring-rose-300',
        chipText: 'text-rose-700',
        short: 'Closed Incomplete',
        label: 'Closed but Incomplete',
        description: 'Project is marked Completed, but required Annual or End tier fields are still missing.',
    },
    'missing-final-report': {
        icon: FileWarning,
        color: 'text-rose-700',
        bg: 'bg-white',
        ring: 'ring-rose-300',
        chipBg: 'bg-white ring-1 ring-inset ring-rose-300',
        chipText: 'text-rose-700',
        short: 'Missing Final Report',
        label: 'Missing Final Report',
        description: 'Project is marked Completed but no final report has been uploaded.',
    },
    'stalled-pending': {
        icon: Hourglass,
        color: 'text-amber-600',
        bg: 'bg-white',
        ring: 'ring-amber-200',
        chipBg: 'bg-white ring-1 ring-inset ring-amber-200',
        chipText: 'text-amber-600',
        short: 'Stalled at Pending',
        label: 'Stalled at Pending',
        description: 'Awarded 180+ days ago, but still no start date recorded.',
    },
    'approaching-deadline-stale': {
        icon: AlarmClock,
        color: 'text-rose-600',
        bg: 'bg-white',
        ring: 'ring-rose-200',
        chipBg: 'bg-white ring-1 ring-inset ring-rose-200',
        chipText: 'text-rose-600',
        short: 'Approaching Deadline',
        label: 'Approaching Deadline, Stale',
        description: 'End date within 45 days and no update in 90+ days.',
    },
};

export const CONSISTENCY_FLAG_META: Record<ConsistencyFlagId, FlagMetaEntry> = {
    'end-before-start': {
        icon: CalendarX,
        color: 'text-rose-600',
        bg: 'bg-white',
        ring: 'ring-rose-200',
        chipBg: 'bg-white ring-1 ring-inset ring-rose-200',
        chipText: 'text-rose-600',
        short: 'End Before Start',
        label: 'End Before Start',
        description: 'End date recorded earlier than the start date.',
    },
    'completed-zero-spend': {
        icon: AlertTriangle,
        color: 'text-rose-600',
        bg: 'bg-white',
        ring: 'ring-rose-200',
        chipBg: 'bg-white ring-1 ring-inset ring-rose-200',
        chipText: 'text-rose-600',
        short: '$0 Expended',
        label: 'Completed, $0 Expended',
        description: 'Status is Completed, but Funds Expended to Date is $0 or missing.',
    },
    'overspend-budget': {
        icon: CircleDollarSign,
        color: 'text-amber-600',
        bg: 'bg-white',
        ring: 'ring-amber-200',
        chipBg: 'bg-white ring-1 ring-inset ring-amber-200',
        chipText: 'text-amber-600',
        short: 'Overspend',
        label: 'Overspend vs. Budget',
        description: 'Funds Expended to Date exceeds Committed Funding.',
    },
    'award-after-start': {
        icon: CalendarClock,
        color: 'text-amber-600',
        bg: 'bg-white',
        ring: 'ring-amber-200',
        chipBg: 'bg-white ring-1 ring-inset ring-amber-200',
        chipText: 'text-amber-600',
        short: 'Award After Start',
        label: 'Award After Start',
        description: 'Award date recorded later than the start date.',
    },
    'encumbered-exceeds-committed': {
        icon: Banknote,
        color: 'text-amber-600',
        bg: 'bg-white',
        ring: 'ring-amber-200',
        chipBg: 'bg-white ring-1 ring-inset ring-amber-200',
        chipText: 'text-amber-600',
        short: 'Encumbered Exceeds',
        label: 'Encumbered Exceeds Committed',
        description: 'Encumbered Funding Amount exceeds Committed Funding.',
    },
};

export function ConsistencyFlagPill({ flag }: { flag: ConsistencyFlag }) {
    const meta = CONSISTENCY_FLAG_META[flag.id];
    const Icon = meta.icon;
    return (
        <div
            className={`flex items-start gap-2 rounded-md border border-slate-200 border-l-2 bg-white px-3 py-2 text-xs ${meta.ring.replace('ring-', 'border-l-')}`}
        >
            <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${meta.color}`} />
            <div>
                <span className={`font-semibold ${meta.color}`}>{flag.label}</span>
                <span className="ml-1.5 text-slate-600">{flag.detail}</span>
            </div>
        </div>
    );
}

function statusStyle(status: string): string {
    const k = status.trim().toLowerCase();

    if (k === 'active' || k === 'in progress' || k === 'in-progress' || k === 'ongoing') {
        return 'border border-emerald-200 bg-white text-emerald-700';
    }

    if (k === 'pending' || k === 'awarded' || k === 'approved') {
        return 'border border-amber-200 bg-white text-amber-700';
    }

    if (
        k === 'completed' ||
        k === 'complete' ||
        k === 'closed' ||
        k === 'closed-out' ||
        k === 'closeout' ||
        k === 'finished'
    ) {
        return 'border border-slate-200 bg-white text-slate-600';
    }

    if (k === 'draft' || k === 'new') {
        return 'border border-slate-200 bg-white text-slate-500';
    }

    if (
        k === 'cancelled' ||
        k === 'canceled' ||
        k === 'rejected' ||
        k === 'withdrawn' ||
        k === 'terminated'
    ) {
        return 'border border-rose-200 bg-white text-rose-700';
    }

    return 'border border-slate-200 bg-white text-slate-500';
}

export function StatusPill({ status }: { status: string }) {
    const label = status?.trim() ? status : '—';
    return (
        <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${statusStyle(label)}`}>
            {label}
        </span>
    );
}

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
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        </div>
    );
}

export function Section({
                            title,
                            description,
                            children,
                            actions,
                            padded = true,
                            collapsible = false,
                            defaultOpen = true,
                            accent,
                        }: {
    title?: string;
    description?: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
    padded?: boolean;

    collapsible?: boolean;
    defaultOpen?: boolean;

    accent?: 'indigo' | 'rose' | 'amber' | 'emerald';
}) {
    const [open, setOpen] = React.useState(defaultOpen);
    const isOpen = collapsible ? open : true;

    const accentBorder: Record<NonNullable<typeof accent>, string> = {
        indigo: 'border-l-indigo-300',
        rose: 'border-l-rose-300',
        amber: 'border-l-amber-300',
        emerald: 'border-l-emerald-300',
    };

    return (
        <section
            className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${
                accent ? `border-l-2 ${accentBorder[accent]}` : ''
            }`}
        >
            {(title || description || actions) && (
                <div
                    role={collapsible ? 'button' : undefined}
                    tabIndex={collapsible ? 0 : undefined}
                    onClick={collapsible ? () => setOpen((v) => !v) : undefined}
                    onKeyDown={
                        collapsible
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setOpen((v) => !v);
                                }
                            }
                            : undefined
                    }
                    className={`flex items-start justify-between gap-3 px-5 py-4 ${
                        isOpen ? 'border-b border-slate-100' : ''
                    } ${collapsible ? 'cursor-pointer select-none transition-colors hover:bg-slate-50' : ''}`}
                >
                    <div className="flex items-start gap-2">
                        {collapsible && (
                            <ChevronDown
                                className={`mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                        )}
                        <div>
                            {title && <h4 className="text-base font-bold tracking-tight text-slate-900">{title}</h4>}
                            {description && <p className="mt-1 text-xs text-slate-600">{description}</p>}
                        </div>
                    </div>
                    {actions && <div className="shrink-0">{actions}</div>}
                </div>
            )}
            {isOpen && <div className={padded ? 'p-5' : ''}>{children}</div>}
        </section>
    );
}

const STAT_ACCENT_STYLES: Record<
    'red' | 'green',
    { accent: string; activeBg: string; label: string; value: string; sub: string; dot: string }
> = {
    red: {
        accent: 'border-l-rose-300',
        activeBg: 'bg-rose-50/60',
        label: 'text-rose-600',
        value: 'text-slate-900',
        sub: 'text-slate-500',
        dot: 'bg-rose-500',
    },
    green: {
        accent: 'border-l-emerald-300',
        activeBg: 'bg-emerald-50/60',
        label: 'text-emerald-600',
        value: 'text-slate-900',
        sub: 'text-slate-500',
        dot: 'bg-emerald-500',
    },
};

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
    const stat = accent === 'green' ? STAT_ACCENT_STYLES.green : STAT_ACCENT_STYLES.red;

    const baseCls = `rounded-lg border border-slate-200 border-l-2 ${stat.accent} bg-white px-5 py-4 text-left shadow-sm transition ${
        active ? stat.activeBg : ''
    }`;
    const interactiveCls = onClick ? `cursor-pointer hover:shadow-md ${active ? '' : 'hover:bg-slate-50'}` : '';

    const inner = (
        <>
            <div className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${stat.dot}`} />
                <p className={`text-[11px] font-bold uppercase tracking-wider ${stat.label}`}>{label}</p>
                {help && (
                    <span
                        title={help}
                        aria-label={help}
                        className={`ml-0.5 inline-flex cursor-help transition ${stat.label} hover:text-white`}
                    >
                        <Info className="h-3 w-3" />
                    </span>
                )}
            </div>
            <p className={`mt-1.5 text-3xl font-extrabold tracking-tight ${stat.value}`}>{value}</p>
            {sub && <p className={`mt-0.5 text-[11px] font-medium ${stat.sub}`}>{sub}</p>}
        </>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} aria-pressed={active} className={`${baseCls} ${interactiveCls}`}>
                {inner}
            </button>
        );
    }

    return <div className={baseCls}>{inner}</div>;
}

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
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                    className={`h-full rounded-full transition-all ${LEVEL_BAR[level]}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showCount && (
                <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums text-slate-600">
                    {filled}/{total}
                </span>
            )}
        </div>
    );
}

type CombinedFlagItem =
    | { kind: 'operational'; id: FlagId; label: string; severity: FlagSeverity; detail: string }
    | { kind: 'consistency'; id: ConsistencyFlagId; label: string; severity: FlagSeverity; detail: string };

export function FlagChips({
                              flags,
                              consistencyFlags = [],
                          }: {
    flags: Flag[];
    consistencyFlags?: ConsistencyFlag[];
}) {
    const combined: CombinedFlagItem[] = [
        ...flags.map((f): CombinedFlagItem => ({ kind: 'operational', ...f })),
        ...consistencyFlags.map((f): CombinedFlagItem => ({ kind: 'consistency', ...f })),
    ];

    if (combined.length === 0) {
        return <span className="text-xs text-slate-300">—</span>;
    }

    const sorted = [...combined].sort((a, b) => {
        if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
        if (a.kind !== b.kind) return a.kind === 'operational' ? -1 : 1;
        return 0;
    });

    const primary = sorted[0];
    const meta = primary.kind === 'operational' ? FLAG_META[primary.id] : CONSISTENCY_FLAG_META[primary.id];
    const Icon = meta.icon;
    const overflow = sorted.length - 1;

    return (
        <div className="flex items-center gap-1">
            <span
                title={`${primary.label} — ${primary.detail}`}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${meta.chipBg} ${meta.chipText}`}
            >
                <Icon className="h-2.5 w-2.5" />
                {meta.short}
            </span>
            {overflow > 0 && (
                <span
                    title={sorted
                        .slice(1)
                        .map((f) => `${f.label}${f.kind === 'consistency' ? ' (Data Consistency)' : ''} — ${f.detail}`)
                        .join('\n')}
                    className="inline-flex items-center rounded-md bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200"
                >
                    +{overflow}
                </span>
            )}
        </div>
    );
}

export function FlagPill({ flag }: { flag: Flag }) {
    const meta = FLAG_META[flag.id];
    const Icon = meta.icon;
    return (
        <div
            className={`flex items-start gap-2 rounded-md border border-slate-200 border-l-2 bg-white px-3 py-2 text-xs ${meta.ring.replace('ring-', 'border-l-')}`}
        >
            <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${meta.color}`} />
            <div>
                <span className={`font-semibold ${meta.color}`}>{flag.label}</span>
                <span className="ml-1.5 text-slate-600">{flag.detail}</span>
            </div>
        </div>
    );
}
