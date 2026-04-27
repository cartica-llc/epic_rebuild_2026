// ─── components/project_forms/tabs/FinanceTab.tsx ────────────────────

'use client';

import type { ProjectFormData, FormSetter, LookupData } from '../types';
import { Field, TextInput, SectionDivider } from '../FormPrimitives';
import { MultiSelectDropdown } from '../MultiSelectDropdown';
import { CompanyMultiSelect } from '../CompanyMultiSelect';
import { CurrencyInput, RatioInput, IntegerInput } from '../FinanceInputs';

export function FinanceTab({ data, set, lookups, onAddCompany }: {
    data: ProjectFormData; set: FormSetter; lookups: LookupData | null; onAddCompany: () => void;
}) {
    const half = 'w-full sm:w-[calc(50%-10px)]';
    const full = 'w-full';

    return (
        <div className="flex flex-wrap gap-x-5 gap-y-5">
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

            <SectionDivider title="Dollar Amounts" />
            <div className={half}>
                <Field label="Committed funding amount" tooltip="Funds dedicated by administrators to this project.">
                    <CurrencyInput value={data.committedFundingAmt} onChange={(v) => set('committedFundingAmt', v)} placeholder="1,500,000.00" />
                </Field>
            </div>
            <div className={half}>
                <Field label="Encumbered funding" tooltip="Funds dedicated to an executed contract.">
                    <CurrencyInput value={data.encumberedFunding} onChange={(v) => set('encumberedFunding', v)} placeholder="750,000.00" />
                </Field>
            </div>
            <div className={half}>
                <Field label="Expended to date" tooltip="Funds paid to contractors or spent internally through end of most recent quarter.">
                    <CurrencyInput value={data.fundsExpended} onChange={(v) => set('fundsExpended', v)} placeholder="250,000.00" />
                </Field>
            </div>
            <div className={half}>
                <Field label="Admin & overhead cost" tooltip="Total administrative and overhead costs for the grant or contract recipient.">
                    <CurrencyInput value={data.adminAndOverheadCost} onChange={(v) => set('adminAndOverheadCost', v)} placeholder="50,000.00" />
                </Field>
            </div>
            <div className={half}>
                <Field label="Contract amount" tooltip="Total contract amount for this EPIC project.">
                    <CurrencyInput value={data.contractAmount} onChange={(v) => set('contractAmount', v)} placeholder="1,200,000.00" />
                </Field>
            </div>
            <div className={half}>
                <Field label="Leveraged funds" tooltip="Funds attracted from federal agencies or external parties to further develop the concept.">
                    <CurrencyInput value={data.leveragedFunds} onChange={(v) => set('leveragedFunds', v)} placeholder="300,000.00" />
                </Field>
            </div>

            <SectionDivider title="Bidder Information" />
            <div className={half}>
                <Field label="Number of bidders" tooltip="Total number of bidders who submitted proposals.">
                    <IntegerInput value={data.numOfBidders} onChange={(v) => set('numOfBidders', v)}
                                  placeholder="e.g. 4" hint="Whole number — total proposals received" />
                </Field>
            </div>
            <div className={half}>
                <Field label="Rank of selected bidder" tooltip="Rank of the selected bidder among all bidders (1 = highest scoring).">
                    <IntegerInput value={data.rankOfSelectedBidders} onChange={(v) => set('rankOfSelectedBidders', v)}
                                  placeholder="e.g. 2" hint="1 = highest scoring bidder" />
                </Field>
            </div>
            <div className={full}>
                <Field label="Bidder selection rationale" tooltip="If not the highest-scoring bidder, explain why this bidder was selected.">
                    <TextInput placeholder="e.g. Selected bidder ranked 2nd but offered a superior technical approach and lower cost..."
                               value={data.bidderDescription} onChange={(e) => set('bidderDescription', e.target.value)} />
                </Field>
            </div>

            <SectionDivider title="Match Funding" />
            <div className={half}>
                <Field label="Match funding split" tooltip="Sum of match funding ÷ (sum of match funding + contract amount). Stored as a decimal ratio.">
                    <RatioInput value={data.matchFundingSplit} onChange={(v) => set('matchFundingSplit', v)} />
                </Field>
            </div>
        </div>
    );
}