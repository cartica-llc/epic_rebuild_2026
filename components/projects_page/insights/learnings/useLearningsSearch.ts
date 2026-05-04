// components/projects_page/insights/learnings/useLearningsSearch.ts

'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LearningsProject, NarrativeLens } from './shared/types';

const DEBOUNCE_MS = 300;

export interface SearchParams {
    q: string;
    lens: NarrativeLens | null;
    area: string;
    proceeding: string;
    status: string;
}

export interface SearchResponse {
    projects: LearningsProject[];
    totalCommitted: number;
    count: number;
    truncated: boolean;
    limit: number;
}

interface State {
    data: SearchResponse | null;
    loading: boolean;
    error: string | null;
}

const EMPTY_RESPONSE: SearchResponse = {
    projects: [],
    totalCommitted: 0,
    count: 0,
    truncated: false,
    limit: 0,
};

function hasIntent(p: Omit<SearchParams, 'lens'>): boolean {
    return Boolean(p.q.trim() || p.area || p.proceeding || p.status);
}

function buildUrl(p: SearchParams): string {
    const searchParams = new URLSearchParams();

    if (p.q.trim()) searchParams.set('q', p.q.trim());
    if (p.lens) searchParams.set('lens', p.lens);
    if (p.area) searchParams.set('area', p.area);
    if (p.proceeding) searchParams.set('proceeding', p.proceeding);
    if (p.status) searchParams.set('status', p.status);

    return `/api/learnings/search?${searchParams.toString()}`;
}

export function useLearningsSearch(params: SearchParams) {
    const { q, lens, area, proceeding, status } = params;

    const hasSearchIntent = useMemo(
        () => hasIntent({ q, area, proceeding, status }),
        [q, area, proceeding, status]
    );

    const requestUrl = useMemo(
        () => buildUrl({ q, lens, area, proceeding, status }),
        [q, lens, area, proceeding, status]
    );

    const [state, setState] = useState<State>({
        data: null,
        loading: false,
        error: null,
    });

    useEffect(() => {
        if (!hasSearchIntent) {
            return;
        }

        const controller = new AbortController();
        let cancelled = false;

        const timer = window.setTimeout(() => {
            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));

            fetch(requestUrl, { signal: controller.signal })
                .then(async (res) => {
                    if (!res.ok) throw new Error(`Search failed (${res.status})`);
                    return res.json();
                })
                .then((json: SearchResponse) => {
                    if (cancelled) return;

                    setState({
                        data: json,
                        loading: false,
                        error: null,
                    });
                })
                .catch((err: unknown) => {
                    if (cancelled) return;
                    if (err instanceof DOMException && err.name === 'AbortError') return;

                    const message = err instanceof Error ? err.message : 'Unknown error';

                    setState({
                        data: null,
                        loading: false,
                        error: message,
                    });
                });
        }, DEBOUNCE_MS);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [hasSearchIntent, requestUrl]);

    return {
        ...state,
        hasSearchIntent,
        data: hasSearchIntent ? (state.data ?? EMPTY_RESPONSE) : EMPTY_RESPONSE,
        loading: hasSearchIntent ? state.loading : false,
        error: hasSearchIntent ? state.error : null,
    };
}