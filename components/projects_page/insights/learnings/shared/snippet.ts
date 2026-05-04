// components/projects_page/insights/learnings/shared/snippet.ts

import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

/**
 * Build an excerpt from a long narrative string, optionally centered on the
 * first occurrence of `query`. Keeps the result reasonable for inline display.
 */
export function buildExcerpt(
    text: string | null,
    query: string | undefined,
    maxLength = 280,
): string {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) return trimmed;

    const q = query?.trim().toLowerCase() ?? '';
    if (!q) {
        return `${trimmed.slice(0, maxLength).trimEnd()}…`;
    }

    const lower = trimmed.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) {
        return `${trimmed.slice(0, maxLength).trimEnd()}…`;
    }

    // Center the excerpt around the match.
    const padding = Math.floor((maxLength - q.length) / 2);
    const start = Math.max(0, idx - padding);
    const end = Math.min(trimmed.length, start + maxLength);
    const slice = trimmed.slice(start, end);

    const prefix = start > 0 ? '…' : '';
    const suffix = end < trimmed.length ? '…' : '';
    return `${prefix}${slice}${suffix}`;
}

/**
 * Highlight occurrences of `query` inside `text`. Returns React nodes so callers
 * can render the result directly. Case-insensitive, no regex special-char issues.
 */
export function highlightMatches(text: string, query: string | undefined): ReactNode {
    const q = query?.trim() ?? '';
    if (!q) return text;

    const lowerText = text.toLowerCase();
    const lowerQ = q.toLowerCase();

    const parts: ReactNode[] = [];
    let cursor = 0;
    let key = 0;

    while (cursor < text.length) {
        const idx = lowerText.indexOf(lowerQ, cursor);
        if (idx === -1) {
            parts.push(text.slice(cursor));
            break;
        }
        if (idx > cursor) parts.push(text.slice(cursor, idx));
        parts.push(
            createElement(
                'mark',
                {
                    key: key++,
                    className: 'rounded-sm bg-amber-100 px-0.5 text-slate-900',
                },
                text.slice(idx, idx + q.length),
            ),
        );
        cursor = idx + q.length;
    }

    return createElement(Fragment, null, ...parts);
}
