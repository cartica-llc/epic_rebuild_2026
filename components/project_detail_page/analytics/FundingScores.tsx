'use client';

import { fmtS } from '../shared/format';

type Props = {
    committed: number;
    contracted: number;
    expended: number;
    tot: { committed: number; contracted: number; expended: number; count: number };
};

export function FundingScores({ committed, contracted, expended, tot }: Props) {
    const avgC = tot.count > 0 ? tot.committed / tot.count : 0;
    const avgT = tot.count > 0 ? tot.contracted / tot.count : 0;
    const avgE = tot.count > 0 ? tot.expended / tot.count : 0;
    const execRate = committed > 0 ? (expended / committed) * 100 : 0;

    const maxVal = Math.max(committed, avgC * 2, 1);

    const cW = Math.min((committed / maxVal) * 100, 100);
    const tW = Math.min((contracted / maxVal) * 100, 100);
    const eW = Math.min((expended / maxVal) * 100, 100);

    const aCW = Math.min((avgC / maxVal) * 100, 100);
    const aTW = Math.min((avgT / maxVal) * 100, 100);
    const aEW = Math.min((avgE / maxVal) * 100, 100);

    type Row = {
        label: string;
        value: number;
        avg: number;
        display: string;
        avgW: number;
        aboveAvg: boolean;
        rowIdx: 0 | 1 | 2;
    };

    const rows: Row[] = [
        {
            label: 'Committed',
            value: committed,
            avg: avgC,
            display: fmtS(committed),
            avgW: aCW,
            aboveAvg: committed >= avgC,
            rowIdx: 0,
        },
        {
            label: 'Contracted',
            value: contracted,
            avg: avgT,
            display: fmtS(contracted),
            avgW: aTW,
            aboveAvg: contracted >= avgT,
            rowIdx: 1,
        },
        {
            label: 'Expended',
            value: expended,
            avg: avgE,
            display: fmtS(expended),
            avgW: aEW,
            aboveAvg: expended >= avgE,
            rowIdx: 2,
        },
    ];

    const legend: [string, string][] = [
        ['#cbd5e1', 'Committed'],
        ['#64748b', 'Contracted'],
        ['#0f172a', 'Expended'],
    ];

    return (
        <div className="space-y-1">
            <div className="mb-4 flex flex-wrap items-center gap-5 text-[11px] text-slate-500">
                {legend.map(([f, l]) => (
                    <span key={l} className="flex items-center gap-1.5">
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: f }}
                        />
                        {l}
                    </span>
                ))}
                <span className="ml-auto flex items-center gap-1.5 text-slate-400">
                    <span className="inline-block h-3 w-px bg-slate-500" />
                    Portfolio avg
                </span>
            </div>

            {rows.map((row) => {
                const diffPct =
                    row.value > 0 && row.avg > 0
                        ? Math.abs(((row.value - row.avg) / row.avg) * 100).toFixed(1)
                        : null;
                return (
                    <div
                        key={row.label}
                        className="grid grid-cols-[100px_minmax(0,1fr)_80px] items-center gap-3"
                    >
                        <p className="text-[11px] font-semibold text-slate-500">
                            {row.label}
                        </p>

                        <div
                            className="relative overflow-hidden rounded-lg bg-slate-100"
                            style={{ height: 40 }}
                        >
                            {row.rowIdx === 0 && (
                                <div
                                    className="absolute inset-y-0 left-0 rounded-r-lg"
                                    style={{ width: `${cW}%`, backgroundColor: '#cbd5e1' }}
                                />
                            )}
                            {row.rowIdx === 1 && (
                                <>
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-r-lg"
                                        style={{ width: `${cW}%`, backgroundColor: '#cbd5e1' }}
                                    />
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-r-lg"
                                        style={{ width: `${tW}%`, backgroundColor: '#64748b' }}
                                    />
                                </>
                            )}
                            {row.rowIdx === 2 && (
                                <>
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-r-lg"
                                        style={{ width: `${cW}%`, backgroundColor: '#cbd5e1' }}
                                    />
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-r-lg"
                                        style={{ width: `${tW}%`, backgroundColor: '#64748b' }}
                                    />
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-r-lg"
                                        style={{ width: `${eW}%`, backgroundColor: '#0f172a' }}
                                    />
                                </>
                            )}
                            {row.avgW > 0 && (
                                <div
                                    className="absolute inset-y-1 w-0.5 rounded-full bg-slate-400/70"
                                    style={{ left: `${row.avgW}%` }}
                                />
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-bold tabular-nums text-slate-900">
                                {row.display}
                            </p>
                            {diffPct && (
                                <p
                                    className={[
                                        'text-[10px] font-semibold',
                                        row.aboveAvg ? 'text-emerald-600' : 'text-amber-600',
                                    ].join(' ')}
                                >
                                    {row.aboveAvg ? `+${diffPct}%` : `-${diffPct}%`}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Execution rate:{' '}
                <span
                    className={[
                        'font-bold',
                        execRate >= 75
                            ? 'text-emerald-700'
                            : execRate >= 30
                            ? 'text-sky-700'
                            : 'text-amber-700',
                    ].join(' ')}
                >
                    {execRate.toFixed(1)}%
                </span>
                <span className="ml-2 text-slate-400">
                    ({fmtS(expended)} expended of {fmtS(committed)} committed)
                </span>
                {tot.count > 0 && (
                    <span className="ml-2 text-slate-400">
                        · Avg across {tot.count.toLocaleString()} projects
                    </span>
                )}
            </div>
        </div>
    );
}
