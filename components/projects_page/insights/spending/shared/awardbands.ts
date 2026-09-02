// components/projects_page/insights/spending/shared/awardBands.ts

export interface AwardBand {
    label: string;
    order: number;
    min: number | null;
    max: number | null;
}

export const AWARD_BANDS: AwardBand[] = [
    { label: 'Under $100K',     order: 1, min: null,     max: 100_000 },
    { label: '$100K – $500K',   order: 2, min: 100_000,  max: 500_000 },
    { label: '$500K – $1M',     order: 3, min: 500_000,  max: 1_000_000 },
    { label: '$1M – $5M',       order: 4, min: 1_000_000,max: 5_000_000 },
    { label: '$5M – $10M',      order: 5, min: 5_000_000,max: 10_000_000 },
    { label: '$10M+',           order: 6, min: 10_000_000, max: null },
];


export function bandToProjectsHref(band: AwardBand): string {
    const params = new URLSearchParams();
    if (band.min !== null) params.set('contractMin', String(band.min));
    if (band.max !== null) params.set('contractMax', String(band.max - 1));
    return `/projects?${params.toString()}`;
}