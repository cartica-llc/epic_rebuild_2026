// components/projects_page/insights/spending/shared/fundingLayers.tsx

export type FundingLayer = 'committed' | 'encumbered' | 'contracted' | 'expended';

// Display order everywhere (cards, legends, tooltips).
export const LAYERS: FundingLayer[] = ['committed', 'encumbered', 'contracted', 'expended'];

export interface FundingValues {
    committed: number;
    encumbered: number;
    contracted: number;
    expended: number;
}

export const FUNDING_COLORS: Record<FundingLayer, { bar: string; dot: string }> = {
    committed: {
        bar: 'bg-slate-400',
        dot: 'bg-slate-400 ring-1 ring-inset ring-slate-400',
    },
    encumbered: {
        bar: 'bg-slate-600',
        dot: 'bg-slate-600',
    },
    contracted: {
        bar: 'bg-emerald-700',
        dot: 'bg-emerald-700',
    },
    expended: {
        bar: 'bg-emerald-400',
        dot: 'bg-emerald-400',
    },
};

export function valueForLayer(row: FundingValues, layer: FundingLayer | null): number {
    if (layer === 'encumbered') return row.encumbered;
    if (layer === 'contracted') return row.contracted;
    if (layer === 'expended') return row.expended;
    return row.committed;
}

/**
 * The bars draw each layer on top of the last, all starting from the left.
 * Encumbered and contracted don't have a fixed size order (either can be the
 * bigger one on a given row), so draw the largest first and the smallest last.
 * That way no layer ends up fully hidden behind a bigger one.
 */
export function layersLargestFirst(row: FundingValues, visible: FundingLayer[]): FundingLayer[] {
    return [...visible].sort((a, b) => valueForLayer(row, b) - valueForLayer(row, a));
}

export const LAYER_LABEL: Record<FundingLayer, string> = {
    committed: 'committed',
    encumbered: 'encumbered',
    contracted: 'contracted',
    expended: 'expended',
};