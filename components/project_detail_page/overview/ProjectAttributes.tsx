// ─── components/project_details/sections/ProjectAttributes.tsx ─────────
'use client';

import Link from 'next/link';
import { BB, FieldLabel } from '../shared/atoms';
import type { ProjectDetails } from '../types';

type Props = {
    details: ProjectDetails;
    cpucDac: boolean;
    cpucLi: boolean;
};

type Attr = {
    l: string;
    on: boolean;
    filterKey?: 'disadvantaged' | 'lowIncome' | 'communityBenefits';
};

export function ProjectAttributes({ details, cpucDac, cpucLi }: Props) {
    const attrs: Attr[] = [
        { l: 'Standards', on: details.standards },
        { l: 'Cyber security considerations', on: details.cyberSecurityConsiderations },
        { l: 'Energy efficiency workpaper', on: details.isEnergyEfficiencyWorkpaperProduced },
        { l: 'Community benefits', on: details.communityBenefits, filterKey: 'communityBenefits' },
        { l: 'Disadvantaged community', on: cpucDac, filterKey: 'disadvantaged' },
        { l: 'Low income community', on: cpucLi, filterKey: 'lowIncome' },
    ];

    return (
        <div>
            <FieldLabel c="Project Attributes" />
            <div className="flex flex-wrap gap-2">
                {attrs.map((a) => {
                    const badge = <BB label={a.l} on={a.on} />;

                    if (a.on && a.filterKey) {
                        return (
                            <Link
                                key={a.l}
                                href={`/projects?${a.filterKey}=1`}
                                title={`View all projects with ${a.l}`}
                                className="transition-opacity hover:opacity-80"
                            >
                                {badge}
                            </Link>
                        );
                    }

                    return <span key={a.l}>{badge}</span>;
                })}
            </div>
        </div>
    );
}