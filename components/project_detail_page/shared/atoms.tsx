// ─── components/project_details/shared/atoms.tsx ─────────────────────

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { has } from './format';

export function Chip({ l }: { l: string }) {
    return (
        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            {l}
        </span>
    );
}

export function Chips({ items }: { items?: string[] }) {
    if (!items || !items.length) {
        return <span className="text-xs italic text-slate-400">None listed</span>;
    }
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((x, i) => (x ? <Chip key={i} l={x} /> : null))}
        </div>
    );
}

/**
 * Chips that become clickable links when `hrefFor(label)` returns a URL.
 * Returns null to render a given chip as a plain (non-clickable) chip.
 */
export function LinkChips({
                              items,
                              hrefFor,
                          }: {
    items?: string[];
    hrefFor: (label: string) => string | null;
}) {
    if (!items || !items.length) {
        return <span className="text-xs italic text-slate-400">None listed</span>;
    }
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((x, i) => {
                if (!x) return null;
                const href = hrefFor(x);
                if (href) {
                    return (
                        <Link
                            key={i}
                            href={href}
                            title={`View all projects with ${x}`}
                            className="transition-opacity hover:opacity-80"
                        >
                            <Chip l={x} />
                        </Link>
                    );
                }
                return <Chip key={i} l={x} />;
            })}
        </div>
    );
}

export function Txt({
                        text,
                        n = 5,
                        ph = 'Not provided.',
                    }: {
    text?: string | null;
    n?: number;
    ph?: string;
}) {
    const [open, setOpen] = useState(false);
    if (!has(text)) {
        return <p className="text-sm italic text-slate-400">{ph}</p>;
    }
    return (
        <div>
            <p
                className={[
                    'whitespace-pre-line text-[15px] leading-[1.8] text-slate-600',
                    open ? '' : `line-clamp-${n}`,
                ].join(' ')}
            >
                {text}
            </p>
            {text && text.length > 260 && (
                <button
                    type="button"
                    onClick={() => setOpen((p) => !p)}
                    className="mt-1.5 text-[12px] font-medium text-slate-400 underline underline-offset-2 hover:text-slate-700"
                >
                    {open ? 'Collapse' : 'Read more'}
                </button>
            )}
        </div>
    );
}

export function BB({ label, on }: { label: string; on?: boolean }) {
    return (
        <div
            className={[
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold',
                on
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-slate-100 text-slate-400',
            ].join(' ')}
        >
            <span
                className={[
                    'h-1.5 w-1.5 rounded-full',
                    on ? 'bg-emerald-500' : 'bg-stone-300',
                ].join(' ')}
            />
            {label}
        </div>
    );
}

export function HR() {
    return <hr className="border-0 border-t border-slate-200" />;
}

export function STitle({ c }: { c: React.ReactNode }) {
    return (
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {c}
        </h2>
    );
}

export function FieldLabel({ c }: { c: React.ReactNode }) {
    return (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {c}
        </p>
    );
}