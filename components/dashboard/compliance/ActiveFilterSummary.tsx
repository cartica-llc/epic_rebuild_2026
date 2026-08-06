'use client';

import React from 'react';

import type { FlagFilterValue } from './FlagFilterMenu';
import { CONSISTENCY_FLAG_META, FLAG_META } from './uiPrimitives';

function isConsistencyId(id: FlagFilterValue): id is keyof typeof CONSISTENCY_FLAG_META {
    return id !== 'All' && id in CONSISTENCY_FLAG_META;
}

export function ActiveFilterSummary({
                                        count,
                                        statusFilter,
                                        adminFilter,
                                        periodFilter,
                                        flagFilter,
                                        searchTerm,
                                    }: {
    count: number;
    statusFilter: string;
    adminFilter: string;
    periodFilter: string;
    flagFilter: FlagFilterValue;
    searchTerm: string;
}) {
    const trimmedSearch = searchTerm.trim();
    const hasAnyFilter =
        statusFilter !== 'All' ||
        adminFilter !== 'All' ||
        periodFilter !== 'All' ||
        flagFilter !== 'All' ||
        trimmedSearch !== '';

    if (!hasAnyFilter) return null;

    const flagMeta =
        flagFilter === 'All' ? null : isConsistencyId(flagFilter) ? CONSISTENCY_FLAG_META[flagFilter] : FLAG_META[flagFilter];

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm leading-relaxed text-slate-700">
                There {count === 1 ? 'is' : 'are'} currently{' '}
                <span className="font-semibold text-indigo-600">{count.toLocaleString()}</span>{' '}
                {count === 1 ? 'project' : 'projects'}
                {statusFilter !== 'All' && (
                    <>
                        {' '}
                        that are <span className="font-semibold text-indigo-600">{statusFilter}</span>
                    </>
                )}
                {adminFilter !== 'All' && (
                    <>
                        {' '}
                        from <span className="font-semibold text-indigo-600">{adminFilter}</span>
                    </>
                )}
                {periodFilter !== 'All' && (
                    <>
                        {' '}
                        in <span className="font-semibold text-indigo-600">{periodFilter}</span>
                    </>
                )}
                {flagMeta && (
                    <>
                        {' '}
                        that are <span className="font-semibold text-indigo-600">{flagMeta.label}</span>
                    </>
                )}
                {trimmedSearch !== '' && (
                    <>
                        {' '}
                        matching &ldquo;{trimmedSearch}&rdquo;
                    </>
                )}
                .
            </p>

            {flagMeta && (
                <p className="mt-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                    <span className="font-semibold text-indigo-600">{flagMeta.label}:</span> {flagMeta.description}
                </p>
            )}
        </div>
    );
}