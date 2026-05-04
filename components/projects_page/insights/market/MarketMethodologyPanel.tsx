// components/projects_page/insights/market/MarketMethodologyPanel.tsx

'use client';

import { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export function MarketMethodologyPanel() {
    const [open, setOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-md border border-amber-200 bg-amber-50">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-amber-100/60"
            >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-700" />
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-amber-900">
                        How maturity and signal score are calculated
                    </p>
                    <p className="hidden mt-0.5 text-[11px] text-amber-800/80">
                        These are derived indicators built from project evidence — not
                        official commercialization fields. Click to review the full breakdown.
                    </p>
                </div>
                <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-amber-700 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="border-t border-amber-200 bg-white p-4 md:p-5">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <MaturityMethodology />
                        <SignalMethodology />
                    </div>

                    <p className="hidden mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
                        These calculations were chosen to surface meaningful patterns
                        from the existing data in the absence of dedicated commercialization
                        tracking fields. If your team prefers different rules, the logic
                        lives in one place on the server and can be adjusted.
                    </p>
                </div>
            )}
        </div>
    );
}


function MaturityMethodology() {
    return (
        <section>
            <header className="mb-3">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Maturity stage
                </h5>
                <p className="mt-1 text-[11px] text-slate-500">
                    Derived from the project&rsquo;s assigned development stages. When a
                    project has multiple stages, the most advanced one wins.
                </p>
            </header>

            <ul className="space-y-1.5 text-[11px]">
                <RuleRow
                    label="Near-market"
                    swatch="#0f172a"
                    rule="TRL 9"
                />
                <RuleRow
                    label="Validation"
                    swatch="#334155"
                    rule="TRL 7–8 · Precommercial technology demonstration"
                />
                <RuleRow
                    label="Demonstration / Build"
                    swatch="#94a3b8"
                    rule="TRL 6 · Build/Test · Technology Demonstration"
                />
                <RuleRow
                    label="Development"
                    swatch="#64748b"
                    rule="TRL 4–5 · Design/Engineer"
                />
                <RuleRow
                    label="Early R&D"
                    swatch="#cbd5e1"
                    rule="TRL 1–3"
                />
                <RuleRow
                    label="Unstaged"
                    swatch="#e2e8f0"
                    rule="No development stage assigned"
                />
            </ul>
        </section>
    );
}

// ─── Signal score rules ─────────────────────────────────────────────────
function SignalMethodology() {
    return (
        <section>
            <header className="mb-3">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Signal score (0–5)
                </h5>
                <p className="mt-1 text-[11px] text-slate-500">
                    A point is added for each piece of evidence below. The total is then
                    grouped into a readiness band.
                </p>
            </header>

            {/* Inputs */}
            <div className="mb-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Inputs (+1 each)
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <PointRow text="Final report uploaded" />
                    <PointRow text="Project status indicates completion" />
                    <PointRow text="Match funding greater than zero" />
                    <PointRow text="Leveraged funds greater than zero" />
                    <PointRow text="Key learnings or scaling plan documented" />
                </ul>
            </div>

            <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Readiness bands
                </p>
                <ul className="space-y-1.5 text-[11px]">
                    <BandRow
                        band="Strong"
                        range="4–5 points"
                        color="bg-emerald-700"
                    />
                    <BandRow
                        band="Emerging"
                        range="2–3 points"
                        color="bg-amber-600"
                    />
                    <BandRow
                        band="Early"
                        range="0–1 points"
                        color="bg-slate-400"
                    />
                </ul>
            </div>
        </section>
    );
}


function RuleRow({
                     label,
                     swatch,
                     rule,
                 }: {
    label: string;
    swatch: string;
    rule: string;
}) {
    return (
        <li className="flex items-start gap-2.5">
            <span
                className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-sm ring-1 ring-inset ring-slate-300"
                style={{ backgroundColor: swatch }}
                aria-hidden="true"
            />
            <span className="flex-1">
                <span className="font-medium text-slate-800">{label}</span>
                <span className="ml-1.5 text-slate-500">— {rule}</span>
            </span>
        </li>
    );
}

function PointRow({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-800">
                +1
            </span>
            <span>{text}</span>
        </li>
    );
}

function BandRow({
                     band,
                     range,
                     color,
                 }: {
    band: string;
    range: string;
    color: string;
}) {
    return (
        <li className="flex items-center gap-2.5">
            <span
                className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${color}`}
                aria-hidden="true"
            />
            <span className="font-medium text-slate-800">{band}</span>
            <span className="text-slate-500">— {range}</span>
        </li>
    );
}


/**
 * Commercialization readiness PROXY indicators I chose.
 *
 *
 *
 *
 * Maturity is derived from:
 * - PROJECT_HAS_DEVELOPMENT_STAGE
 * - DEVELOPMENT_STAGE
 *
 * Signal score is derived as a proxy from available project evidence:
 * - FINAL_REPORT_URL present = +1
 * - PROJECT_STATUS completed = +1
 * - MATCH_FUNDING > 0 = +1
 * - LEVERAGED_FUNDS > 0 = +1
 * - GETTING_TO_SCALE or KEY_LEARNINGS populated = +1
 *
 * Derived signal band:
 * - 4–5 = Strong
 * - 2–3 = Emerging
 * - 0–1 = Early
 *
 * Derived maturity mapping:
 * - TRL 1–3 = Early R&D
 * - TRL 4–5 and Design/Engineer = Development
 * - TRL 6, Build/Test, Technology Demonstration = Demonstration / Build
 * - TRL 7–8 and Precommercial technology demonstration = Validation
 * - TRL 9 = Near-Market
 * - No stage = Unstaged
 *
 */