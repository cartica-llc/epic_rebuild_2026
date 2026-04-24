'use client';

import { clamp, fmtP } from '../shared/format';

export const MIN_DAC = 25;

type Props = {
    isDac: boolean;
    isLi: boolean;
    dac: Record<string, { dacC: number; totC: number; dacN: number; totN: number }>;
};

export function DacPanel({ isDac, isLi, dac }: Props) {
    const cards: [string, boolean][] = [
        ['DAC/LI', isDac || isLi],
        ['DAC', isDac],
        ['Low Income', isLi],
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
                {cards.map(([l, on]) => (
                    <div
                        key={l}
                        className={[
                            'min-w-[80px] flex-1 rounded-xl border p-4 text-center',
                            on
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-slate-200 bg-slate-50',
                        ].join(' ')}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {l}
                        </p>
                        <p
                            className={[
                                'mt-1 text-xl font-bold',
                                on ? 'text-emerald-700' : 'text-slate-400',
                            ].join(' ')}
                        >
                            {on ? 'Yes' : 'No'}
                        </p>
                    </div>
                ))}
            </div>

            {Object.entries(dac).map(([area, s]) => {
                const pct = s.totC > 0 ? (s.dacC / s.totC) * 100 : 0;
                const ok = pct >= MIN_DAC;
                return (
                    <div key={area}>
                        <div className="mb-1.5 flex justify-between text-[12px]">
                            <span className="font-medium text-slate-700">{area}</span>
                            <span
                                className={[
                                    'font-bold',
                                    ok ? 'text-emerald-600' : 'text-amber-700',
                                ].join(' ')}
                            >
                                {fmtP(pct)}
                            </span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="absolute inset-y-0 left-0 rounded-r-full transition-all"
                                style={{
                                    width: `${clamp(pct, 0, 100)}%`,
                                    backgroundColor: ok ? '#059669' : '#b45309',
                                }}
                            />
                            <div
                                className="absolute inset-y-0 w-px bg-sky-500"
                                style={{ left: `${MIN_DAC}%` }}
                            />
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                            <span>
                                {s.dacN} DAC of {s.totN}
                            </span>
                            <span>
                                {ok ? `Meets ${MIN_DAC}% target` : `Below ${MIN_DAC}%`}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
