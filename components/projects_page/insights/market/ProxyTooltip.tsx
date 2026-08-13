// components/projects_page/insights/market/ProxyTooltip.tsx

'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface ProxyTooltipProps {
    explanation: string;
    factors?: string[];
}

export function ProxyTooltip({ explanation, factors }: ProxyTooltipProps) {
    const [open, setOpen] = useState(false);

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                aria-label="About this proxy indicator"
                className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700"
            >
                <Info className="h-3.5 w-3.5" />
            </button>

            {open && (
                <span
                    role="tooltip"
                    className="absolute left-1/2 top-full z-20 mt-1.5 w-64 -translate-x-1/2 rounded-md border border-slate-200 bg-white p-3 text-left text-[11px] leading-relaxed text-slate-600 shadow-lg"
                >
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Proxy indicator
                    </span>
                    <span className="block text-slate-700">{explanation}</span>
                    {factors && factors.length > 0 && (
                        <ul className="mt-1.5 list-disc pl-4 text-slate-500">
                            {factors.map((f) => (
                                <li key={f}>{f}</li>
                            ))}
                        </ul>
                    )}
                </span>
            )}
        </span>
    );
}

export const SIGNAL_PROXY_EXPLANATION = {
    explanation:
        'A 0-5 score derived from project evidence as self-reported by the grantee — not an official commercialization field, and not independently verified or validated by CPUC.',
    factors: [
        'Final report present',
        'Project status indicates completion',
        'Has match funding',
        'Has leveraged funds',
        'Key learnings or scaling plan documented',
    ],
};

export const MATURITY_PROXY_EXPLANATION = {
    explanation:
        'Derived from development stages (TRL levels and stage names) self-reported by the grantee — not independently verified or validated by CPUC. The most advanced stage wins when multiple are assigned.',
    factors: [
        'TRL 9 → Likely near-market',
        'TRL 7-8 + Precommercial → Likely validation stage',
        'TRL 6 + Build/Test + Demonstration → Demonstration / Build',
        'TRL 4-5 + Design/Engineer → Development',
        'TRL 1-3 → Early R&D',
    ],
};