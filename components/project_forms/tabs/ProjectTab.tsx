// ─── components/project_forms/tabs/ProjectTab.tsx ────────────────────

'use client';

import type { ProjectFormData, FormSetter, LookupData } from '../types';
import { inputClass, prefixForAdminId, PROJECT_NUMBER_MAX } from '../types';
import { Field, TextInput, Select, Checkbox, SectionDivider } from '../FormPrimitives';
import { MultiSelectDropdown } from '../MultiSelectDropdown';
import { ImageUploadZone } from '../ImageUploadZone';
import { CompanySearchSelect } from '../CompanySearchSelect';
import { CompanyMultiSelect } from '../CompanyMultiSelect';
import { DistrictSearchSelect } from '../DistrictSearchSelect';
import { useProjectNumberCheck } from '../Useprojectnumbercheck';

export function ProjectTab({ data, set, lookups, isMaster, lockedPrefix, onAddCompany, requiredKeys, mode, projectId }: {
    data: ProjectFormData; set: FormSetter;
    lookups: LookupData | null; isMaster: boolean; lockedPrefix: string;
    onAddCompany: () => void;
    requiredKeys?: Set<keyof ProjectFormData>;
    mode?: 'create' | 'edit';
    projectId?: string | number;
}) {
    const adminId = typeof data.programAdminId === 'number' ? data.programAdminId : null;
    const prefix = adminId !== null ? prefixForAdminId(adminId) : '';

    const req = (key: keyof ProjectFormData) => requiredKeys?.has(key) ?? false;


    const isEdit = mode === 'edit';

    // Skip in edit mode since the number can't change anyway.
    const pnCheck = useProjectNumberCheck(
        prefix,
        isEdit ? '' : data.projectNumber,
        isEdit ? projectId : undefined,
    );

    const numberPartMax = prefix
        ? Math.max(0, PROJECT_NUMBER_MAX - prefix.length - 1)
        : PROJECT_NUMBER_MAX;
    const fullNumberLength = prefix
        ? prefix.length + 1 + data.projectNumber.length
        : data.projectNumber.length;
    const tooLong = fullNumberLength > PROJECT_NUMBER_MAX;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="Project name" full required={req('projectName')}>
                <TextInput placeholder="Enter project name" value={data.projectName} onChange={(e) => set('projectName', e.target.value)} />
            </Field>

            <Field label="Program admin" tooltip="The utility or CEC program administering this project." required={req('programAdminId')}>
                {isMaster && !isEdit ? (
                    <Select value={data.programAdminId} onChange={(e) => set('programAdminId', e.target.value ? Number(e.target.value) : '')}
                            options={(lookups?.programAdmins ?? []).map((a) => ({ value: a.id, label: a.name }))} placeholder="Select admin..." />
                ) : (
                    <div className={inputClass + ' flex items-center !bg-slate-50 !cursor-default'}>
                        <span className="font-medium text-slate-700">{isEdit ? prefix : lockedPrefix}</span>
                        <span className="ml-2 text-[10px] text-slate-400">
                            {isEdit ? '(locked — cannot be changed after creation)' : '(locked to your organization)'}
                        </span>
                    </div>
                )}
            </Field>

            <Field label="Project number" required={req('projectNumber')}>
                <TextInput placeholder={prefix ? 'Enter number' : 'Select admin first'} value={data.projectNumber}
                           onChange={(e) => set('projectNumber', e.target.value.toUpperCase().slice(0, numberPartMax))}
                           disabled={isEdit || (!prefix && isMaster)} prefix={prefix ? `${prefix}-` : undefined}
                           maxLength={numberPartMax} />
                {isEdit && (
                    <p className="mt-1 text-[11px] text-slate-400">
                        Project numbers cannot be changed after creation
                    </p>
                )}
                {/* ── Length helper (create mode only) ── */}
                {!isEdit && prefix && data.projectNumber && !tooLong && (
                    <p className="mt-1 text-[11px] text-slate-400">
                        {fullNumberLength}/{PROJECT_NUMBER_MAX} characters
                    </p>
                )}
                {!isEdit && tooLong && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Project number cannot exceed {PROJECT_NUMBER_MAX} characters (including the &ldquo;{prefix}-&rdquo; prefix)
                    </p>
                )}
                {/* ── Inline uniqueness status (create mode only) ── */}
                {!isEdit && pnCheck.status === 'checking' && (
                    <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="animate-spin shrink-0">
                            <circle cx="8" cy="8" r="6" stroke="#94a3b8" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
                        </svg>
                        Verifying project number…
                    </p>
                )}
                {!isEdit && pnCheck.status === 'taken' && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        This project number already exists — please enter a different number
                    </p>
                )}
                {!isEdit && pnCheck.status === 'error' && (
                    <p className="mt-1 text-xs text-amber-600 flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 5v3M8 10.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Could not verify — please try again
                    </p>
                )}
            </Field>

            <Field label="Project start date" tooltip="The beginning date of the project.">
                <TextInput type="date" value={data.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </Field>
            <Field label="Project end date" tooltip="The end date of the project.">
                <TextInput type="date" value={data.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </Field>
            <Field label="Project award date" full>
                <TextInput type="date" value={data.projectAwardDate} onChange={(e) => set('projectAwardDate', e.target.value)} />
            </Field>

            <Field label="Project status" tooltip="Whether the project is still active or has been completed." full required={req('projectStatus')}>
                <Select value={data.projectStatus} onChange={(e) => set('projectStatus', e.target.value)}
                        options={(lookups?.projectStatuses ?? []).map((s) => ({ value: s, label: s }))} placeholder="Select status..." />
            </Field>

            <Field label="Project public URL">
                <TextInput placeholder="https://..." value={data.projectPublicUrl} onChange={(e) => set('projectPublicUrl', e.target.value)} />
            </Field>
            <Field label="Project website URL">
                <TextInput placeholder="https://..." value={data.projectWebsiteUrl} onChange={(e) => set('projectWebsiteUrl', e.target.value)} />
            </Field>

            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <ImageUploadZone label="Main Project Image" images={data.mainImage ? [data.mainImage] : []}
                                 onAdd={(img) => set('mainImage', img)}
                                 onRemove={() => {
                                     if (data.mainImage?.isExisting) set('deletedImages', [...(data.deletedImages || []), data.mainImage.name]);
                                     set('mainImage', null);
                                 }}
                                 max={1} disabled={!data.projectNumber} />
                <ImageUploadZone label="Gallery Images" images={data.galleryImages || []}
                                 onAdd={(img) => set('galleryImages', [...(data.galleryImages || []), img])}
                                 onRemove={(i) => {
                                     const removed = (data.galleryImages || [])[i];
                                     if (removed?.isExisting) set('deletedImages', [...(data.deletedImages || []), removed.name]);
                                     set('galleryImages', (data.galleryImages || []).filter((_: { name: string; url: string }, idx: number) => idx !== i));
                                 }}
                                 max={6} disabled={!data.projectNumber} />
            </div>
            {!data.projectNumber && (
                <div className="col-span-2 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M8 5v3M8 10.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    Enter a valid project number to enable image uploads
                </div>
            )}

            <SectionDivider title="Flags" />
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                <Checkbox label="Standards" checked={data.standards} onChange={(e) => set('standards', e.target.checked)} tooltip="Whether the project referenced or met existing standards, or led to new standards." />
                <Checkbox label="Cyber security considerations" checked={data.cyberSecurityConsiderations} onChange={(e) => set('cyberSecurityConsiderations', e.target.checked)} tooltip="The project has information related to cybersecurity." />
                <Checkbox label="Energy efficiency workpaper" checked={data.isEnergyEfficiencyWorkpaperProduced} onChange={(e) => set('isEnergyEfficiencyWorkpaperProduced', e.target.checked)} tooltip="The project will or has produced data for energy savings calculations." />
                <Checkbox label="Community benefits" checked={data.communityBenefits} onChange={(e) => set('communityBenefits', e.target.checked)} tooltip="The project has demonstrated community benefits." />
                <Checkbox label="Disadvantaged community" checked={data.cpucDac} onChange={(e) => set('cpucDac', e.target.checked)} />
                <Checkbox label="Low income community" checked={data.cpucLi} onChange={(e) => set('cpucLi', e.target.checked)} />
            </div>

            <SectionDivider title="Visibility" />
            <div className="col-span-2">
                <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={data.isActive}
                        onClick={() => set('isActive', !data.isActive)}
                        className={[
                            'relative shrink-0 mt-0.5 inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                            data.isActive
                                ? 'bg-emerald-500 focus:ring-emerald-400'
                                : 'bg-slate-300 focus:ring-slate-400',
                        ].join(' ')}
                    >
                        <span
                            className={[
                                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200',
                                data.isActive ? 'translate-x-5' : 'translate-x-0',
                            ].join(' ')}
                        />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                                {data.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={[
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                                data.isActive
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                    : 'bg-slate-100 text-slate-500 ring-slate-200',
                            ].join(' ')}>
                                {data.isActive ? 'Published' : 'Unpublished'}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            {data.isActive
                                ? 'This project is published and visible to the public on the portfolio website.'
                                : 'This project is unpublished and only visible to admins. Toggle on to make it public.'}
                        </p>
                    </div>
                </div>
            </div>

            <SectionDivider title="Contact Person" />
            <Field label="First name" required={req('contactFirstName')}><TextInput placeholder="First name" value={data.contactFirstName} onChange={(e) => set('contactFirstName', e.target.value)} /></Field>
            <Field label="Last name" required={req('contactLastName')}><TextInput placeholder="Last name" value={data.contactLastName} onChange={(e) => set('contactLastName', e.target.value)} /></Field>
            <Field label="Email" required={req('contactEmail')}><TextInput type="email" placeholder="email@example.com" value={data.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></Field>
            <Field label="Title"><TextInput placeholder="Job title" value={data.contactTitle} onChange={(e) => set('contactTitle', e.target.value)} /></Field>

            <SectionDivider title="Senate & Assembly Districts" />
            <div className="hidden col-span-2 flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-500">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-px text-slate-400">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 7v4M8 5.5v-.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>
                    Search by district number or location name. Assembly has 80 districts (AD 1–80); Senate has 39 (SD 1–39).
                    The <span className="font-medium text-slate-700">before</span> fields reflect pre-2021 boundaries;
                    the <span className="font-medium text-slate-700">after</span> fields reflect post-redistricting boundaries.
                </span>
            </div>
            <Field label="Assembly district — before redistrict" tooltip="California Assembly District where the project is located under pre-2021 boundaries." required={req('assemblyDistrictBeforeId')}>
                <DistrictSearchSelect value={data.assemblyDistrictBeforeId} onChange={(id) => set('assemblyDistrictBeforeId', id)} districts={lookups?.assemblyDistricts ?? []} placeholder="Search assembly districts…" />
            </Field>
            <Field label="Assembly district — after redistrict" required={req('assemblyDistrictAfterId')}>
                <DistrictSearchSelect value={data.assemblyDistrictAfterId} onChange={(id) => set('assemblyDistrictAfterId', id)} districts={lookups?.assemblyDistricts ?? []} placeholder="Search assembly districts…" />
            </Field>
            <Field label="Senate district — before redistrict" required={req('senateDistrictBeforeId')}>
                <DistrictSearchSelect value={data.senateDistrictBeforeId} onChange={(id) => set('senateDistrictBeforeId', id)} districts={lookups?.senateDistricts ?? []} placeholder="Search senate districts…" />
            </Field>
            <Field label="Senate district — after redistrict" required={req('senateDistrictAfterId')}>
                <DistrictSearchSelect value={data.senateDistrictAfterId} onChange={(id) => set('senateDistrictAfterId', id)} districts={lookups?.senateDistricts ?? []} placeholder="Search senate districts…" />
            </Field>

            <SectionDivider title="Classification & Partners" />
            <Field label="Project type" tooltip="Applied R&D, Technology Demonstration, or Market Facilitation." required={req('projectTypeId')}>
                <Select value={data.projectTypeId} onChange={(e) => set('projectTypeId', e.target.value ? Number(e.target.value) : '')} options={(lookups?.projectTypes ?? []).map((t) => ({ value: t.id, label: t.name }))} placeholder="Select type..." />
            </Field>
            <Field label="Investment program period" tooltip="EPIC program period." required={req('investmentPeriodId')}>
                <Select value={data.investmentPeriodId} onChange={(e) => set('investmentPeriodId', e.target.value ? Number(e.target.value) : '')} options={(lookups?.investmentProgramPeriods ?? []).map((p) => ({ value: p.id, label: p.name }))} placeholder="Select period..." />
            </Field>
            <Field label="Business classifications" full required={req('businessClassificationIds')}>
                <MultiSelectDropdown value={data.businessClassificationIds} onChange={(v) => set('businessClassificationIds', v)} options={(lookups?.businessClassifications ?? []).map((b) => ({ value: b.id, label: b.name }))} placeholder="Select business classifications..." />
            </Field>
            <Field label="Confidential information categories" full>
                <MultiSelectDropdown value={data.confidentialInformationCategoryIds} onChange={(v) => set('confidentialInformationCategoryIds', v)} options={(lookups?.confidentialCategories ?? []).map((c) => ({ value: c.id, label: c.name }))} placeholder="Select confidential categories..." />
            </Field>
            <Field label="Development stages" full>
                <MultiSelectDropdown value={data.developmentStageIds} onChange={(v) => set('developmentStageIds', v)} options={(lookups?.developmentStages ?? []).map((d) => ({ value: d.id, label: d.name }))} placeholder="Select development stages..." />
            </Field>
            <Field label="Investment areas" full required={req('investmentAreaIds')}>
                <MultiSelectDropdown value={data.investmentAreaIds} onChange={(v) => set('investmentAreaIds', v)} options={(lookups?.investmentAreas ?? []).map((a) => ({ value: a.id, label: a.name }))} placeholder="Select investment areas..." />
            </Field>
            <Field label="CPUC Proceedings" full>
                <MultiSelectDropdown value={data.cpucProceedingIds} onChange={(v) => set('cpucProceedingIds', v)} options={Array.from(
                    new Map((lookups?.cpucProceedings ?? []).map((c) => [c.id, { value: c.id, label: c.name }])).values()
                )} placeholder="Select CPUC proceedings..." />
            </Field>
            <Field label="Project lead" required={req('leadCompanyId')}>
                <CompanySearchSelect value={data.leadCompanyId} onChange={(id) => set('leadCompanyId', id)}
                                     companies={lookups?.companies ?? []} onAddNew={onAddCompany} placeholder="Search lead company..." />
            </Field>
            <Field label="Partners">
                <CompanyMultiSelect value={data.partnerCompanyIds} onChange={(ids) => set('partnerCompanyIds', ids)}
                                    companies={lookups?.companies ?? []} placeholder="Search partner companies..." />
            </Field>

            {String(data.programAdminId) === '0' && (
                <>
                    <SectionDivider title="CEC Manager" />
                    <Field label="CEC manager first name" required={req('cecMgrFirstName')}><TextInput placeholder="First name" value={data.cecMgrFirstName} onChange={(e) => set('cecMgrFirstName', e.target.value)} /></Field>
                    <Field label="CEC manager last name" required={req('cecMgrLastName')}><TextInput placeholder="Last name" value={data.cecMgrLastName} onChange={(e) => set('cecMgrLastName', e.target.value)} /></Field>
                    <Field label="CEC manager title"><TextInput placeholder="Title" value={data.cecMgrTitle} onChange={(e) => set('cecMgrTitle', e.target.value)} /></Field>
                    <Field label="CEC manager phone"><TextInput placeholder="Phone number" value={data.cecMgrPhone} onChange={(e) => set('cecMgrPhone', e.target.value)} /></Field>
                    <Field label="CEC manager email" full required={req('cecMgrEmail')}><TextInput type="email" placeholder="email@energy.ca.gov" value={data.cecMgrEmail} onChange={(e) => set('cecMgrEmail', e.target.value)} /></Field>
                </>
            )}
        </div>
    );
}