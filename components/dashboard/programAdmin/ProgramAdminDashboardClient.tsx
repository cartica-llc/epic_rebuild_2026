// components/dashboard/programAdmin/ProgramAdminDashboardClient.tsx

'use client';

import React from 'react';

import { ProgramAdminDashboard } from './ProgramAdminDashboard';
import { ProgramAdminDashboardSkeleton } from './ProgramAdminDashboardSkeleton';
import type { DashboardData } from './types';

const API_PATH = '/api/program-dashboard';

type LoadState =
    | { kind: 'loading' }
    | { kind: 'ready'; data: DashboardData }
    | { kind: 'error'; message: string };

export interface ProgramAdminDashboardClientProps {
    userName: string;
    userEmail: string;
    userOrg: string | null;
    isMasterAdmin: boolean;
    programAdminId: number | null;
}

export function ProgramAdminDashboardClient({
                                                userName,
                                                userEmail,
                                                userOrg,
                                                isMasterAdmin,
                                                programAdminId,
                                            }: ProgramAdminDashboardClientProps) {
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
                                : `Failed to load dashboard data (${res.status}).`;
                    setState({ kind: 'error', message });
                    return;
                }

                const data = (await res.json()) as DashboardData;
                setState({ kind: 'ready', data });
            } catch (err) {
                if ((err as { name?: string }).name === 'AbortError') return;
                console.error('Program dashboard fetch failed:', err);
                setState({
                    kind: 'error',
                    message: 'Could not reach the server. Please try again.',
                });
            }
        })();

        return () => controller.abort();
    }, []);

    if (state.kind === 'loading') {
        return (
            <ProgramAdminDashboardSkeleton
                userName={userName}
                userEmail={userEmail}
                userOrg={userOrg}
                isMasterAdmin={isMasterAdmin}
                programAdminId={programAdminId}
            />
        );
    }

    if (state.kind === 'error') {
        return (
            <main className="mx-auto mt-6 max-w-[1400px] px-4  sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between gap-4 ">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{userName}</h1>
                        <p className="mt-0.5 text-sm text-slate-500">{userEmail}</p>
                        {userOrg && (
                            <p className="mt-0.5 text-xs text-slate-400">
                                {isMasterAdmin ? 'Master Admin — all organizations' : userOrg}
                            </p>
                        )}
                    </div>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
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
            </main>
        );
    }

    return (
        <ProgramAdminDashboard
            userName={userName}
            userEmail={userEmail}
            userOrg={userOrg}
            isMasterAdmin={isMasterAdmin}
            programAdminId={programAdminId}
            data={state.data}
        />
    );
}