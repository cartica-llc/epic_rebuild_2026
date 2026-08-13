// components/projects_page/insights/market/shared/colors.ts

import type { MaturityStage, SignalBand } from './types';

export const MATURITY_FILL: Record<MaturityStage, string> = {
    'Near-market': '#0f172a', // slate-900
    Validation: '#334155', // slate-700
    Development: '#64748b', // slate-500
    'Demonstration / Build': '#94a3b8', // slate-400
    'Early R&D': '#cbd5e1', // slate-300
    Unstaged: '#e2e8f0', // slate-200
};


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


export const SIGNAL_BAND_LABEL: Record<SignalBand, string> = {
    Strong: 'Likely high potential',
    Emerging: 'Emerging',
    Early: 'Early',
};


export const MATURITY_STAGE_LABEL: Record<MaturityStage, string> = {
    'Near-market': 'Likely near-market',
    Validation: 'Likely validation stage',
    Development: 'Development',
    'Demonstration / Build': 'Demonstration / Build',
    'Early R&D': 'Early R&D',
    Unstaged: 'Unstaged',
};


export function scorePillClass(score: number): string {
    if (score >= 4) return 'bg-emerald-700 text-white';
    if (score >= 2) return 'bg-amber-600 text-white';
    return 'bg-slate-200 text-slate-700';
}