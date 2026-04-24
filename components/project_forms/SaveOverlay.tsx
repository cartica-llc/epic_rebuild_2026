// ─── components/project_forms/SaveOverlay.tsx ────────────────────────
// Full-screen overlay shown during save: spinner → success → error.

'use client';

import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import type { SaveOverlay as SaveOverlayState } from './types';

export function SaveOverlay({ state, mode, onDismissError }: {
    state: SaveOverlayState;
    mode: 'create' | 'edit';
    onDismissError: () => void;
}) {
    if (state === null || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">

            {/* Logo */}
            <div className="mb-8">
                <Image src="/logo/CAgov-logo.svg" alt="California State Logo" width={160} height={48} priority unoptimized />
            </div>

            {/* ── Saving phase ── */}
            {state.phase === 'saving' && (
                <div className="flex flex-col items-center gap-5 max-w-sm text-center animate-in fade-in duration-300">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-slate-900 border-t-transparent animate-spin" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-900">
                            {mode === 'create' ? 'Creating project…' : 'Saving changes…'}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">This may take a few seconds</p>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                        {[0, 1, 2].map((i) => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"
                                  style={{ animationDelay: `${i * 200}ms` }} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Success phase ── */}
            {state.phase === 'success' && (
                <div className="flex flex-col items-center gap-5 max-w-sm text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-900">
                            {mode === 'create' ? 'Project created!' : 'Changes saved!'}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-slate-700">{state.projectName}</p>
                        {state.projectNumber && (
                            <p className="mt-0.5 text-xs text-slate-400 font-mono uppercase tracking-wide">{state.projectNumber}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 shrink-0" />
                        Redirecting to project page…
                    </div>
                </div>
            )}

            {/* ── Error phase ── */}
            {state.phase === 'error' && (
                <div className="flex flex-col items-center gap-5 max-w-sm text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-500">
                            <circle cx="12" cy="12" r="9" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-900">Save failed</p>
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{state.message}</p>
                    </div>
                    <button
                        onClick={onDismissError}
                        className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                        Back to form
                    </button>
                </div>
            )}
        </div>,
        document.body,
    );
}
