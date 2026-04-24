'use client';

import { clamp, fmtP, fmtS } from '../shared/format';

type Props = {
    areas: string[];
    committed: number;
    agg: Record<string, { committed: number; count: number }>;
};

export function AreaPanel({ areas, committed, agg }: Props) {
    const rows = areas
        .map((a) => {
            const d = agg[a];
            if (!d) return null;
            const pct = d.committed > 0 ? (committed / d.committed) * 100 : 0;
            return { a, tot: d.committed, cnt: d.count, pct };
        })
        .filter((x): x is { a: string; tot: number; cnt: number; pct: number } => x !== null);

    if (!rows.length) {
        return <p className="text-sm italic text-slate-400">No positioning data.</p>;
    }

    return (
        <div className="space-y-5">
            {rows.map((r) => (
                <div key={r.a}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                        <span className="text-sm font-medium text-slate-800">{r.a}</span>
                        <span className="text-[11px] text-slate-400">
                            {r.cnt} projects · {fmtS(r.tot)}
                        </span>
                    </div>
                    <div className="relative h-5 w-full overflow-hidden rounded-md bg-slate-100">
                        <div
                            className="absolute inset-y-0 left-0 rounded-r-md bg-slate-800 transition-all"
                            style={{ width: `${clamp(r.pct, 0.5, 100)}%` }}
                        />
                        <span
                            className="absolute inset-y-0 flex items-center text-[11px] font-semibold"
                            style={{
                                left: r.pct > 18 ? '8px' : `${clamp(r.pct, 0.5, 100) + 1}%`,
                                color: r.pct > 18 ? '#f8fafc' : '#0f172a',
                            }}
                        >
                            {fmtP(r.pct)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
