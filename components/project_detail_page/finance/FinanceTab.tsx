'use client';

import { Loader2 } from 'lucide-react';
import { Chips, FieldLabel, HR, Txt } from '../shared/atoms';
import { has } from '../shared/format';
import { useFinanceDetails } from '../shared/useProjectData';
import { FinanceHistorySection } from './FinanceHistorySection';

type Props = {
    projectId: number | string;
};

export function FinanceTab({ projectId }: Props) {
    const state = useFinanceDetails(projectId);

    if (state.status === 'loading') {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (state.status === 'error') {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
                Unable to load finance details: {state.message}
            </div>
        );
    }

    const f = state.data;

    return (
        <div className="space-y-12">
            <FinanceHistorySection projectId={projectId} />

            <HR />

            <div className="grid gap-8 sm:grid-cols-2">
                {has(f.fundingMechanisms) && (
                    <div>
                        <FieldLabel c="Funding Mechanisms" />
                        <Chips items={f.fundingMechanisms} />
                    </div>
                )}
                {has(f.matchFundingPartners) && (
                    <div>
                        <FieldLabel c="Match Partners" />
                        <Chips items={f.matchFundingPartners} />
                    </div>
                )}
                {has(f.leveragedFundsSources) && (
                    <div>
                        <FieldLabel c="Leveraged Funds Sources" />
                        <Txt text={f.leveragedFundsSources} n={4} />
                    </div>
                )}
            </div>

            {has(f.cpucProceedings) && (
                <div>
                    <FieldLabel c="CPUC Proceedings" />
                    <div className="divide-y divide-slate-100">
                        {f.cpucProceedings.map((x, i) => (
                            <div key={i} className="py-3 text-sm">
                                <span className="font-semibold text-slate-800">
                                    {x.cpucNumber}
                                </span>
                                {x.cpucDescription ? ` — ${x.cpucDescription}` : ''}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}