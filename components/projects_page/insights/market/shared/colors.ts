// components/projects_page/insights/market/shared/colors.ts

import type { MaturityStage, SignalBand } from './types';

/**
 * Maturity gradient: deepest tone at the most-advanced stage, lighter as we
 * move back toward early R&D. Mirrors the funnel-shaped pipeline visual.
 */
export const MATURITY_FILL: Record<MaturityStage, string> = {
    'Near-market': '#0f172a', // slate-900
    Validation: '#334155', // slate-700
    Development: '#64748b', // slate-500
    'Demonstration / Build': '#94a3b8', // slate-400
    'Early R&D': '#cbd5e1', // slate-300
    Unstaged: '#e2e8f0', // slate-200
};

/**
 * Signal band palette — emerald for strong (positive momentum), amber for
 * emerging (in-flight), slate for early (no clear signal yet).
 */
export const SIGNAL_BAND_FILL: Record<SignalBand, string> = {
    Strong: '#047857', // emerald-700
    Emerging: '#d97706', // amber-600
    Early: '#94a3b8', // slate-400
};

export const SIGNAL_BAND_TAILWIND: Record<SignalBand, string> = {
    Strong: 'bg-emerald-700 text-white',
    Emerging: 'bg-amber-600 text-white',
    Early: 'bg-slate-200 text-slate-700',
};

/**
 * Score-based color (0–5) — used for the inline pill in the projects table.
 */
export function scorePillClass(score: number): string {
    if (score >= 4) return 'bg-emerald-700 text-white';
    if (score >= 2) return 'bg-amber-600 text-white';
    return 'bg-slate-200 text-slate-700';
}
