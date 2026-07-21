// ─── components/project_forms/tabs/FinanceTab.tsx ────────────────────
//
// Finance tab, restructured for quarterly records. The quarterly table is
// shown in BOTH create and edit modes:
//
//   the project fields (funding mechanisms, match funding partners,
//     bidder information) stay in the form — they are NOT quarterly.
//
//   Quarterly dollar amounts + match funding live in FinanceQuarterTable:
//       - Edit mode  (projectId set): SERVER mode — backed by
//         /api/projectEdit/[id]/financeQuarters (FINANCE_DETAIL = current
//         quarter, FINANCE_DETAIL_HISTORY = prior quarters). Changes save
//         immediately, scoped to this project.
//       - Create mode (no projectId): LOCAL mode — quarters staged in
//         data.quarters and submitted with the create payload; the newest
//         becomes FINANCE_DETAIL, the rest go to history.
//
//   • Match funding split is read-only everywhere — auto-calculated as
//     match ÷ (match + committed), and recomputed auto on snowflake.

'use client';

import type { ProjectFormData, FormSetter, LookupData, QuarterInput } from '../types';
import { Field, TextInput, SectionDivider } from '../FormPrimitives';
import { MultiSelectDropdown } from '../MultiSelectDropdown';
import { CompanyMultiSelect } from '../CompanyMultiSelect';
import { IntegerInput } from '../FinanceInputs';
import { FinanceQuarterTable } from '../FinanceQuarterTable';

export function FinanceTab({ data, set, lookups, onAddCompany, projectId }: {
    data: ProjectFormData;
    set: FormSetter;
    lookups: LookupData | null;
    onAddCompany: () => void;
    projectId?: number | null;
}) {
    const half = 'w-full sm:w-[calc(50%-10px)]';
    const full = 'w-full';

    return (
        <div className="flex flex-wrap gap-x-5 gap-y-5">
            {/* ──(not quarterly) ── */}
            <div className={full}>
                <Field label="Funding mechanisms">
                    <MultiSelectDropdown value={data.fundingMechanismIds} onChange={(v) => set('fundingMechanismIds', v)}
                                         options={(lookups?.fundingMechanisms ?? []).map((f) => ({ value: f.id, label: f.name }))}
                                         placeholder="Select funding mechanisms..." />
                </Field>
            </div>
            <div className={full}>
                <Field label="Match funding partners" tooltip="Companies providing match funding. Use + to add a company not yet in the system.">
                    <CompanyMultiSelect value={data.matchFundingPartnerIds} onChange={(ids) => set('matchFundingPartnerIds', ids)}
                                        companies={lookups?.companies ?? []} onAddNew={onAddCompany}
                                        placeholder="Search match funding partners..." />
                </Field>
            </div>

            <SectionDivider title="Bidder Information" />
            <div className={half}>
                <Field label="Number of bidders" tooltip="Total number of bidders who submitted proposals. Not updated quarterly.">
                    <IntegerInput value={data.numOfBidders} onChange={(v) => set('numOfBidders', v)}
                                  placeholder="e.g. 4" hint="Whole number — total proposals received" />
                </Field>
            </div>
            <div className={half}>
                <Field label="Rank of selected bidder" tooltip="Rank of the selected bidder among all bidders (1 = highest scoring). Not updated quarterly.">
                    <IntegerInput value={data.rankOfSelectedBidders} onChange={(v) => set('rankOfSelectedBidders', v)}
                                  placeholder="e.g. 2" hint="1 = highest scoring bidder" />
                </Field>
            </div>
            <div className={full}>
                <Field label="Bidder selection rationale" tooltip="If not the highest-scoring bidder, explain why this bidder was selected. Not updated quarterly.">
                    <TextInput placeholder="e.g. Selected bidder ranked 2nd but offered a superior technical approach and lower cost..."
                               value={data.bidderDescription} onChange={(e) => set('bidderDescription', e.target.value)} />
                </Field>
            </div>

            {/* Quarterly records (table in BOTH modes) */}
            <SectionDivider title="Quarterly Finance Records" />
            {projectId != null ? (
                <FinanceQuarterTable projectId={projectId} />
            ) : (
                <FinanceQuarterTable
                    value={data.quarters}
                    onChange={(quarters: QuarterInput[]) => set('quarters', quarters)}
                />
            )}
        </div>
    );
}