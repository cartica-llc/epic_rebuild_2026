// ─── components/project_forms/tabs/DetailsTab.tsx ────────────────────

'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, UploadCloud, X, ExternalLink, Loader2 } from 'lucide-react';
import type { ProjectFormData, FormSetter, FormValue, LookupData } from '../types';
import { Field, Textarea } from '../FormPrimitives';
import { MultiSelectDropdown } from '../MultiSelectDropdown';

// ─── ReportLink ───────────────────────────────────────────────────────────────

function ReportLink({ storedKey }: { storedKey: string }) {

    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        fetch(`/api/finalReport/url?key=${encodeURIComponent(storedKey)}`)
            .then((r) => r.json())
            .then((d: { url: string | null }) => {
                if (!cancelled) setUrl(d.url ?? null);
            })
            .catch(() => {
                if (!cancelled) setUrl(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };

    }, []);

    const displayName = storedKey.includes('/') ? storedKey.split('/').pop()! : storedKey;

    if (loading) {
        return (
            <span className="flex flex-1 items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading report&hellip;
            </span>
        );
    }

    if (url) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center gap-1.5 truncate text-sm text-blue-600 underline hover:text-blue-800"
                title={storedKey}
            >
                {displayName}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
        );
    }

    return (
        <span className="flex-1 truncate text-sm text-slate-400" title={storedKey}>
            {displayName}
            <span className="ml-2 text-xs">(not found in storage)</span>
        </span>
    );
}

// ─── FinalReportUpload ────────────────────────────────────────────────────────

interface FinalReportUploadProps {
    storedKey: string;
    pendingFile: File | null;
    markedForDeletion: boolean;
    onPendingChange: (file: File | null, markedForDeletion: boolean) => void;
}

function FinalReportUpload({ storedKey, pendingFile, markedForDeletion, onPendingChange }: FinalReportUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        onPendingChange(file, false);
        e.target.value = '';
    };

    // ── 1. File staged, not yet saved ────────────────────────────────────────
    if (pendingFile) {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-blue-500" />
                <span className="flex-1 truncate text-sm text-blue-800">
                    {pendingFile.name}
                    <span className="ml-2 text-xs text-blue-400">(will upload on save)</span>
                </span>
                <button
                    type="button"
                    onClick={() => onPendingChange(null, false)}
                    className="rounded-full p-1 text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
                    title="Cancel"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    // ── 2. Existing report marked for deletion ────────────────────────────────
    if (markedForDeletion && storedKey) {
        const displayName = storedKey.includes('/') ? storedKey.split('/').pop() : storedKey;
        return (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-red-400 line-through" />
                <span className="flex-1 truncate text-sm text-red-500 line-through">{displayName}</span>
                <span className="shrink-0 text-xs text-red-400">(will be removed on save)</span>
                <button
                    type="button"
                    onClick={() => onPendingChange(null, false)}
                    className="ml-1 shrink-0 rounded-full px-2 py-1 text-xs text-red-500 underline transition-colors hover:text-red-700"
                >
                    Undo
                </button>
            </div>
        );
    }

    // ── 3. Existing report on record ─────────────────────────────────────────

    if (storedKey) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                    <ReportLink key={storedKey} storedKey={storedKey} />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                    >
                        <UploadCloud className="h-3.5 w-3.5" />
                        Replace report
                    </button>
                    <button
                        type="button"
                        onClick={() => onPendingChange(null, true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                        <X className="h-3.5 w-3.5" />
                        Remove
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
        );
    }

    // ── 4. No report on record ───────────────────────────────────────────────
    return (
        <>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            >
                <UploadCloud className="h-5 w-5" />
                Upload final report (PDF)
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
            />
        </>
    );
}

// ─── DetailsTab ───────────────────────────────────────────────────────────────

export function DetailsTab({ data, set, lookups, requiredKeys }: {
    data: ProjectFormData;
    set: FormSetter;
    lookups: LookupData | null;
    requiredKeys?: Set<keyof ProjectFormData>;
}) {
    const req = (key: keyof ProjectFormData) => requiredKeys?.has(key) ?? false;

    const fields: [string, string, string | null][] = [
        ['detailedDescription', 'Detailed project description', null],
        ['projectSummary', 'Project summary', null],
        ['projectUpdate', 'Project update', null],
        ['deliverables', 'Deliverables', null],
        ['statePolicySupport', 'How it supports state policy', "How the project leads to technological advancement or breakthroughs to achieve the state's statutory energy goals."],
        ['technicalBarriers', 'Technical barriers', 'How the project will overcome technical challenges.'],
        ['marketBarriers', 'Market barriers', 'How the project addresses economic, social, environmental, political, and other non-technical barriers.'],
        ['policyAndRegulatoryBarriers', 'Policy & regulatory barriers', 'Any policy and regulatory barriers to the adoption of the project or innovation.'],
        ['gettingToScale', 'Getting to scale', 'What is needed to get the project to scale, next steps, or implementation by utilities.'],
        ['keyInnovations', 'Key innovations', 'Key innovations anticipated at launch vs. state of the art in comparable technology.'],
        ['keyLearnings', 'Key learnings', 'Key learnings and innovations realized from the project at completion.'],
        ['scalability', 'Scalability', 'How well the innovation scales up or down and can be duplicated or adapted to other settings.'],
        ['cyberSecurityNarrative', 'Cyber security narrative', 'Cybersecurity considerations confronted by the project and how they were addressed.'],
    ];

    return (
        <div className="grid grid-cols-1 gap-y-4">
            {/* ── Utility service areas ─────────────────────────────────────── */}
            <Field label="Utility service areas" full required={req('utilityServiceAreaIds')}>
                <MultiSelectDropdown
                    value={data.utilityServiceAreaIds}
                    onChange={(v) => set('utilityServiceAreaIds', v)}
                    options={(lookups?.utilityServiceAreas ?? []).map((u) => ({ value: u.id, label: u.name }))}
                    placeholder="Select utility service areas..."
                />
            </Field>

            {fields.map(([key, label, tooltip]) => (
                <Field key={key} label={label} tooltip={tooltip ?? undefined} full>
                    <Textarea
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        value={data[key as keyof ProjectFormData] as string}
                        onChange={(e) => set(key, e.target.value)}
                    />
                </Field>
            ))}

            {/* ── Final report ─────────────────────────────────────────────── */}
            <Field label="Final report" full>
                <FinalReportUpload
                    storedKey={data.finalReportUrl}
                    pendingFile={data.pendingReportFile as File | null}
                    markedForDeletion={data.reportMarkedForDeletion as boolean}
                    onPendingChange={(file, del) => {
                        set('pendingReportFile', file as FormValue);
                        set('reportMarkedForDeletion', del as FormValue);
                    }}
                />
            </Field>
        </div>
    );
}