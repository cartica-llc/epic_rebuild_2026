// ─── components/project_forms/ProjectForm.tsx ────────────────────────
// Shared tabbed form for Create and Edit project pages.

'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { AddCompanyModal } from './AddCompanyModal';

// ─── Local modules ───────────────────────────────────────────────────
import {
    type ProjectFormData,
    type LookupData,
    type FormValue,
    type SaveOverlay as SaveOverlayState,
    EMPTY_FORM,
    FINANCE_MAX,
    FIELD_LABELS,
    SKIP_FIELDS,
    prefixForAdminId,
    orgToAdminId,
} from './types';
import { FormTabs } from './FormTabs';
import { ProjectTab } from './tabs/ProjectTab';
import { DetailsTab } from './tabs/DetailsTab';
import { FinanceTab } from './tabs/FinanceTab';
import { AdditionalTab } from './tabs/AdditionalTab';
import { DangerZoneTab } from './tabs/DangerZoneTab';
import { SaveOverlay } from './SaveOverlay';
import { PendingChangesDialog, type ChangeEntry } from './PendingChangesDialog';
import { StageProgressBar } from './StageProgressBar';
import { StageInfoModal } from './StageInfoModal';
import { getEntryRequiredFormKeys, validateEntryStage } from './stageRequirements';
import { useProjectNumberCheck } from './Useprojectnumbercheck';
import type { LookupItem } from './types';

// ─── Main Component ──────────────────────────────────────────────────

interface ProjectFormProps {
    mode: 'create' | 'edit';
    projectId?: string | number;
    initialData?: Partial<ProjectFormData>;
}

export function ProjectForm({ mode, projectId, initialData }: ProjectFormProps) {
    const router = useRouter();
    const { data: session } = useSession();

    const userOrg = session?.user?.organization ?? null;
    const userGroups: string[] = (session?.user as { groups?: string[] } | undefined)?.groups ?? [];
    const isMaster = userGroups.includes('MasterAdmin');

    const [activeTab, setActiveTab] = useState<string>('project');
    const [data, setData] = useState<ProjectFormData>({ ...EMPTY_FORM, ...initialData });
    const [lookups, setLookups] = useState<LookupData | null>(null);
    const [saveOverlay, setSaveOverlay] = useState<SaveOverlayState>(null);
    const [loadingProject, setLoadingProject] = useState(mode === 'edit');
    const [error, setError] = useState('');
    const [showAddCompany, setShowAddCompany] = useState(false);
    const [addCompanyContext, setAddCompanyContext] = useState<'lead' | 'matchFunding'>('lead');
    const originalDataRef = useRef<ProjectFormData | null>(null);
    const [pendingChanges, setPendingChanges] = useState<ChangeEntry[] | null>(null);
    const [showStageInfo, setShowStageInfo] = useState(false);

    const entryRequiredKeys = useMemo(() => getEntryRequiredFormKeys(), []);

    const lockedAdminId = !isMaster && userOrg ? orgToAdminId(userOrg) : null;
    const lockedPrefix = lockedAdminId !== null ? prefixForAdminId(lockedAdminId) : '';

    const effectiveProgramAdminId =
        mode === 'create' && lockedAdminId !== null
            ? lockedAdminId
            : typeof data.programAdminId === 'number'
                ? data.programAdminId
                : null;

    const effectiveData: ProjectFormData = useMemo(
        () => ({
            ...data,
            programAdminId:
                mode === 'create' && lockedAdminId !== null
                    ? lockedAdminId
                    : data.programAdminId,
        }),
        [data, mode, lockedAdminId]
    );

    const currentPrefix = effectiveProgramAdminId !== null ? prefixForAdminId(effectiveProgramAdminId) : '';
    const pnCheck = useProjectNumberCheck(currentPrefix, data.projectNumber, mode === 'edit' ? projectId : undefined);

    const set = useCallback((key: string, val: FormValue) => {
        setData((d) => ({ ...d, [key]: val }));
    }, []);

    // ── Fetch lookups ──
    const fetchLookups = useCallback(() => {
        fetch('/api/formLookups')
            .then((r) => r.json())
            .then((d) => {
                if (!d.error) setLookups(d);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        fetchLookups();
    }, [fetchLookups]);

    // ── Company creation callback ──
    const handleCompanyCreated = useCallback((company: { id: number; name: string }) => {
        setLookups((prev) =>
            prev ? { ...prev, companies: [...prev.companies, { id: company.id, name: company.name }] } : prev
        );

        if (addCompanyContext === 'matchFunding') {
            setData((prev) => ({
                ...prev,
                matchFundingPartnerIds: [...prev.matchFundingPartnerIds, company.id],
            }));
        } else {
            setData((prev) => ({ ...prev, leadCompanyId: company.id }));
        }
    }, [addCompanyContext]);

    // ── Load existing project for edit mode ──
    useEffect(() => {
        if (mode !== 'edit' || !projectId) return;

        fetch(`/api/projectEdit/${projectId}`)
            .then((r) => r.json())
            .then(async (d) => {
                if (d.error) {
                    setError(d.error);
                    return;
                }

                const merged = { ...EMPTY_FORM, ...d };
                const fullPN = d.projectNumber ? `${prefixForAdminId(d.programAdminId)}-${d.projectNumber}` : '';

                if (fullPN) {
                    try {
                        const imgRes = await fetch(`/api/projectImages?projectNumber=${encodeURIComponent(fullPN)}`);
                        const imgData = await imgRes.json();

                        if (imgData.mainImage) {
                            merged.mainImage = { ...imgData.mainImage, isExisting: true };
                        }

                        if (imgData.galleryImages?.length) {
                            merged.galleryImages = imgData.galleryImages.map((g: { name: string; url: string }) => ({
                                ...g,
                                isExisting: true,
                            }));
                        }
                    } catch {
                        console.warn('Failed to load project images from S3');
                    }
                }

                setData(merged);
                originalDataRef.current = JSON.parse(JSON.stringify(merged));
            })
            .catch(() => setError('Failed to load project'))
            .finally(() => setLoadingProject(false));
    }, [mode, projectId]);

    // ── Change detection helpers ──

    const resolveLookupName = (key: string, val: unknown): string => {
        if (val === '' || val === null || val === undefined) return '(none)';

        const id = Number(val);
        if (isNaN(id)) return String(val);

        const lists: Record<string, LookupItem[] | undefined> = {
            programAdminId: lookups?.programAdmins,
            projectTypeId: lookups?.projectTypes,
            investmentPeriodId: lookups?.investmentProgramPeriods,
            assemblyDistrictBeforeId: lookups?.assemblyDistricts,
            assemblyDistrictAfterId: lookups?.assemblyDistricts,
            senateDistrictBeforeId: lookups?.senateDistricts,
            senateDistrictAfterId: lookups?.senateDistricts,
            leadCompanyId: lookups?.companies,
        };

        const list = lists[key];

        if (key.includes('DistrictBefore') || key.includes('DistrictAfter')) {
            const item = list?.find((x) => x.id === id);
            return item ? `District ${item.id} — ${item.name}` : String(val);
        }

        return list?.find((x) => x.id === id)?.name ?? String(val);
    };

    const resolveMultiNames = (key: string, ids: unknown[]): string => {
        if (!ids?.length) return '(none)';

        const multiLists: Record<string, LookupItem[] | undefined> = {
            investmentAreaIds: lookups?.investmentAreas,
            developmentStageIds: lookups?.developmentStages,
            cpucProceedingIds: lookups?.cpucProceedings,
            businessClassificationIds: lookups?.businessClassifications,
            utilityServiceAreaIds: lookups?.utilityServiceAreas,
            partnerCompanyIds: lookups?.companies,
            matchFundingPartnerIds: lookups?.companies,
            fundingMechanismIds: lookups?.fundingMechanisms,
            confidentialInformationCategoryIds: lookups?.confidentialCategories,
        };

        const list = multiLists[key];
        if (!list) return ids.join(', ');

        return ids.map((id) => list.find((x) => x.id === Number(id))?.name ?? String(id)).join(', ');
    };

    const formatDisplayValue = (key: string, val: unknown): string => {
        if (val === '' || val === null || val === undefined) return '(empty)';
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (Array.isArray(val)) return resolveMultiNames(key, val);
        if (typeof val === 'object' && val !== null && 'name' in val) return (val as { name: string }).name;

        if (
            [
                'programAdminId',
                'projectTypeId',
                'investmentPeriodId',
                'leadCompanyId',
                'assemblyDistrictBeforeId',
                'assemblyDistrictAfterId',
                'senateDistrictBeforeId',
                'senateDistrictAfterId',
            ].includes(key)
        ) {
            return resolveLookupName(key, val);
        }

        if (
            [
                'committedFundingAmt',
                'encumberedFunding',
                'fundsExpended',
                'adminAndOverheadCost',
                'contractAmount',
                'leveragedFunds',
            ].includes(key)
        ) {
            const n = parseFloat(String(val));
            if (Number.isFinite(n)) {
                return `$${n.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 3,
                })}`;
            }
        }

        if (key === 'matchFundingSplit') {
            const n = parseFloat(String(val));
            if (Number.isFinite(n)) return `${n} (${(n * 100).toFixed(2)}%)`;
        }

        const s = String(val);
        return s.length > 80 ? `${s.slice(0, 80)}…` : s;
    };

    const computeChanges = (): ChangeEntry[] => {
        const orig = originalDataRef.current;
        if (!orig) return [];

        const changes: ChangeEntry[] = [];

        for (const key of Object.keys(effectiveData) as (keyof ProjectFormData)[]) {
            if (SKIP_FIELDS.has(key)) continue;

            const oldVal = orig[key];
            const newVal = effectiveData[key];

            let changed = false;

            if (Array.isArray(oldVal) && Array.isArray(newVal)) {
                changed = JSON.stringify([...oldVal].sort()) !== JSON.stringify([...newVal].sort());
            } else if (typeof oldVal === 'object' && typeof newVal === 'object') {
                changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
            } else {
                changed = String(oldVal ?? '') !== String(newVal ?? '');
            }

            if (changed) {
                changes.push({
                    label: FIELD_LABELS[key] ?? key,
                    from: formatDisplayValue(key, oldVal),
                    to: formatDisplayValue(key, newVal),
                });
            }
        }

        return changes;
    };

    // ── Save flow ──

    const executeSave = async () => {
        setPendingChanges(null);

        const currentAdminId = effectiveProgramAdminId;
        if (currentAdminId === null) return;

        const prefix = prefixForAdminId(currentAdminId);
        const fullProjectNumber = data.projectNumber.trim() ? `${prefix}-${data.projectNumber.trim()}` : '';

        setSaveOverlay({ phase: 'saving' });

        try {
            const url = mode === 'create' ? '/api/projectCreate' : `/api/projectEdit/${projectId}`;
            const method = mode === 'create' ? 'POST' : 'PUT';

            const { pendingReportFile: _prf, reportMarkedForDeletion: _rmd, ...savePayload } = effectiveData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...savePayload,
                    projectNumber: fullProjectNumber,
                    programAdminId: currentAdminId,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setSaveOverlay({ phase: 'error', message: result.error ?? 'Something went wrong.' });
                return;
            }

            if (fullProjectNumber) {
                // ── Deferred image deletes ────────────────────────────────────
                for (const fileName of data.deletedImages) {
                    try {
                        await fetch('/api/projectImages', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projectNumber: fullProjectNumber, fileName }),
                        });
                    } catch {
                        console.warn(`Failed to delete image ${fileName}`);
                    }
                }

                // ── Deferred image uploads ────────────────────────────────────
                const imagesToUpload: { name: string; data: string; type: 'main' | 'gallery' }[] = [];

                if (data.mainImage && !data.mainImage.isExisting && data.mainImage.url.startsWith('data:')) {
                    imagesToUpload.push({
                        name: data.mainImage.name,
                        data: data.mainImage.url,
                        type: 'main',
                    });
                }

                for (const g of data.galleryImages) {
                    if (!g.isExisting && g.url.startsWith('data:')) {
                        imagesToUpload.push({
                            name: g.name,
                            data: g.url,
                            type: 'gallery',
                        });
                    }
                }

                if (imagesToUpload.length > 0) {
                    try {
                        await fetch('/api/projectImages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                projectNumber: fullProjectNumber,
                                images: imagesToUpload,
                            }),
                        });
                    } catch {
                        console.warn('Image upload failed — project data was saved');
                    }
                }

                // ── Deferred final report delete ──────────────────────────────
                if ((data.reportMarkedForDeletion as boolean) && data.finalReportUrl) {
                    try {
                        await fetch('/api/finalReport/delete', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                projectNumber: fullProjectNumber,
                                key: data.finalReportUrl,
                            }),
                        });
                    } catch {
                        console.warn('Final report delete failed — project data was saved');
                    }
                }

                // ── Deferred final report upload ──────────────────────────────
                if (data.pendingReportFile) {
                    try {
                        const fileData = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = () => reject(new Error('FileReader failed'));
                            reader.readAsDataURL(data.pendingReportFile as File);
                        });

                        await fetch('/api/finalReport/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                projectNumber: fullProjectNumber,
                                fileData,
                            }),
                        });
                    } catch {
                        console.warn('Final report upload failed — project data was saved');
                    }
                }
            }

            const targetId = mode === 'create' ? result.projectId : projectId;

            setSaveOverlay({
                phase: 'success',
                projectName: data.projectName,
                projectNumber: fullProjectNumber,
                targetId: targetId ?? '',
            });

            setTimeout(() => {
                router.push(`/projects/${targetId}`);
            }, 2800);
        } catch {
            setSaveOverlay({ phase: 'error', message: 'Network error. Please try again.' });
        }
    };

    const handleSave = () => {
        setError('');

        const missingEntry = validateEntryStage(effectiveData);
        if (missingEntry.length > 0) {
            const count = missingEntry.length;
            const preview = missingEntry.slice(0, 5).join(', ');
            const suffix = count > 5 ? `, and ${count - 5} more` : '';
            setError(`Missing required Entry fields (${count}): ${preview}${suffix}`);
            setActiveTab('project');
            return;
        }

        const currentAdminId = effectiveProgramAdminId;
        if (currentAdminId === null) {
            setError('Program administrator is required.');
            return;
        }

        if (pnCheck.status === 'taken') {
            setError('This project number already exists. Please enter a different number before saving.');
            setActiveTab('project');
            return;
        }

        if (pnCheck.status === 'checking') {
            setError('Still verifying the project number — please wait a moment and try again.');
            setActiveTab('project');
            return;
        }

        const financeFields: [string, string][] = [
            [data.committedFundingAmt, 'Committed funding amount'],
            [data.encumberedFunding, 'Encumbered funding'],
            [data.fundsExpended, 'Funds expended'],
            [data.adminAndOverheadCost, 'Admin & overhead cost'],
            [data.contractAmount, 'Contract amount'],
            [data.leveragedFunds, 'Leveraged funds'],
        ];

        for (const [val, label] of financeFields) {
            if (val.trim()) {
                const n = parseFloat(val);
                if (Number.isFinite(n) && Math.abs(n) > FINANCE_MAX) {
                    setError(`${label} exceeds the maximum allowed value of $999,999,999,999.`);
                    setActiveTab('finance');
                    return;
                }
            }
        }

        if (data.matchFundingSplit.trim()) {
            const n = parseFloat(data.matchFundingSplit);
            if (!Number.isFinite(n) || n < 0 || n > 1) {
                setError('Match funding split must be a decimal between 0 and 1 (e.g. 0.3333 for 33.33%).');
                setActiveTab('finance');
                return;
            }
        }

        if (mode === 'edit') {
            const changes = computeChanges();

            if (data.pendingReportFile) {
                const file = data.pendingReportFile as File;
                changes.push({ label: 'Final Report', from: data.finalReportUrl || '(none)', to: `Upload: ${file.name}` });
            } else if (data.reportMarkedForDeletion as boolean) {
                changes.push({ label: 'Final Report', from: data.finalReportUrl || '(none)', to: '(removed)' });
            }

            if (changes.length === 0) {
                setError('No changes detected.');
                return;
            }
            setPendingChanges(changes);
            return;
        }

        executeSave();
    };

    // ── Loading state ──

    if (loadingProject) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <span className="ml-2 text-sm text-slate-500">Loading project…</span>
            </div>
        );
    }

    // ── Tab content ──

    const tabContent: Record<string, React.ReactNode> = {
        project: (
            <ProjectTab
                data={effectiveData}
                set={set}
                lookups={lookups}
                isMaster={isMaster}
                lockedPrefix={lockedPrefix}
                onAddCompany={() => {
                    setAddCompanyContext('lead');
                    setShowAddCompany(true);
                }}
                requiredKeys={entryRequiredKeys}
                mode={mode}
                projectId={projectId}
            />
        ),
        details: <DetailsTab data={effectiveData} set={set} lookups={lookups} requiredKeys={entryRequiredKeys} />,
        finance: (
            <FinanceTab
                data={effectiveData}
                set={set}
                lookups={lookups}
                onAddCompany={() => {
                    setAddCompanyContext('matchFunding');
                    setShowAddCompany(true);
                }}
            />
        ),
        additional: <AdditionalTab data={effectiveData} set={set} />,
    };

    if (mode === 'edit' && projectId !== undefined) {
        const fullProjectNumber = currentPrefix && data.projectNumber
            ? `${currentPrefix}-${data.projectNumber}`
            : data.projectNumber;

        tabContent.danger = (
            <DangerZoneTab
                projectId={projectId}
                projectNumber={fullProjectNumber}
                projectName={data.projectName}
            />
        );
    }

    // ── Render ──

    return (
        <div className="min-h-screen bg-slate-50">
            {/* MOBILE: px-4 on mobile → px-6 on sm+ */}
            <div className="mt-6 mx-auto max-w-5xl px-4 sm:px-6 py-8 overflow-hidden">

                <div className="mb-6 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    {/* MOBILE: slightly smaller heading on mobile */}
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {mode === 'create' ? 'Create Project' : 'Edit Project'}
                    </h1>
                </div>

                <div className="mb-5">
                    <StageProgressBar data={effectiveData} onOpenInfo={() => setShowStageInfo(true)} />
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <FormTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    className="mb-6"
                    showDanger={mode === 'edit'}
                />

                {/* MOBILE: p-4 on mobile → p-6 on sm+ */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                    {tabContent[activeTab]}
                </div>

                <FormTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    className="mt-6"
                    showDanger={mode === 'edit'}
                />

                {/*
                    MOBILE: stack buttons vertically (col-reverse puts Save on top),
                    full-width each; on sm+ revert to right-aligned row.
                */}
                <div className="mt-6 pb-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saveOverlay?.phase === 'saving'}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                    >
                        {saveOverlay?.phase === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {saveOverlay?.phase === 'saving'
                            ? 'Saving...'
                            : mode === 'create'
                                ? 'Create Project'
                                : 'Save Changes'}
                    </button>
                </div>
            </div>

            <AddCompanyModal
                isOpen={showAddCompany}
                onClose={() => setShowAddCompany(false)}
                onCreated={handleCompanyCreated}
            />

            <SaveOverlay state={saveOverlay} mode={mode} onDismissError={() => setSaveOverlay(null)} />

            <StageInfoModal
                isOpen={showStageInfo}
                onClose={() => setShowStageInfo(false)}
                data={effectiveData}
            />

            {pendingChanges && (
                <PendingChangesDialog
                    changes={pendingChanges}
                    isSaving={saveOverlay?.phase === 'saving'}
                    onConfirm={executeSave}
                    onCancel={() => setPendingChanges(null)}
                />
            )}
        </div>
    );
}