'use client';

import { Loader2 } from 'lucide-react';
import { FieldLabel, HR, STitle } from '../shared/atoms';
import { fmtP, fmtS } from '../shared/format';
import {
    useAnalyticsContext,
    useFinanceDetails,
    useProjectDetails,
} from '../shared/useProjectData';
import { AreaPanel } from './AreaPanel';
import { DacPanel, MIN_DAC } from './DacPanel';

type Props = {
    projectId: number | string;
    cpucDac: boolean;
    cpucLi: boolean;
};

export function AnalyticsTab({ projectId, cpucDac, cpucLi }: Props) {
    const analyticsState = useAnalyticsContext(projectId);
    const detailsState = useProjectDetails(projectId);
    const financeState = useFinanceDetails(projectId);

    if (analyticsState.status === 'loading') {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (analyticsState.status === 'error') {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
                Unable to load analytics: {analyticsState.message}
            </div>
        );
    }

    const ctx = analyticsState.data;
    const areas =
        detailsState.status === 'ready' ? detailsState.data.investmentAreas : [];

    const committed =
        financeState.status === 'ready'
            ? financeState.data.commitedFundingAmt ?? 0
            : 0;

    const avg = ctx.tot.count > 0 ? ctx.tot.committed / ctx.tot.count : 0;

    return (
        <div className="space-y-16">
            {avg > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-5">
                    <FieldLabel c="Portfolio Context" />
                    <p className="text-sm text-slate-600">
                        Compared across{' '}
                        <span className="font-semibold text-slate-900">
                            {ctx.tot.count.toLocaleString()} projects
                        </span>
                        . Portfolio average:{' '}
                        <span className="font-semibold text-slate-900">{fmtS(avg)}</span>{' '}
                        committed. This project is{' '}
                        <span
                            className={[
                                'font-semibold',
                                committed >= avg ? 'text-emerald-700' : 'text-amber-700',
                            ].join(' ')}
                        >
                            {committed >= avg
                                ? `${fmtP((committed / avg - 1) * 100)} above`
                                : `${fmtP((1 - committed / avg) * 100)} below`}
                        </span>{' '}
                        average.
                    </p>
                </div>
            )}

            {areas.length > 0 && (
                <section>
                    <STitle c="Investment Area Position" />
                    <p className="mt-1 mb-6 text-sm text-slate-500">
                        This project&apos;s committed share within each area
                    </p>
                    <AreaPanel areas={areas} committed={committed} agg={ctx.agg} />
                </section>
            )}

            <HR />

            <HR />

            <section>
                <STitle c="Community Investment" />
                <p className="mt-1 mb-6 text-sm text-slate-500">
                    DAC / low-income designation ({MIN_DAC}% portfolio minimum)
                </p>
                <DacPanel isDac={cpucDac} isLi={cpucLi} dac={ctx.dac} />
            </section>
        </div>
    );
}