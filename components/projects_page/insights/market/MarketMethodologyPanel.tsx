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
                        These are derived indicators built from self-reported project
                        evidence — not official commercialization fields, and not
                        independently verified or validated by CPUC. Click to review the
                        full breakdown.
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
                        from existing self-reported data in the absence of dedicated
                        commercialization tracking fields. CPUC has not independently
                        verified these values. If your team prefers different rules, the
                        logic lives in one place on the server and can be adjusted.
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
                    Derived from development stages self-reported by the grantee, not
                    independently verified by CPUC. When a project has multiple stages,
                    the most advanced one wins.
                </p>
            </header>

            <ul className="space-y-1.5 text-[11px]">
                <RuleRow
                    label="Possible near-market"
                    swatch="#0f172a"
                    rule="TRL 9"
                />
                <RuleRow
                    label="Possible validation stage"
                    swatch="#334155"
                    rule="TRL 7–8 · Precommercial technology demonstration"
                />
                <RuleRow
                    label="Likely at Demonstration/Build stage"
                    swatch="#94a3b8"
                    rule="TRL 6 · Build/Test · Technology Demonstration"
                />
                <RuleRow
                    label="Likely at development stage"
                    swatch="#64748b"
                    rule="TRL 4–5 · Design/Engineer"
                />
                <RuleRow
                    label="Likely at Early R&D stage"
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
                    A point is added for each piece of self-reported evidence below. The
                    total is then grouped into a band — not a CPUC-verified readiness
                    determination.
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
                        band="Possible high potential"
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
 * Derived signal band (internal value → displayed copy):
 * - 4–5 = Strong        → "Possible high potential"
 * - 2–3 = Emerging       → "Emerging"
 * - 0–1 = Early          → "Early"
 *
 * The internal band values ('Strong' | 'Emerging' | 'Early') are unchanged —
 * they still drive filter query params and the SQL derivation. Only the
 * label shown to users is hedged (see shared/colors.ts SIGNAL_BAND_LABEL),
 * so this never reads as CPUC certifying a project as market-ready.
 *
 * Derived maturity mapping (internal value → displayed copy):
 * - TRL 1–3 = Early R&D                                        → "Likely at Early R&D stage"
 * - TRL 4–5 and Design/Engineer = Development                  → "Likely at development stage"
 * - TRL 6, Build/Test, Technology Demonstration
 *     = Demonstration / Build                                  → "Likely at Demonstration/Build stage"
 * - TRL 7–8 and Precommercial technology demonstration
 *     = Validation                                              → "Possible validation stage"
 * - TRL 9 = Near-Market                                        → "Possible near-market"
 * - No stage = Unstaged                                        → "Unstaged"
 *
 * As with signal band, the internal MaturityStage values are unchanged and
 * still drive the maturity query param + SQL derivation (see
 * shared/colors.ts MATURITY_STAGE_LABEL). "Near-market" and "Validation" are
 * hedged with "Possible" in the display copy because these stages are the
 * least certain — TRL 7-9 self-reported by the grantee with no independent
 * CPUC verification — while "Development", "Demonstration / Build", and
 * "Early R&D" are hedged with "Likely at ___ stage" instead, since those
 * earlier stages are more reliably inferred from the reported TRL band. In
 * all cases the copy should not read as CPUC certifying the stage.
 *
 */