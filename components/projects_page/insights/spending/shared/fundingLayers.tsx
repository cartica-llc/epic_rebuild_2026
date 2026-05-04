// components/projects_page/insights/spending/shared/fundingLayers.ts

export type FundingLayer = 'committed' | 'contracted' | 'expended';


export const FUNDING_COLORS: Record<FundingLayer, { bar: string; dot: string }> = {
    committed: {
        bar: 'bg-slate-400',
        dot: 'bg-slate-400 ring-1 ring-inset ring-slate-400',
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

export function valueForLayer(
    row: { committed: number; contracted: number; expended: number },
    layer: FundingLayer | null,
): number {
    if (layer === 'contracted') return row.contracted;
    if (layer === 'expended') return row.expended;
    return row.committed;
}

export const LAYER_LABEL: Record<FundingLayer, string> = {
    committed: 'committed',
    contracted: 'contracted',
    expended: 'expended',
};