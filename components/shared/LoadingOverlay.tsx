// ─── components/shared/LoadingOverlay.tsx ────────────────────────────
// Reusable full-screen overlay for async operations: loading → success → error.
// Matches the visual style of SaveOverlay / DeleteOverlay.
//
// Usage examples:
//
//   Sign-in:
//   <LoadingOverlay
//     state={overlayState}
//     onDismissError={() => setOverlayState(null)}
//     loadingText="Signing you in…"
//     loadingSubtext="Verifying your credentials"
//     successText="Welcome back!"
//     successSubtext={state.displayName}
//     successRedirectText="Taking you to your dashboard…"
//     errorTitle="Sign-in failed"
//     accentColor="blue"
//   />
//
//   Sign-out:
//   <LoadingOverlay
//     state={overlayState}
//     onDismissError={() => setOverlayState(null)}
//     loadingText="Signing you out…"
//     successText="You've been signed out"
//     successRedirectText="Returning to login…"
//     accentColor="slate"
//   />

'use client';

import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────

export type LoadingOverlayState =
    | null
    | { phase: 'loading' }
    | { phase: 'success'; detail?: string; detail2?: string }
    | { phase: 'error'; message: string };

type AccentColor = 'slate' | 'blue' | 'emerald' | 'red' | 'amber' | 'violet';

export interface LoadingOverlayProps {
    /** Current state of the overlay. Pass null to hide. */
    state: LoadingOverlayState;
    /** Called when user clicks "Try again" on the error phase. */
    onDismissError: () => void;

    // ── Loading phase ──
    /** Primary loading message. Default: "Loading…" */
    loadingText?: string;
    /** Secondary loading message. Default: "This may take a few seconds" */
    loadingSubtext?: string;

    // ── Success phase ──
    /** Primary success headline. Default: "Done!" */
    successText?: string;
    /** Optional secondary line (e.g. user display name, project name). */
    successSubtext?: string;
    /** Optional tertiary line (e.g. project number / ID). Rendered in mono. */
    successDetail?: string;
    /** Text shown in the redirect chip. Default: "Redirecting…" */
    successRedirectText?: string;

    // ── Error phase ──
    /** Error phase headline. Default: "Something went wrong" */
    errorTitle?: string;
    /** Label on the dismiss button. Default: "Try again" */
    errorDismissLabel?: string;

    // ── Visual ──
    /**
     * Accent color used for the spinner ring and success icon.
     * Default: "blue"
     */
    accentColor?: AccentColor;
}

// ── Accent color maps ────────────────────────────────────────────────

const spinnerColors: Record<AccentColor, string> = {
    slate:   'border-slate-900',
    blue:    'border-blue-600',
    emerald: 'border-emerald-600',
    red:     'border-red-600',
    amber:   'border-amber-500',
    violet:  'border-violet-600',
};

const successRingColors: Record<AccentColor, string> = {
    slate:   'bg-slate-50 border-slate-200',
    blue:    'bg-blue-50 border-blue-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    red:     'bg-red-50 border-red-200',
    amber:   'bg-amber-50 border-amber-200',
    violet:  'bg-violet-50 border-violet-200',
};

const successIconColors: Record<AccentColor, string> = {
    slate:   'text-slate-600',
    blue:    'text-blue-600',
    emerald: 'text-emerald-600',
    red:     'text-red-600',
    amber:   'text-amber-500',
    violet:  'text-violet-600',
};

// ── Component ────────────────────────────────────────────────────────

export function LoadingOverlay({
                                   state,
                                   onDismissError,
                                   loadingText        = 'Loading…',
                                   loadingSubtext     = 'This may take a few seconds',
                                   successText        = 'Done!',
                                   successSubtext,
                                   successDetail,
                                   successRedirectText = 'Redirecting…',
                                   errorTitle         = 'Something went wrong',
                                   errorDismissLabel  = 'Try again',
                                   accentColor        = 'blue',
                               }: LoadingOverlayProps) {
    if (state === null || typeof document === 'undefined') return null;

    const spinnerBorder  = spinnerColors[accentColor];
    const successRing    = successRingColors[accentColor];
    const successIcon    = successIconColors[accentColor];

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">

            {/* Logo */}
            <div className="mb-8">
                <Image
                    src="/logo/CAgov-logo.svg"
                    alt="California State Logo"
                    width={160}
                    height={48}
                    priority
                    unoptimized
                />
            </div>

            {/* ── Loading phase ── */}
            {state.phase === 'loading' && (
                <div className="flex flex-col items-center gap-5 max-w-sm text-center animate-in fade-in duration-300">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                        <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${spinnerBorder}`} />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-900">{loadingText}</p>
                        {loadingSubtext && (
                            <p className="mt-1 text-sm text-slate-400">{loadingSubtext}</p>
                        )}
                    </div>
                    <div className="flex gap-1.5 mt-1">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"
                                style={{ animationDelay: `${i * 200}ms` }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Success phase ── */}
            {state.phase === 'success' && (
                <div className="flex flex-col items-center gap-5 max-w-sm text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${successRing}`}>
                        <svg
                            width="28" height="28" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className={successIcon}
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-900">{successText}</p>
                        {/* Prefer state.detail over prop successSubtext so callers can
                            pass runtime values (e.g. username) via the state object. */}
                        {(state.detail ?? successSubtext) && (
                            <p className="mt-1.5 text-sm font-medium text-slate-700">
                                {state.detail ?? successSubtext}
                            </p>
                        )}
                        {(state.detail2 ?? successDetail) && (
                            <p className="mt-0.5 text-xs text-slate-400 font-mono uppercase tracking-wide">
                                {state.detail2 ?? successDetail}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 shrink-0" />
                        {successRedirectText}
                    </div>
                </div>
            )}

            {/* ── Error phase ── */}
            {state.phase === 'error' && (
                <div className="flex flex-col items-center gap-5 max-w-sm text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
                        <svg
                            width="26" height="26" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round"
                            className="text-red-500"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-900">{errorTitle}</p>
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{state.message}</p>
                    </div>
                    <button
                        onClick={onDismissError}
                        className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        {errorDismissLabel}
                    </button>
                </div>
            )}
        </div>,
        document.body,
    );
}