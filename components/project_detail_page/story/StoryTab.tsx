'use client';

import { Loader2 } from 'lucide-react';
import { FieldLabel, HR, STitle, Txt } from '../shared/atoms';
import { useProjectDetails } from '../shared/useProjectData';

type Props = {
    projectId: number | string;
};

export function StoryTab({ projectId }: Props) {
    const state = useProjectDetails(projectId);

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
                Unable to load story: {state.message}
            </div>
        );
    }

    const d = state.data;

    const narrative = [
        { t: 'Project Detail', v: d.projectDetailText },
        { t: 'Latest Update', v: d.projectUpdate },
        { t: 'Deliverables', v: d.deliverables },
    ];

    const learnings = [
        { t: 'Key Innovations', v: d.keyInnovations },
        { t: 'Key Learnings', v: d.keyLearnings },
        { t: 'Scalability', v: d.scalability },
        { t: 'Getting to Scale', v: d.gettingToScale },
        { t: 'State Policy Support', v: d.statePolicySupport },
    ];

    const challenges = [
        { t: 'Technical Barriers', v: d.technicalBarriers },
        { t: 'Market Barriers', v: d.marketBarriers },
        { t: 'Policy & Regulatory', v: d.policyAndRegulatoryBarriers },
        { t: 'Cybersecurity', v: d.cybersecurityConsiderationsNar },
    ];

    const metrics = [
        { t: 'Projected Benefits', v: d.projectedProjectBenefits },
        { t: 'Grid Reliability', v: d.electricitySystemReliabilityImpacts },
        { t: 'Grid Safety', v: d.electricitySystemSafetyImpacts },
        { t: 'GHG Impacts', v: d.ghgImpacts },
        { t: 'Other Environmental', v: d.otherEnvirionmentalImpacts },
        { t: 'Ratepayer Benefits', v: d.ratepayerImpacts },
        { t: 'Community Benefits', v: d.communityBenefitsDesc },
        { t: 'Energy Impacts', v: d.energyImpacts },
        { t: 'Economic Benefits', v: d.infrastructureCostReductions },
        { t: 'Other Impacts', v: d.otherImpacts },
    ];

    return (
        <div className="space-y-16">
            <section>
                <STitle c="Narrative" />
                <div className="mt-6 divide-y divide-slate-100">
                    {narrative.map((b) => (
                        <div key={b.t} className="pt-7 first:pt-0">
                            <FieldLabel c={b.t} />
                            <Txt text={b.v} />
                        </div>
                    ))}
                </div>
            </section>

            <HR />

            <section>
                <STitle c="Innovations & Learnings" />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {learnings.map((b) => (
                        <div key={b.t} className="rounded-xl bg-slate-50 p-5">
                            <FieldLabel c={b.t} />
                            <Txt text={b.v} n={5} />
                        </div>
                    ))}
                </div>
            </section>

            <HR />

            <section>
                <STitle c="Challenges & Barriers" />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {challenges.map((b) => (
                        <div key={b.t} className="rounded-xl bg-slate-50 p-5">
                            <FieldLabel c={b.t} />
                            <Txt text={b.v} n={5} ph="None identified." />
                        </div>
                    ))}
                </div>
            </section>

            <HR />

            <section>
                <STitle c="Project Metrics" />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {metrics.map((b) => (
                        <div key={b.t} className="rounded-xl bg-slate-50 p-5">
                            <FieldLabel c={b.t} />
                            <Txt text={b.v} n={4} ph="No data available." />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
