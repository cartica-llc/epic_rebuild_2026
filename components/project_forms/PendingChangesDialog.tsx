// ─── components/project_forms/PendingChangesDialog.tsx ────────────────
// Modal that lists all changed fields before saving in edit mode.

'use client';

import { createPortal } from 'react-dom';

export interface ChangeEntry {
    label: string;
    from: string;
    to: string;
}

export function PendingChangesDialog({ changes, isSaving, onConfirm, onCancel }: {
    changes: ChangeEntry[];
    isSaving: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
                            <path d="M12 9v4M12 17h.01M10.29 3.86l-8.3 14.18A2 2 0 003.72 21h16.56a2 2 0 001.73-2.96l-8.3-14.18a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Confirm Changes</h3>
                        <p className="text-xs text-slate-500">{changes.length} field{changes.length !== 1 ? 's' : ''} modified</p>
                    </div>
                </div>
                <div className="overflow-y-auto px-6 py-4 flex-1">
                    <div className="space-y-3">
                        {changes.map((c, i) => (
                            <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                                <div className="text-xs font-semibold text-slate-600 mb-1.5">{c.label}</div>
                                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start text-xs">
                                    <div className="bg-red-50 border border-red-100 text-red-700 rounded-md px-2 py-1.5 break-words">{c.from || '(empty)'}</div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 mt-1 shrink-0"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md px-2 py-1.5 break-words">{c.to || '(empty)'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2.5 text-sm font-medium text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors">
                        {isSaving ? 'Saving…' : 'Confirm & Save'}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
