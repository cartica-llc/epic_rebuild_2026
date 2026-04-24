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
import { CommPanel } from './CommPanel';
import { DacPanel, MIN_DAC } from './DacPanel';
import { FundingScores } from './FundingScores';

type Props = {
    projectId: number | string;
    cpucDac: boolean;
    cpucLi: boolean;
};

export function AnalyticsTab({ projectId, cpucDac, cpucLi }: Props) {
    const analyticsState = useAnalyticsContext(projectId);
    const detailsState = useProjectDetails(projectId);
    const financeState = useFinanceDetails(projectId);

    // Still loading core analytics
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
    const contracted =
        financeState.status === 'ready'
            ? financeState.data.contractAmount ?? 0
            : 0;
    const expended =
        financeState.status === 'ready'
            ? financeState.data.expendedToDate ?? 0
            : 0;

    const avg = ctx.tot.count > 0 ? ctx.tot.committed / ctx.tot.count : 0;

    return (
        <div className="space-y-16">
            {/*<section>*/}
            {/*    <STitle c="Funding Position" />*/}
            {/*    <p className="mt-1 mb-6 text-sm text-slate-500">*/}
            {/*        How this project&apos;s funding compares to the{' '}*/}
            {/*        {ctx.tot.count.toLocaleString()}-project portfolio average*/}
            {/*    </p>*/}
            {/*    <FundingScores*/}
            {/*        committed={committed}*/}
            {/*        contracted={contracted}*/}
            {/*        expended={expended}*/}
            {/*        tot={ctx.tot}*/}
            {/*    />*/}
            {/*</section>*/}

            {/*<HR />*/}

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

            {/*<section>*/}
            {/*    <STitle c="Commercialization Position" />*/}
            {/*    <p className="mt-1 mb-6 text-sm text-slate-500">*/}
            {/*        Market readiness and maturity pipeline*/}
            {/*    </p>*/}
            {/*    {ctx.commercialization ? (*/}
            {/*        <CommPanel*/}
            {/*            commercialization={ctx.commercialization}*/}
            {/*            maturityCounts={ctx.maturityCounts}*/}
            {/*            sameStageSignalCounts={ctx.sameStageSignalCounts}*/}
            {/*        />*/}
            {/*    ) : (*/}
            {/*        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">*/}
            {/*            <p className="text-sm font-medium text-slate-500">*/}
            {/*                No commercialization assessment available*/}
            {/*            </p>*/}
            {/*            <p className="mt-1 max-w-xs text-xs text-slate-400">*/}
            {/*                Signal scores are available for projects in the*/}
            {/*                commercialization dataset.*/}
            {/*            </p>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</section>*/}

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
