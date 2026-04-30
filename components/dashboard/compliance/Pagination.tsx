// components/dashboard/compliance/Pagination.tsx
'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Builds a windowed page-number array with ellipsis sentinels.
 * For 93 pages on page 10 you get something like:
 *   [1, '…', 8, 9, 10, 11, 12, '…', 93]
 *
 * `siblings` controls how many pages on each side of `current` to show.
 * Total visible buttons (excl. prev/next) is capped at ~7 by the window.
 */
export function buildPageRange(
    current: number,
    total: number,
    siblings = 1,
): (number | '…')[] {
    if (total <= 7 + siblings * 2) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const left = Math.max(2, current - siblings);
    const right = Math.min(total - 1, current + siblings);

    const showLeftDots = left > 2;
    const showRightDots = right < total - 1;

    const range: (number | '…')[] = [1];
    if (showLeftDots) range.push('…');
    for (let i = left; i <= right; i++) range.push(i);
    if (showRightDots) range.push('…');
    range.push(total);
    return range;
}

export function Pagination({
                               currentPage,
                               totalPages,
                               onChange,
                           }: {
    currentPage: number;
    totalPages: number;
    onChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    const pages = buildPageRange(currentPage, totalPages, 1);

    const baseBtn =
        'inline-flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-xs font-medium transition select-none';

    return (
        <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
                type="button"
                onClick={() => onChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`${baseBtn} bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {pages.map((p, i) =>
                p === '…' ? (
                    <span
                        key={`dots-${i}`}
                        className="inline-flex h-8 min-w-[24px] items-center justify-center text-xs text-slate-400"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        className={`${baseBtn} ${
                            p === currentPage
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                        }`}
                        aria-current={p === currentPage ? 'page' : undefined}
                    >
                        {p}
                    </button>
                ),
            )}

            <button
                type="button"
                onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`${baseBtn} bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
                aria-label="Next page"
            >
                <ChevronRight className="h-3.5 w-3.5" />
            </button>
        </nav>
    );
}