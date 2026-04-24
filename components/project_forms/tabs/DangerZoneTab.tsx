// ─── components/project_forms/tabs/DangerZoneTab.tsx ─────────────────
// Permanent project deletion with preview + type-to confirm.


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AlertTriangle, ChevronDown, ChevronRight, Loader2, Trash2, Image as ImageIcon, FileText, Database } from 'lucide-react';
import { DeleteOverlay, type DeleteOverlayState } from '../Deleteoverlay';
import { ConfirmDialog } from '@/components/dashboard/masterAdmin/users/ConfirmDialog';

interface DangerZoneTabProps {
    projectId: string | number;
    projectNumber: string;
    projectName: string;
}

interface TableCount {
    table: string;
    keyedBy: string;
    count: number;
}

interface S3Probe {
    ok: boolean;
    count: number;
    note?: string;
}

interface Manifest {
    project: {
        id: number;
        number: string | null;
        detailId: number | null;
        financeId: number | null;
        metricId: number | null;
    };
    tables: TableCount[];
    images: S3Probe;
    finalReport: S3Probe & { key: string | null; isLegacy: boolean };
    warnings: string[];
    totalRows: number;
}

// ─── Friendly summary derivation ─────────────────────────────────────
// Roll the raw table counts up into human-readable categories. A line is
// only included when there's actually something to show, so "empty" projects
// don't get noisy "0 related records" messages.

interface FriendlySummary {
    hasProjectData: boolean;
    images: number;
    imagesOk: boolean;
    hasReport: boolean;
    reportOk: boolean;
    reportIsLegacy: boolean;
}

const PARENT_TABLES = new Set(['PROJECT', 'PROJECT_DETAIL', 'FINANCE_DETAIL', 'PROJECT_METRIC']);

function buildFriendlySummary(m: Manifest): FriendlySummary {
    // "hasProjectData" covers everything the user entered via the form —
    // parent tables (the main records), junction tables (the multi-selects),
    // and anything else the DB tracked. If the project exists at all, this
    // is almost always true.
    const hasProjectData =
        m.tables.some((t) => PARENT_TABLES.has(t.table) && t.count > 0) ||
        m.tables.some((t) => !PARENT_TABLES.has(t.table) && t.count > 0);

    return {
        hasProjectData,
        images: m.images.count,
        imagesOk: m.images.ok,
        hasReport: m.finalReport.count > 0 && !m.finalReport.isLegacy,
        reportOk: m.finalReport.ok,
        reportIsLegacy: m.finalReport.isLegacy,
    };
}

export function DangerZoneTab({ projectId, projectNumber, projectName }: DangerZoneTabProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const groups: string[] = (session?.user as { groups?: string[] } | undefined)?.groups ?? [];
    const isMaster = groups.includes('MasterAdmin');

    // Project numbers are stored and used in lowercase throughout the system
    // (S3 keys, DB lookups). Always display and compare in lowercase so the
    // user sees the canonical form.
    const displayNumber = projectNumber.toLowerCase();

    const [manifest, setManifest] = useState<Manifest | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [showTechnical, setShowTechnical] = useState(false);

    const [confirmText, setConfirmText] = useState('');
    const [deleteOverlay, setDeleteOverlay] = useState<DeleteOverlayState>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // Convenience flag — treat the overlay being in any non-null state as
    // "a delete is in flight or needs dismissal". Prevents the button from
    // re-firing while the overlay is up.
    const deleting = deleteOverlay?.phase === 'deleting';

    // ── Fetch preview on mount ────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        fetch(`/api/projectDelete/${projectId}`)
            .then(async (r) => {
                const body = await r.json();
                if (!r.ok) throw new Error(body.error ?? `Preview failed (${r.status})`);
                return body as Manifest;
            })
            .then((m) => {
                if (!cancelled) setManifest(m);
            })
            .catch((err) => {
                if (!cancelled) setPreviewError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (!cancelled) setPreviewLoading(false);
            });

        return () => { cancelled = true; };
    }, [projectId]);

    const normalizedTyped = confirmText.trim().toLowerCase();
    const normalizedTarget = displayNumber.trim();
    const textMatches = normalizedTarget.length > 0 && normalizedTyped === normalizedTarget;
    const previewClean = !!manifest && manifest.warnings.length === 0 && !previewError;
    const canDelete = textMatches && previewClean && !deleting;

    const handleDelete = async () => {
        if (!canDelete) return;
        setShowConfirm(false);
        setDeleteOverlay({ phase: 'deleting' });

        try {
            const res = await fetch(`/api/projectDelete/${projectId}`, { method: 'DELETE' });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error ?? `Delete failed (${res.status})`);

            if (body.s3Errors?.length) {
                console.warn('[DangerZone] S3 cleanup partial failure:', body.s3Errors);
            }

            // Show the success state briefly, then navigate. Matches the
            // SaveOverlay's "Redirecting to project page…" timing (2.8s) so
            // users get the same reassuring beat.
            setDeleteOverlay({
                phase: 'success',
                projectName,
                projectNumber: displayNumber,
            });

            setTimeout(() => {
                router.push('/projects');
                router.refresh();
            }, 2800);
        } catch (err) {
            setDeleteOverlay({
                phase: 'error',
                message: err instanceof Error ? err.message : String(err),
            });
        }
    };

    // ── Derived state for rendering ───────────────────────────────────
    const summary = manifest ? buildFriendlySummary(manifest) : null;
    const hasAnyError = previewError !== null || (manifest?.warnings.length ?? 0) > 0;

    return (
        <div className="grid grid-cols-1 gap-y-6">
            {/* ── Warning header ──────────────────────────────────────── */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-900">
                            Permanently delete this project
                        </h3>
                        <p className="mt-1 text-sm text-red-800">
                            This will permanently remove <span className="font-semibold">{projectName || 'this project'}</span>
                            {' '}(<span className="font-mono">{displayNumber}</span>), including all of its data, uploaded images, and the final report if one exists. This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Friendly summary panel ──────────────────────────────── */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h4 className="text-sm font-semibold text-slate-800">
                    What will be removed
                </h4>

                {previewLoading && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking what needs to be removed&hellip;
                    </div>
                )}

                {/* ── Error path ─────────────────────────────────────── */}
                {hasAnyError && !previewLoading && (
                    <>
                        {isMaster ? (
                            // MasterAdmin sees the actual error(s)
                            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div className="text-sm">
                                        <div className="font-medium text-amber-900">Something went wrong during the safety check.</div>
                                        {previewError && (
                                            <p className="mt-1 text-xs text-amber-800">{previewError}</p>
                                        )}
                                        {manifest?.warnings && manifest.warnings.length > 0 && (
                                            <ul className="mt-1 list-disc ml-4 space-y-0.5 text-amber-800">
                                                {manifest.warnings.map((w, i) => (
                                                    <li key={i} className="text-xs">{w}</li>
                                                ))}
                                            </ul>
                                        )}
                                        <p className="mt-2 text-xs text-amber-700">
                                            Delete is blocked until this is resolved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // ProgramAdmin sees a friendly "ask an admin" message
                            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div className="text-sm text-amber-900">
                                        <div className="font-medium">We couldn&apos;t verify this project is safe to delete.</div>
                                        <p className="mt-1 text-amber-800">
                                            Please contact an administrator to delete this project on your behalf.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── Happy path — plain-language consequences ──────── */}
                {!hasAnyError && summary && (
                    <div className="mt-3 space-y-2">
                        {summary.hasProjectData && (
                            <SummaryLine
                                icon={<Database className="h-4 w-4 text-slate-400" />}
                                label="Everything entered in this project's form"
                            />
                        )}

                        {summary.imagesOk && summary.images > 0 && (
                            <SummaryLine
                                icon={<ImageIcon className="h-4 w-4 text-slate-400" />}
                                label={summary.images === 1 ? '1 uploaded image' : `${summary.images} uploaded images`}
                            />
                        )}

                        {summary.hasReport && summary.reportOk && (
                            <SummaryLine
                                icon={<FileText className="h-4 w-4 text-slate-400" />}
                                label="The uploaded final report"
                            />
                        )}

                        {summary.reportIsLegacy && (
                            <SummaryLine
                                icon={<FileText className="h-4 w-4 text-slate-400" />}
                                label="The link to the final report (the file itself will stay in storage)"
                                muted
                            />
                        )}

                        {/* Empty project fallback */}
                        {!summary.hasProjectData &&
                            summary.images === 0 &&
                            !summary.hasReport &&
                            !summary.reportIsLegacy && (
                                <p className="text-sm text-slate-500">This project has no saved information or files.</p>
                            )}
                    </div>
                )}

                {/* ── Finality reminder ──────────────────────────────── */}
                {previewClean && !previewLoading && summary && (
                    <div className="mt-4 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-slate-500" />
                        <span>Once deleted, none of this can be recovered.</span>
                    </div>
                )}

                {/* ── MasterAdmin-only technical details toggle ──────── */}
                {isMaster && manifest && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowTechnical((v) => !v)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                        >
                            {showTechnical ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            {showTechnical ? 'Hide' : 'Show'} technical details
                        </button>

                        {showTechnical && (
                            <div className="mt-3 space-y-1.5">
                                {manifest.tables.map((t) => (
                                    <div key={t.table} className="flex items-center justify-between text-xs">
                                        <span className="font-mono text-slate-600">{t.table}</span>
                                        <span className={
                                            t.count < 0
                                                ? 'text-red-600 font-medium'
                                                : t.count === 0
                                                    ? 'text-slate-400'
                                                    : 'text-slate-700 font-medium'
                                        }>
                                            {t.count < 0 ? 'error' : t.count === 0 ? 'none' : `${t.count} row${t.count !== 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-600">S3 images</span>
                                        <span className={!manifest.images.ok ? 'text-red-600 font-medium' : manifest.images.count === 0 ? 'text-slate-400' : 'text-slate-700 font-medium'}>
                                            {!manifest.images.ok ? 'access error' : manifest.images.count === 0 ? 'none' : `${manifest.images.count} file${manifest.images.count !== 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-600">Final report</span>
                                        <span className={
                                            !manifest.finalReport.ok
                                                ? 'text-red-600 font-medium'
                                                : manifest.finalReport.isLegacy
                                                    ? 'text-amber-600 font-medium'
                                                    : manifest.finalReport.count === 0
                                                        ? 'text-slate-400'
                                                        : 'text-slate-700 font-medium'
                                        }>
                                            {!manifest.finalReport.ok
                                                ? 'access error'
                                                : manifest.finalReport.isLegacy
                                                    ? 'legacy — will stay in S3'
                                                    : manifest.finalReport.count === 0
                                                        ? 'none'
                                                        : `${manifest.finalReport.count} file${manifest.finalReport.count !== 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-2 mt-2 border-t border-slate-100 text-xs text-slate-500">
                                    Total database rows: {manifest.totalRows}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Type-to-confirm ─────────────────────────────────────── */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">
                <label className="block text-sm font-medium text-slate-700">
                    To confirm, type the project number{' '}
                    <span className="font-mono font-semibold text-slate-900">{displayNumber}</span>{' '}
                    below:
                </label>
                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={displayNumber}
                    autoComplete="off"
                    disabled={deleting || !previewClean}
                    className="mt-2 w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50 disabled:text-slate-400"
                />

                <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    disabled={!canDelete}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {deleting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting&hellip;
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4" />
                            Delete permanently
                        </>
                    )}
                </button>

                {/* Subtle hint explaining why the button is disabled */}
                {!previewClean && !previewLoading && (
                    <p className="mt-2 text-xs text-slate-500">
                        {hasAnyError
                            ? isMaster
                                ? 'Resolve the issue above before deleting.'
                                : 'Delete is unavailable until an administrator can assist.'
                            : 'Waiting for safety check to complete…'}
                    </p>
                )}
            </div>

            {/* Full-screen overlay: deleting → deleted → failed.
                Rendered via portal so it covers everything regardless of
                where this tab sits in the tree. */}
            <DeleteOverlay
                state={deleteOverlay}
                onDismissError={() => setDeleteOverlay(null)}
            />

            {/* Final "are you sure?" confirmation. Reached only after the
                user has typed the project number and the preview came back
                clean, so at this point all the safety gates are satisfied —
                this is purely a "brake pedal" to catch accidental clicks.
                The description repeats the name + number so there's no
                ambiguity about which project is about to go. */}
            <ConfirmDialog
                open={showConfirm}
                title="Delete this project?"
                description={`You're about to permanently delete ${projectName || 'this project'} (${displayNumber}). All of its data, uploaded images, and the final report will be removed. This cannot be undone.`}
                confirmLabel="Yes, delete permanently"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}

// ─── Small presentational helpers ────────────────────────────────────

function SummaryLine({ icon, label, muted = false }: { icon: React.ReactNode; label: string; muted?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            {icon}
            <span className={muted ? 'text-sm text-slate-500' : 'text-sm text-slate-700'}>{label}</span>
        </div>
    );
}