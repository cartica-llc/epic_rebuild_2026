// ─── components/project_details/overview/OverviewTab.tsx ─────────────

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Chips, FieldLabel, HR, LinkChips, Txt } from '../shared/atoms';
import { has } from '../shared/format';
import { useProjectDetails } from '../shared/useProjectData';
import type { ProjectCore } from '../types';
import { ContactCard } from './ContactCard';
import { ProjectAttributes } from './ProjectAttributes';

type Props = {
    project: ProjectCore;
};

type LookupOption = { id: number; name: string };
type LookupData = {
    investmentAreas: LookupOption[];
    developmentStages: LookupOption[];
    utilityServiceAreas: LookupOption[];
    businessClassifications: LookupOption[];
};

function fmtDate(iso: string | null | undefined) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    });
}

function makeResolver(list: LookupOption[] | undefined, filterKey: string) {
    const map = new Map<string, number>();
    list?.forEach((o) => {
        if (o.name) map.set(o.name.toLowerCase().trim(), o.id);
    });
    return (label: string) => {
        const id = map.get(label.toLowerCase().trim());
        return id != null ? `/projects?${filterKey}=${id}` : null;
    };
}

export function OverviewTab({ project }: Props) {
    const state = useProjectDetails(project.id);
    const [lookups, setLookups] = useState<LookupData | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/projectsList/lookups')
            .then((r) => r.json())
            .then((data) => {
                if (cancelled || data?.error) return;
                setLookups(data);
            })
            .catch(console.error);
        return () => {
            cancelled = true;
        };
    }, []);

    const resolvers = useMemo(
        () => ({
            investmentArea: makeResolver(lookups?.investmentAreas, 'investmentAreaId'),
            developmentStage: makeResolver(lookups?.developmentStages, 'developmentStageId'),
            utilityService: makeResolver(lookups?.utilityServiceAreas, 'utilityServiceId'),
            businessClass: makeResolver(lookups?.businessClassifications, 'businessClassId'),
        }),
        [lookups]
    );

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
                Unable to load project details: {state.message}
            </div>
        );
    }

    const details = state.data;

    return (
        <div className="space-y-14">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_260px]">
                <div>
                    <FieldLabel c="Summary" />
                    <Txt text={details.projectSummary} n={10} />
                </div>

                <div className="space-y-7 lg:border-l lg:border-slate-200 lg:pl-8">
                    <ContactCard details={details} leadCompany={project.leadCompany} />

                    <HR />

                    <div>
                        <FieldLabel c="Investment Areas" />
                        <LinkChips
                            items={details.investmentAreas}
                            hrefFor={resolvers.investmentArea}
                        />
                    </div>

                    <div>
                        <FieldLabel c="Development Stages" />
                        <LinkChips
                            items={details.developmentStages}
                            hrefFor={resolvers.developmentStage}
                        />
                    </div>

                    {has(details.projectPartners) && (
                        <div>
                            <FieldLabel c="Partners" />
                            {/* No filter param maps to partners — stays non-clickable */}
                            <Chips items={details.projectPartners} />
                        </div>
                    )}

                    <div>
                        <FieldLabel c="Location" />
                        <div className="space-y-0.5 text-xs text-slate-600">
                            {details.senateDistrictBefore && (
                                <p>Senate: {details.senateDistrictBefore}</p>
                            )}
                            {details.assemblyDistrictBefore && (
                                <p>Assembly: {details.assemblyDistrictBefore}</p>
                            )}
                        </div>
                        {has(details.utilityServiceAreas) && (
                            <div className="mt-2">
                                <LinkChips
                                    items={details.utilityServiceAreas}
                                    hrefFor={resolvers.utilityService}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <HR />

            <ProjectAttributes
                details={details}
                cpucDac={project.cpucDac}
                cpucLi={project.cpucLi}
            />

            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] text-slate-400">
                <span>
                    ID: <span className="font-medium text-slate-500">{project.id}</span>
                </span>
                <span>
                    Created:{' '}
                    <span className="font-medium text-slate-500">
                        {fmtDate(project.createdDate)}
                    </span>
                </span>
                <span>
                    Modified:{' '}
                    <span className="font-medium text-slate-500">
                        {fmtDate(project.modifiedDate)}
                    </span>
                </span>
                {project.projectType && (
                    <span>
                        Type:{' '}
                        <span className="font-medium text-slate-500">
                            {project.projectType}
                        </span>
                    </span>
                )}
            </div>
        </div>
    );
}