// components/project_detail_page/print/PrintFundingChart.tsx

import { fmtS } from '../shared/format';
import type { PublicFinanceQuarter } from '../shared/useProjectData';

const W = 760;
const H = 190;
const ML = 48;
const MR = 118;
const MT = 8;
const MB = 22;

type Series = {
    name: string;
    color: string;
    get: (q: PublicFinanceQuarter) => number | null;
};

const SERIES: Series[] = [
    { name: 'Committed', color: '#d97706', get: (q) => q.committedFunding },
    { name: 'Encumbered', color: '#64748b', get: (q) => q.encumberedFunding },
    { name: 'Expended', color: '#0f172a', get: (q) => q.expendedToDate },
];

function niceScale(dataMax: number): { max: number; ticks: number[] } {
    if (dataMax <= 0) return { max: 1, ticks: [] };
    const rawStep = dataMax / 4;
    const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = ([1, 2, 2.5, 5, 10].find((m) => m * pow >= rawStep) ?? 10) * pow;
    const max = Math.ceil((dataMax * 1.02) / step) * step;
    const ticks: number[] = [];
    for (let v = step; v <= max + step / 2; v += step) ticks.push(v);
    return { max, ticks };
}

export function PrintFundingChart({ quarters }: { quarters: PublicFinanceQuarter[] }) {
    const n = quarters.length;
    if (n < 2) return null;

    const dataMax = Math.max(
        0,
        ...quarters.flatMap((q) => SERIES.map((s) => s.get(q) ?? 0))
    );
    const { max, ticks } = niceScale(dataMax);

    const x = (i: number) => ML + (i / (n - 1)) * (W - ML - MR);
    const y = (v: number) => MT + (1 - v / max) * (H - MT - MB);

    const points = (s: Series) =>
        quarters
            .map((q, i) => ({ i, v: s.get(q) }))
            .filter((p): p is { i: number; v: number } => p.v != null);

    const path = (s: Series) => {
        const pts = points(s);
        return pts
            .map((p, k) => {
                const here = `${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`;
                if (k === 0) return `M${here}`;
                if (s.name !== 'Committed') return `L${here}`;
                return `L${x(p.i).toFixed(1)},${y(pts[k - 1].v).toFixed(1)}L${here}`;
            })
            .join('');
    };

    const labels = SERIES.map((s) => {
        const pts = points(s);
        const last = pts[pts.length - 1];
        return last ? { ...s, last, labelY: y(last.v) } : null;
    })
        .filter((l): l is NonNullable<typeof l> => l !== null)
        .sort((a, b) => a.labelY - b.labelY);
    for (let i = 1; i < labels.length; i++) {
        if (labels[i].labelY - labels[i - 1].labelY < 24) {
            labels[i].labelY = labels[i - 1].labelY + 24;
        }
    }

    const labelEvery = Math.max(1, Math.ceil(n / 10));
    const showXLabel = (i: number) => i === n - 1 || (n - 1 - i) % labelEvery === 0;

    return (
        <svg
            className="pv-chart"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Committed, encumbered and expended funds by quarter"
        >
            {ticks.map((v) => (
                <g key={v}>
                    <line x1={ML} x2={W - MR} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeDasharray="2 4" />
                    <text x={ML - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                        {fmtS(v)}
                    </text>
                </g>
            ))}
            <line x1={ML} x2={W - MR} y1={H - MB} y2={H - MB} stroke="#cbd5e1" />

            {SERIES.map((s) => (
                <path
                    key={s.name}
                    d={path(s)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.name === 'Expended' ? 2.25 : 1.75}
                    strokeDasharray={s.name === 'Committed' ? '7 5' : undefined}
                    strokeLinejoin="round"
                />
            ))}

            {quarters.map(
                (q, i) =>
                    showXLabel(i) && (
                        <text key={i} x={x(i)} y={H - MB + 13} textAnchor="middle" fontSize="9" fill="#94a3b8">
                            {`Q${q.reportingQuarter} ’${String(q.reportingYear).slice(2)}`}
                        </text>
                    )
            )}

            {labels.map((l) => (
                <g key={l.name}>
                    <line
                        x1={x(l.last.i) + 4}
                        x2={W - MR + 12}
                        y1={y(l.last.v)}
                        y2={l.labelY}
                        stroke={l.color}
                        strokeOpacity="0.35"
                    />
                    <circle cx={W - MR + 12} cy={l.labelY} r={2.5} fill={l.color} />
                    <text x={W - MR + 19} y={l.labelY - 1} fontSize="9.5" fontWeight={700} fill={l.color}>
                        {l.name}
                    </text>
                    <text x={W - MR + 19} y={l.labelY + 10} fontSize="9.5" fill="#64748b">
                        {fmtS(l.last.v)}
                    </text>
                </g>
            ))}
        </svg>
    );
}