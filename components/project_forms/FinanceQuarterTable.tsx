// ─── components/project_forms/FinanceQuarterTable.tsx ────────────────
// Quarterly finance records table for the Finance tab.
//
// Used by both the create and edit screens so the quarterly finance table
// only has to be maintained in one place.
//
// Edit mode (projectId provided):
// - Loads and saves data through the financeQuarters API.
// - The current quarter is stored in FINANCE_DETAIL.
// - Previous quarters are stored in FINANCE_DETAIL_HISTORY.
// - If a newer quarter is added, the current record is moved to history.
//   Older quarters are added directly to history.
//
// Create mode (value + onChange):
// - Quarters are kept in the form until the project is created.
// - On save, the newest quarter becomes the current record and the rest
//   are saved as history.
//
// Duplicate quarters are not allowed in either mode.
// MATCH_FUNDING_SPLIT is calculated automatically and displayed as read-only.
// The value is also recalculated by the API when the data is saved.

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Eye, X, PlusCircle, CheckCircle2, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { Field, SectionDivider } from './FormPrimitives';
import { CurrencyInput } from './FinanceInputs';
import type { FinanceQuarter, QuarterFormState, QuarterInput } from './types';
import { EMPTY_QUARTER_FORM } from './types';

// ─── Period helpers ───────────────────────────────────────────────────

function getCalendarQuarter() {
    const now = new Date();
    return { quarter: Math.floor(now.getMonth() / 3) + 1, year: now.getFullYear() };
}
function qKey(q: number | null, y: number | null) { return `${y}-Q${q}`; }
function qLabel(q: number | null, y: number | null) {
    return q == null || y == null ? 'No quarter set' : `Q${q} ${y}`;
}
function periodKey(y: number | null, q: number | null) { return (y ?? 0) * 4 + (q ?? 0); }

/** Selectable quarters: two years back through the CURRENT calendar quarter.
 *  Future quarters are intentionally not offered — an accidental future entry
 *  would become the project's current record and lock out corrections. */
function generateQuarterOptions() {
    const { quarter: cq, year: cy } = getCalendarQuarter();
    const opts: { quarter: number; year: number }[] = [];
    for (let i = -8; i <= 0; i++) {
        let q = cq + i, y = cy;
        while (q <= 0) { q += 4; y--; }
        while (q > 4) { q -= 4; y++; }
        opts.push({ quarter: q, year: y });
    }
    return opts;
}

// ─── Value helpers ────────────────────────────────────────────────────

function fmtMoney(v: string): string {
    const n = parseFloat(v);
    if (!Number.isFinite(n)) return '';
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

export function computeMatchSplit(matchFunding: string, committed: string): number | null {
    const m = parseFloat(String(matchFunding).replace(/[$,]/g, ''));
    const c = parseFloat(String(committed).replace(/[$,]/g, ''));
    if (!Number.isFinite(m) || !Number.isFinite(c) || m + c === 0) return null;
    return m / (m + c);
}

function quarterToForm(q: FinanceQuarter): QuarterFormState {
    return {
        committedFundingAmt: q.committedFundingAmt,
        encumberedFunding: q.encumberedFunding,
        fundsExpended: q.fundsExpended,
        adminAndOverheadCost: q.adminAndOverheadCost,
        matchFunding: q.matchFunding,
        contractAmount: q.contractAmount,
        leveragedFunds: q.leveragedFunds,
    };
}

/** LOCAL mode: staged QuarterInput[] → display records (newest = "current"). */
function localToRecords(value: QuarterInput[]): FinanceQuarter[] {
    const sorted = [...value].sort(
        (a, b) => periodKey(b.reportingYear, b.reportingQuarter) - periodKey(a.reportingYear, a.reportingQuarter),
    );
    return sorted.map((q, i) => {
        const split = computeMatchSplit(q.matchFunding, q.committedFundingAmt);
        return {
            source: i === 0 ? 'current' as const : 'history' as const,
            historyId: null,
            reportingYear: q.reportingYear,
            reportingQuarter: q.reportingQuarter,
            committedFundingAmt: q.committedFundingAmt,
            encumberedFunding: q.encumberedFunding,
            fundsExpended: q.fundsExpended,
            adminAndOverheadCost: q.adminAndOverheadCost,
            matchFunding: q.matchFunding,
            contractAmount: q.contractAmount,
            leveragedFunds: q.leveragedFunds,
            matchFundingSplit: split !== null ? split.toFixed(6) : '',
        };
    });
}

// ─── Shared quarterly form fields (Add + Edit) ────────────────────────

function QuarterFormFields({ f, set }: {
    f: QuarterFormState;
    set: (k: keyof QuarterFormState) => (v: string) => void;
}) {
    const half = 'w-full sm:w-[calc(50%-10px)]';
    const split = computeMatchSplit(f.matchFunding, f.committedFundingAmt);
    return (
        <>
            <SectionDivider title="Dollar Amounts" />
            <div className="flex flex-wrap gap-x-5 gap-y-5">
                <div className={half}>
                    <Field label="Committed funding amount" tooltip="Funds dedicated by administrators to this project." span="full">
                        <CurrencyInput value={f.committedFundingAmt} onChange={set('committedFundingAmt')} placeholder="1,500,000.00" />
                    </Field>
                </div>
                <div className={half}>
                    <Field label="Encumbered funding" tooltip="Funds dedicated to an executed contract." span="full">
                        <CurrencyInput value={f.encumberedFunding} onChange={set('encumberedFunding')} placeholder="750,000.00" />
                    </Field>
                </div>
                <div className={half}>
                    <Field label="Expended to date" tooltip="Funds paid to contractors or spent internally through the end of this quarter." span="full">
                        <CurrencyInput value={f.fundsExpended} onChange={set('fundsExpended')} placeholder="250,000.00" />
                    </Field>
                </div>
                <div className={half}>
                    <Field label="Admin & overhead cost" tooltip="Total administrative and overhead costs for the grant or contract recipient." span="full">
                        <CurrencyInput value={f.adminAndOverheadCost} onChange={set('adminAndOverheadCost')} placeholder="50,000.00" />
                    </Field>
                </div>
                <div className={half}>
                    <Field label="Contract amount" tooltip="Total contract amount for this EPIC project." span="full">
                        <CurrencyInput value={f.contractAmount} onChange={set('contractAmount')} placeholder="1,200,000.00" />
                    </Field>
                </div>
                <div className={half}>
                    <Field label="Leveraged funds" tooltip="Funds attracted from federal agencies or external parties to further develop the concept." span="full">
                        <CurrencyInput value={f.leveragedFunds} onChange={set('leveragedFunds')} placeholder="300,000.00" />
                    </Field>
                </div>
            </div>

            <SectionDivider title="Match Funding" />
            <div className="flex flex-wrap gap-x-5 gap-y-5">
                <div className={half}>
                    <Field label="Match funding" tooltip="Total committed match funding by match funding partners for this quarter." span="full">
                        <CurrencyInput value={f.matchFunding} onChange={set('matchFunding')} placeholder="500,000.00" />
                    </Field>
                </div>
                <div className={half}>
                    <Field label="Match funding split" tooltip="Auto-calculated: match funding ÷ (match funding + committed funding). Recomputed on save." span="full">
                        <div>
                            <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                <input
                                    readOnly
                                    className="flex-1 h-10 px-3 text-sm bg-slate-50 outline-none tabular-nums text-slate-500 cursor-default min-w-0"
                                    value={split !== null ? split.toFixed(4) : ''}
                                    placeholder="Enter match & committed funding"
                                />
                                <span className="inline-flex items-center px-3 border-l border-slate-200 bg-slate-100 text-sm font-medium shrink-0 min-w-[72px] justify-center tabular-nums text-slate-500">
                                    {split !== null ? `${(split * 100).toFixed(2)}%` : '–%'}
                                </span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                                Match ÷ (Match + Committed) · updates automatically
                            </p>
                        </div>
                    </Field>
                </div>
            </div>
        </>
    );
}

// ─── Read-only detail view ────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-sm text-slate-900 font-mono tabular-nums">
                {value || <span className="text-slate-300 font-sans">—</span>}
            </span>
        </div>
    );
}

function QuarterViewFields({ rec }: { rec: FinanceQuarter }) {
    const half = 'w-full sm:w-[calc(50%-10px)]';
    const money = (v: string) => (fmtMoney(v) ? `$${fmtMoney(v)}` : '');
    const splitNum = parseFloat(rec.matchFundingSplit);
    return (
        <>
            <SectionDivider title="Dollar Amounts" />
            <div className="flex flex-wrap gap-x-5 gap-y-4">
                <div className={half}><DetailRow label="Committed funding amount" value={money(rec.committedFundingAmt)} /></div>
                <div className={half}><DetailRow label="Encumbered funding" value={money(rec.encumberedFunding)} /></div>
                <div className={half}><DetailRow label="Expended to date" value={money(rec.fundsExpended)} /></div>
                <div className={half}><DetailRow label="Admin & overhead cost" value={money(rec.adminAndOverheadCost)} /></div>
                <div className={half}><DetailRow label="Contract amount" value={money(rec.contractAmount)} /></div>
                <div className={half}><DetailRow label="Leveraged funds" value={money(rec.leveragedFunds)} /></div>
            </div>
            <SectionDivider title="Match Funding" />
            <div className="flex flex-wrap gap-x-5 gap-y-4">
                <div className={half}><DetailRow label="Match funding" value={money(rec.matchFunding)} /></div>
                <div className={half}>
                    <DetailRow
                        label="Match funding split"
                        value={Number.isFinite(splitNum) ? `${splitNum.toFixed(4)} (${(splitNum * 100).toFixed(2)}%)` : ''}
                    />
                </div>
            </div>
        </>
    );
}

// ─── Modal shell ──────────────────────────────────────────────────────

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" />
            <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
                {children}
            </div>
        </div>
    );
}

function ModalHeader({ title, badge, actions }: {
    title: string; badge?: React.ReactNode; actions: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 rounded-t-xl shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
                {badge}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
        </div>
    );
}

// ─── Add Quarter modal ────────────────────────────────────────────────

function AddQuarterModal({ existingKeys, saving, error, onClose, onSave }: {
    existingKeys: Set<string>;
    saving: boolean;
    error: string | null;
    onClose: () => void;
    onSave: (year: number, quarter: number, f: QuarterFormState) => void;
}) {
    const { quarter: cq, year: cy } = getCalendarQuarter();
    const allOpts = generateQuarterOptions();
    const freeOpts = allOpts.filter((o) => !existingKeys.has(qKey(o.quarter, o.year)));
    const defaultOpt =
        freeOpts.find((o) => o.quarter === cq && o.year === cy) ??
        freeOpts[freeOpts.length - 1] ?? null;

    const [selQ, setSelQ] = useState(defaultOpt?.quarter ?? cq);
    const [selY, setSelY] = useState(defaultOpt?.year ?? cy);
    const [f, setF] = useState<QuarterFormState>(EMPTY_QUARTER_FORM);
    const set = (k: keyof QuarterFormState) => (v: string) => setF((prev) => ({ ...prev, [k]: v }));

    return (
        <ModalShell onClose={onClose}>
            <ModalHeader
                title="Add Quarter"
                badge={
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/25">
                        {qLabel(selQ, selY)}
                    </span>
                }
                actions={
                    <button type="button" onClick={onClose}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors">
                        <X size={14} />
                    </button>
                }
            />
            <div className="overflow-y-auto flex-1 px-6 py-5">
                <Field label="Quarter" tooltip="Reporting period for this record. Quarters that already have a record are not listed." span="full">
                    <div className="relative w-52">
                        <select
                            className="w-full h-10 pl-3 pr-9 text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 bg-white text-slate-900 appearance-none outline-none cursor-pointer transition-all"
                            value={`${selY}-${selQ}`}
                            onChange={(e) => {
                                const [y, q] = e.target.value.split('-').map(Number);
                                setSelY(y); setSelQ(q);
                            }}
                        >
                            {freeOpts.map((o) => (
                                <option key={qKey(o.quarter, o.year)} value={`${o.year}-${o.quarter}`}>
                                    {qLabel(o.quarter, o.year)}{o.quarter === cq && o.year === cy ? ' (current)' : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {freeOpts.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">All selectable quarters already have records.</p>
                    )}
                </Field>

                <QuarterFormFields f={f} set={set} />

                {error && (
                    <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                    <button type="button" onClick={onClose}
                            className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button type="button" disabled={saving || freeOpts.length === 0}
                            onClick={() => onSave(selY, selQ, f)}
                            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                        Submit {qLabel(selQ, selY)}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ─── View / Edit modal ────────────────────────────────────────────────

function QuarterRecordModal({ rec, initialMode, saving, error, onClose, onSave, onDelete }: {
    rec: FinanceQuarter;
    initialMode: 'view' | 'edit';
    saving: boolean;
    error: string | null;
    onClose: () => void;
    onSave: (rec: FinanceQuarter, f: QuarterFormState) => void;
    /** Present only when this record is deletable (prior quarters / staged rows). */
    onDelete?: (rec: FinanceQuarter) => void;
}) {
    const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
    const [f, setF] = useState<QuarterFormState>(() => quarterToForm(rec));
    const set = (k: keyof QuarterFormState) => (v: string) => setF((prev) => ({ ...prev, [k]: v }));

    return (
        <ModalShell onClose={onClose}>
            <ModalHeader
                title={qLabel(rec.reportingQuarter, rec.reportingYear)}
                badge={
                    <span className="text-[10px] font-semibold bg-white/10 text-slate-300 rounded px-2 py-0.5 uppercase tracking-widest">
                        {rec.source === 'current' ? 'Current Quarter' : 'Prior Quarter'}
                    </span>
                }
                actions={
                    <>
                        <button type="button"
                                onClick={() => setMode((m) => (m === 'view' ? 'edit' : 'view'))}
                                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/20">
                            {mode === 'view' ? <><Pencil size={10} /> Edit</> : <><Eye size={10} /> View</>}
                        </button>
                        {onDelete && (
                            <button type="button"
                                    onClick={() => onDelete(rec)}
                                    title={`Delete ${qLabel(rec.reportingQuarter, rec.reportingYear)}`}
                                    className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-red-500 text-white text-xs font-medium transition-colors border !border-red-400 cursor-pointer">
                                <Trash2 size={10} /> Delete
                            </button>
                        )}
                        <button type="button" onClick={onClose}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors">
                            <X size={14} />
                        </button>
                    </>
                }
            />
            <div className="overflow-y-auto flex-1 px-6 py-5">
                {mode === 'view' ? <QuarterViewFields rec={rec} /> : <QuarterFormFields f={f} set={set} />}

                {error && mode === 'edit' && (
                    <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}

                {mode === 'edit' && (
                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                        <button type="button" onClick={() => setMode('view')}
                                className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button type="button" disabled={saving}
                                onClick={() => onSave(rec, f)}
                                className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Update {qLabel(rec.reportingQuarter, rec.reportingYear)}
                        </button>
                    </div>
                )}
            </div>
        </ModalShell>
    );
}

// ─── Delete confirmation modal ────────────────────────────────────────

function DeleteQuarterModal({ rec, restoreTo, saving, error, onClose, onConfirm }: {
    rec: FinanceQuarter;
    /** When deleting the CURRENT quarter: label of the history quarter that will take its place. */
    restoreTo: string | null;
    saving: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: (rec: FinanceQuarter) => void;
}) {
    const isCurrent = rec.source === 'current';
    return (
        <ModalShell onClose={onClose}>
            <ModalHeader
                title={`Delete ${qLabel(rec.reportingQuarter, rec.reportingYear)}`}
                badge={
                    <span className="text-[10px] font-semibold bg-white/10 text-slate-300 rounded px-2 py-0.5 uppercase tracking-widest">
                        {isCurrent ? 'Current Quarter' : 'Prior Quarter'}
                    </span>
                }
                actions={
                    <button type="button" onClick={onClose}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors">
                        <X size={14} />
                    </button>
                }
            />
            <div className="px-6 py-5">
                {isCurrent ? (
                    <p className="text-sm text-slate-600 leading-relaxed">
                        This removes the{' '}
                        <span className="font-semibold text-slate-900">{qLabel(rec.reportingQuarter, rec.reportingYear)}</span>{' '}
                        record and restores{' '}
                        <span className="font-semibold text-slate-900">{restoreTo ?? 'the most recent prior quarter'}</span>{' '}
                        as the current quarter. Use this to undo a quarter added by mistake. This cannot be undone.
                    </p>
                ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                        This permanently removes the{' '}
                        <span className="font-semibold text-slate-900">{qLabel(rec.reportingQuarter, rec.reportingYear)}</span>{' '}
                        record from this project&apos;s finance history. This cannot be undone.
                    </p>
                )}

                {error && (
                    <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                    <button type="button" onClick={onClose}
                            className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button type="button" disabled={saving}
                            onClick={() => onConfirm(rec)}
                            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete {qLabel(rec.reportingQuarter, rec.reportingYear)}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ─── Main table ───────────────────────────────────────────────────────

type ModalState =
    | { type: 'add' }
    | { type: 'view' | 'edit' | 'delete'; rec: FinanceQuarter };

export function FinanceQuarterTable({ projectId, value, onChange }: {
    /** SERVER mode: set in edit mode / project detail pages. */
    projectId?: number | null;
    /** LOCAL mode (create form): staged quarters + change handler. */
    value?: QuarterInput[];
    onChange?: (quarters: QuarterInput[]) => void;
}) {
    const serverMode = projectId != null;

    const [serverQuarters, setServerQuarters] = useState<FinanceQuarter[]>([]);
    const [loading, setLoading] = useState(serverMode);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const apiUrl = `/api/projectEdit/${projectId}/financeQuarters`;

    // The effect performs ONLY async work — every setState happens after an
    // await, never synchronously in the effect body (react-hooks/set-state-in-effect).
    // Re-loads are triggered by bumping reloadKey from event handlers, where
    // synchronous setState is allowed.
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!serverMode) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(apiUrl);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? 'Failed to load quarterly records');
                if (!cancelled) {
                    setServerQuarters(json.quarters ?? []);
                    setLoadError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load quarterly records');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [apiUrl, serverMode, reloadKey]);

    const reload = useCallback(() => {
        setLoading(true);
        setLoadError(null);
        setReloadKey((k) => k + 1);
    }, []);

    const quarters: FinanceQuarter[] = serverMode ? serverQuarters : localToRecords(value ?? []);

    const existingKeys = new Set(
        quarters
            .filter((q) => q.reportingYear != null && q.reportingQuarter != null)
            .map((q) => qKey(q.reportingQuarter, q.reportingYear)),
    );

    // ── Add ──
    async function handleAdd(year: number, quarter: number, f: QuarterFormState) {
        if (!serverMode) {
            if (existingKeys.has(qKey(quarter, year))) {
                setSaveError(`A record for Q${quarter} ${year} already exists.`);
                return;
            }
            onChange?.([...(value ?? []), { reportingYear: year, reportingQuarter: quarter, ...f }]);
            setModal(null);
            setSaveError(null);
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportingYear: year, reportingQuarter: quarter, ...f }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Failed to add quarter');
            setModal(null);
            reload();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to add quarter');
        } finally {
            setSaving(false);
        }
    }

    // ── Delete ──
    // Server mode: history rows are removed; deleting the CURRENT quarter
    // restores the newest history row into FINANCE_DETAIL (undo for a
    // quarter added by mistake) — allowed only when history exists.
    // Local mode: any staged row can be removed.
    const hasHistory = quarters.some((q) => q.source === 'history');
    const newestHistory = quarters.find((q) => q.source === 'history') ?? null;

    async function handleDelete(rec: FinanceQuarter) {
        if (!serverMode) {
            onChange?.((value ?? []).filter((q) =>
                !(q.reportingYear === rec.reportingYear && q.reportingQuarter === rec.reportingQuarter)));
            setModal(null);
            setSaveError(null);
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rec.source === 'current'
                    ? { target: 'current' }
                    : { target: 'history', historyId: rec.historyId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Failed to delete quarter');
            setModal(null);
            reload();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to delete quarter');
        } finally {
            setSaving(false);
        }
    }

    // ── Update ──
    async function handleUpdate(rec: FinanceQuarter, f: QuarterFormState) {
        if (!serverMode) {
            onChange?.((value ?? []).map((q) =>
                q.reportingYear === rec.reportingYear && q.reportingQuarter === rec.reportingQuarter
                    ? { reportingYear: q.reportingYear, reportingQuarter: q.reportingQuarter, ...f }
                    : q,
            ));
            setModal(null);
            setSaveError(null);
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target: rec.source,
                    historyId: rec.historyId,
                    ...f,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Failed to update quarter');
            setModal(null);
            reload();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to update quarter');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full">
            {modal?.type === 'add' && (
                <AddQuarterModal
                    existingKeys={existingKeys}
                    saving={saving}
                    error={saveError}
                    onClose={() => { setModal(null); setSaveError(null); }}
                    onSave={handleAdd}
                />
            )}
            {modal?.type === 'delete' && (
                <DeleteQuarterModal
                    rec={modal.rec}
                    restoreTo={newestHistory ? qLabel(newestHistory.reportingQuarter, newestHistory.reportingYear) : null}
                    saving={saving}
                    error={saveError}
                    onClose={() => { setModal(null); setSaveError(null); }}
                    onConfirm={handleDelete}
                />
            )}
            {(modal?.type === 'view' || modal?.type === 'edit') && (
                <QuarterRecordModal
                    key={`${modal.rec.source}-${modal.rec.historyId}-${qKey(modal.rec.reportingQuarter, modal.rec.reportingYear)}`}
                    rec={modal.rec}
                    initialMode={modal.type}
                    saving={saving}
                    error={saveError}
                    onClose={() => { setModal(null); setSaveError(null); }}
                    onSave={handleUpdate}
                    // Deletable: any staged row in create mode; in server mode,
                    // prior quarters always, and the current quarter only when
                    // history exists to restore in its place.
                    onDelete={(!serverMode || modal.rec.source === 'history' || hasHistory)
                        ? (rec) => { setSaveError(null); setModal({ type: 'delete', rec }); }
                        : undefined}
                />
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Quarterly Records</h3>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                            {serverMode
                                ? 'Newest first · one record per quarter · adding a newer quarter moves the current record to history'
                                : 'Newest first · one record per quarter · saved with the project when you submit the form'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-100 rounded px-2 py-1">
                            {quarters.length} {quarters.length === 1 ? 'record' : 'records'}
                        </span>
                        <button type="button" onClick={() => { setSaveError(null); setModal({ type: 'add' }); }}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors">
                            <PlusCircle size={13} /> Add Quarter
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex items-center justify-center text-slate-400 text-sm gap-2">
                        <Loader2 size={16} className="animate-spin" /> Loading quarterly records…
                    </div>
                ) : loadError ? (
                    <div className="py-10 px-6 text-center">
                        <p className="text-sm text-red-600">{loadError}</p>
                        <button type="button" onClick={reload}
                                className="mt-3 h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                            Retry
                        </button>
                    </div>
                ) : quarters.length === 0 ? (
                    <div className="py-14 px-6 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 mb-3">
                            <PlusCircle size={18} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">No quarterly records yet</p>
                        <p className="text-xs text-slate-400 mt-1">Click &ldquo;Add Quarter&ldquo; to create the first record.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[960px]">
                            <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                {['Quarter', 'Committed', 'Encumbered', 'Expended', 'Admin / OH', 'Contract', 'Leveraged', 'Match', 'Match %', ''].map((h, i) => (
                                    <th key={i} className={`py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 ${i === 0 ? 'text-left' : i < 9 ? 'text-right' : ''}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {quarters.map((rec) => {
                                const splitNum = parseFloat(rec.matchFundingSplit);
                                return (
                                    <tr key={`${rec.source}-${rec.historyId}-${qKey(rec.reportingQuarter, rec.reportingYear)}`}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                    <span className="font-semibold tabular-nums text-slate-800">
                                                        {qLabel(rec.reportingQuarter, rec.reportingYear)}
                                                    </span>
                                                {rec.source === 'current' && (
                                                    <span className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 shrink-0">
                                                            Current
                                                        </span>
                                                )}
                                            </div>
                                        </td>
                                        {[rec.committedFundingAmt, rec.encumberedFunding, rec.fundsExpended,
                                            rec.adminAndOverheadCost, rec.contractAmount, rec.leveragedFunds, rec.matchFunding].map((val, ci) => (
                                            <td key={ci} className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-600">
                                                {fmtMoney(val) ? `$${fmtMoney(val)}` : <span className="text-slate-300">—</span>}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-600">
                                            {Number.isFinite(splitNum)
                                                ? `${(splitNum * 100).toFixed(2)}%`
                                                : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button type="button" onClick={() => { setSaveError(null); setModal({ type: 'view', rec }); }}
                                                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                                                    <Eye size={10} /> View
                                                </button>
                                                <button type="button" onClick={() => { setSaveError(null); setModal({ type: 'edit', rec }); }}
                                                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                                                    <Pencil size={10} /> Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}