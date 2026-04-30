// components/dashboard/compliance/ComplianceDashboardClient.tsx

'use client';

import React from 'react';

import { ComplianceDashboard } from './ComplianceDashboard';
import { ComplianceDashboardSkeleton } from './Compliancedashboardskeleton';
import type { ComplianceApiResponse } from './types';

const API_PATH = '/api/compliance';

type LoadState =
    | { kind: 'loading' }
    | { kind: 'ready'; data: ComplianceApiResponse }
    | { kind: 'error'; message: string };

export function ComplianceDashboardClient() {
    const [state, setState] = React.useState<LoadState>({ kind: 'loading' });

    React.useEffect(() => {

        const controller = new AbortController();

        (async () => {
            try {
                const res = await fetch(API_PATH, {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!res.ok) {

                    const message =
                        res.status === 401
                            ? 'You are not signed in. Please refresh.'
                            : res.status === 403
                                ? 'You do not have permission to view this page.'
                                : `Failed to load compliance data (${res.status}).`;
                    setState({ kind: 'error', message });
                    return;
                }

                const data = (await res.json()) as ComplianceApiResponse;
                setState({ kind: 'ready', data });
            } catch (err) {
                if ((err as { name?: string }).name === 'AbortError') return;
                console.error('Compliance fetch failed:', err);
                setState({
                    kind: 'error',
                    message: 'Could not reach the server. Please try again.',
                });
            }
        })();

        return () => controller.abort();
    }, []);

    if (state.kind === 'loading') {
        return <ComplianceDashboardSkeleton />;
    }

    if (state.kind === 'error') {

        return (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1 text-xs text-rose-700">{state.message}</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 inline-flex items-center rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                    Reload page
                </button>
            </div>
        );
    }

    return <ComplianceDashboard projects={state.data.projects} />;
}