// ─── components/project_forms/tabs/AdditionalTab.tsx ─────────────────

'use client';

import type { ProjectFormData, FormSetter } from '../types';
import { Field, Textarea } from '../FormPrimitives';

export function AdditionalTab({ data, set }: { data: ProjectFormData; set: FormSetter }) {
    const fields: [string, string, string | null][] = [
        ['electricitySystemReliabilityImpact', 'Electricity system reliability impact', 'A narrative of how the project affects grid reliability.'],
        ['electricitySystemSafetyImpact', 'Electricity system safety impact', 'A narrative of how the project affects electricity system safety.'],
        ['ghgImpacts', 'GHG impacts', 'GHG reductions in MMTCO2e, calculated for projected benefits at scale.'],
        ['environmentalImpactNonGhg', 'Environmental impact (non-GHG)', 'Avoided customer energy use, peak load reduction (MW), avoided procurement and generation costs, and other savings.'],
        ['projectedProjectBenefits', 'Projected project benefits', 'A narrative or list of projected project benefits as described in the application.'],
        ['ratepayersBenefits', 'Ratepayers benefits', null],
        ['communityBenefitsDesc', 'Community benefits description', null],
        ['energyImpact', 'Energy impact', null],
        ['infrastructureCostReductions', 'Infrastructure cost reductions & economic benefits', 'Reduced O&M costs, capital costs, electrical losses in T&D, and other economic benefits at scale.'],
        ['otherImpacts', 'Other impacts', 'Impacts related to custom, project-specific metrics.'],
        ['informationDissemination', 'Information dissemination', 'References and links to where project information has been published, including reports, publications, conferences, and news articles.'],
    ];

    return (
        <div className="grid grid-cols-1 gap-y-4">
            {fields.map(([key, label, tooltip]) => (
                <Field key={key} label={label} tooltip={tooltip ?? undefined} full>
                    <Textarea placeholder={`Enter ${label.toLowerCase()}...`} value={data[key as keyof ProjectFormData] as string} onChange={(e) => set(key, e.target.value)} />
                </Field>
            ))}
        </div>
    );
}
