'use client';

import { useEffect, useReducer } from 'react';
import type {
    AnalyticsContext,
    FinanceDetails,
    ProjectCore,
    ProjectDetails,
    ProjectImages,
} from '../types';

type State<T> =
    | { status: 'loading' }
    | { status: 'ready'; data: T }
    | { status: 'error'; message: string };

type Action<T> =
    | { type: 'success'; data: T }
    | { type: 'error'; message: string };

function fetchReducer<T>(_state: State<T>, action: Action<T>): State<T> {
    switch (action.type) {
        case 'success':
            return { status: 'ready', data: action.data };
        case 'error':
            return { status: 'error', message: action.message };
        default:
            return _state;
    }
}

function useProjectFetch<T>(url: string): State<T> {
    const [state, dispatch] = useReducer(
        fetchReducer<T>,
        { status: 'loading' } as State<T>
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as T;
                if (!cancelled) dispatch({ type: 'success', data });
            } catch (err) {
                if (!cancelled) {
                    dispatch({
                        type: 'error',
                        message: err instanceof Error ? err.message : 'Failed to load',
                    });
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [url]);

    return state;
}

const base = (projectId: number | string) =>
    `/api/projectDetailPageRoutes/${projectId}`;

export function useProjectCore(projectId: number | string) {
    return useProjectFetch<ProjectCore>(`${base(projectId)}/core`);
}

export function useProjectDetails(projectId: number | string) {
    return useProjectFetch<ProjectDetails>(`${base(projectId)}/details`);
}

export function useFinanceDetails(projectId: number | string) {
    return useProjectFetch<FinanceDetails>(`${base(projectId)}/finance`);
}

export function useAnalyticsContext(projectId: number | string) {
    return useProjectFetch<AnalyticsContext>(`${base(projectId)}/analytics`);
}

export function useProjectImages(projectId: number | string) {
    return useProjectFetch<ProjectImages>(`${base(projectId)}/images`);
}

export type { State as FetchState };
