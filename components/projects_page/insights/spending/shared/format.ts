// components/projects_page/insights/spending/shared/format.ts

export const formatMoneyShort = (n: number): string => {
    if (!Number.isFinite(n)) return '$0';
    if (n >= 1e9) return `$${Math.floor(n / 1e8) / 10}B`;
    if (n >= 1e6) return `$${Math.floor(n / 1e5) / 10}M`;
    if (n >= 1e3) return `$${Math.floor(n / 1e3)}K`;
    return `$${Math.round(n).toLocaleString()}`;
};

export const formatMoneyFull = (n: number): string => {
    if (!Number.isFinite(n)) return '$0';
    return `$${Math.round(n).toLocaleString()}`;
};

export const formatPct = (n: number, digits = 1): string =>
    `${n.toFixed(digits)}%`;

export const formatCount = (n: number): string => n.toLocaleString();