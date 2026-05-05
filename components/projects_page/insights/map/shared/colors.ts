// components/projects_page/insights/map/shared/colors.ts

import type { MapProject } from './types';

export interface AreaColor {
    dot: string;
    bg: string;
    border: string;
    label: string;
}

export const INNOVATION_COLORS: Record<string, AreaColor> = {
    'Grid Decarbonization and Decentralization': {
        dot: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        label: 'Grid Decarb',
    },
    'Resiliency and Safety': {
        dot: '#dc2626',
        bg: '#fef2f2',
        border: '#fecaca',
        label: 'Resiliency',
    },
    'Building Decarbonization': {
        dot: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        label: 'Building Decarb',
    },
    'Entrepreneurial Ecosystem': {
        dot: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        label: 'Entrepreneurial',
    },
    'Low Carbon Transportation': {
        dot: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        label: 'Low Carbon Transport',
    },
    'Industrial and Agricultural Innovation': {
        dot: '#be185d',
        bg: '#fdf2f8',
        border: '#fbcfe8',
        label: 'Industrial / Ag',
    },
};

export const DEFAULT_AREA_COLOR: AreaColor = {
    dot: '#475569',
    bg: '#f8fafc',
    border: '#e2e8f0',
    label: '',
};

export function colorForArea(area: string | undefined): AreaColor {
    if (!area) return DEFAULT_AREA_COLOR;
    return INNOVATION_COLORS[area] ?? DEFAULT_AREA_COLOR;
}


export function primaryAreaFor(project: MapProject): string | undefined {
    if (project.investmentAreas.length === 0) return undefined;
    const known = project.investmentAreas.find((a) => a in INNOVATION_COLORS);
    return known ?? project.investmentAreas[0];
}