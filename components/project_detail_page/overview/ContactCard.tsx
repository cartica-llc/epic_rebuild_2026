'use client';

import { useState } from 'react';
import { Building2, ExternalLink, FileText, Loader2, Mail } from 'lucide-react';
import { FieldLabel } from '../shared/atoms';
import type { ProjectDetails } from '../types';

type Props = {
    details: ProjectDetails;
    leadCompany: string | null;
};

function normalizeWebsiteUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

export function ContactCard({ details, leadCompany }: Props) {
    const [loadingReport, setLoadingReport] = useState(false);

    const handleFinalReport = async () => {
        if (!details.finalReportUrl || loadingReport) return;
        setLoadingReport(true);
        try {
            const res = await fetch(
                `/api/finalReport/url?key=${encodeURIComponent(details.finalReportUrl)}`,
                { cache: 'no-store' }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const { url } = (await res.json()) as { url: string | null };
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        } catch (err) {
            console.error('[finalReport] failed to resolve URL:', err);
        } finally {
            setLoadingReport(false);
        }
    };

    const websiteUrl = details.projectWebsite
        ? normalizeWebsiteUrl(details.projectWebsite)
        : null;

    const hasLinks = details.finalReportUrl || websiteUrl;

    return (
        <div>
            <FieldLabel c="Project Contact" />

            {details.contactPersonName ? (
                <p className="text-sm font-semibold text-slate-900">
                    {details.contactPersonName}
                </p>
            ) : (
                <p className="text-xs italic text-slate-400">No contact listed</p>
            )}

            {details.contactPersonTitle && (
                <p className="mt-0.5 text-xs text-slate-500">
                    {details.contactPersonTitle}
                </p>
            )}

            {details.contactPersonEmail && (
                <a
                    href={`mailto:${details.contactPersonEmail}`}
                    className="mt-1 flex items-center gap-1.5 break-all text-xs text-slate-500 hover:text-slate-900"
                >
                    <Mail className="h-3 w-3 shrink-0" />
                    {details.contactPersonEmail}
                </a>
            )}

            {leadCompany && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 className="h-3 w-3 shrink-0" />
                    {leadCompany}
                </p>
            )}

            {hasLinks && (
                <div className="mt-3 flex flex-col gap-1.5">
                    {details.finalReportUrl && (
                        <button
                            type="button"
                            onClick={handleFinalReport}
                            disabled={loadingReport}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loadingReport ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <FileText className="h-3 w-3" />
                            )}
                            {loadingReport ? 'Opening…' : 'Final Report'}
                        </button>
                    )}

                    {websiteUrl && (
                        <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            <ExternalLink className="h-3 w-3" />
                            <span className="max-w-[180px] truncate">
                                Project Website
                            </span>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}