// components/projects_page/insights/spending/shared/fundingLayers.tsx

export type FundingLayer = 'committed' | 'encumbered' | 'contracted' | 'expended';


export const LAYERS: FundingLayer[] = ['committed', 'encumbered', 'contracted', 'expended'];

export const DRAW_ORDER: FundingLayer[] = ['committed', 'encumbered', 'contracted', 'expended'];

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

export function drawOrderFor(visible: FundingLayer[]): FundingLayer[] {
    return DRAW_ORDER.filter((l) => visible.includes(l));
}


export function isLayerHidden(
    row: FundingValues,
    layer: FundingLayer,
    visible: FundingLayer[],
): boolean {
    const order = drawOrderFor(visible);
    const idx = order.indexOf(layer);
    if (idx === -1) return false;
    const value = valueForLayer(row, layer);
    if (value <= 0) return false;
    return order.slice(idx + 1).some((above) => valueForLayer(row, above) >= value);
}

export const LAYER_LABEL: Record<FundingLayer, string> = {
    committed: 'committed',
    encumbered: 'encumbered',
    contracted: 'contracted',
    expended: 'expended',
};