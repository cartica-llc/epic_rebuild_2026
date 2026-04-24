export const fmtC = (v?: number | null) =>
    typeof v !== 'number' || isNaN(v)
        ? '—'
        : new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
          }).format(v);

export const fmtPct2 = (v?: number | null) =>
    typeof v !== 'number' || isNaN(v) ? '—' : `${(v * 100).toFixed(2)}%`;

export const fmtD = (v?: string | null) => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime())
        ? v
        : new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          }).format(d);
};

export const fmtS = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${Math.round(n).toLocaleString()}`;
};

export const fmtP = (n: number) => `${n.toFixed(1)}%`;

export const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

export const has = (v: unknown) => {
    if (v == null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return true;
};
