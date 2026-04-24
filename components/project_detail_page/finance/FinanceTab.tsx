'use client';

import { Loader2 } from 'lucide-react';
import { Chips, FieldLabel, HR, STitle, Txt } from '../shared/atoms';
import { fmtC, fmtPct2, has } from '../shared/format';
import { useFinanceDetails } from '../shared/useProjectData';

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

    const rows: [string, string][] = [
        ['Committed Funding', fmtC(f.commitedFundingAmt)],
        ['Contract Amount', fmtC(f.contractAmount)],
        ['Encumbered', fmtC(f.encumberedFundingAmount)],
        ['Expended to Date', fmtC(f.expendedToDate)],
        ['Admin Costs', fmtC(f.adminCost)],
        ['Match Funding', fmtC(f.matchFunding)],
        ['Match Split', fmtPct2(f.matchFundingSplit)],
        ['Leveraged Funds', fmtC(f.leveragedFunds)],
    ];

    return (
        <div className="space-y-12">
            <section>
                <STitle c="Financial Summary" />
                <div className="mt-6">
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-100">
                            {rows.map(([l, v]) => (
                                <tr key={l} className="group">
                                    <td className="py-3 pr-4 text-slate-500 group-hover:text-slate-700">
                                        {l}
                                    </td>
                                    <td className="py-3 text-right font-semibold tabular-nums text-slate-900">
                                        {v}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

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
