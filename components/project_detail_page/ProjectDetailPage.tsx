'use client';

import { Loader2 } from 'lucide-react';
import { HeroSection } from './hero/HeroSection';
import { useProjectCore } from './shared/useProjectData';
import { TabShell } from './TabShell';

type Props = {
    projectId: string;
};

export function ProjectDetailPage({ projectId }: Props) {
    const state = useProjectCore(projectId);

    if (state.status === 'loading') {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    <p className="text-sm text-slate-500">Loading project…</p>
                </div>
            </div>
        );
    }

    if (state.status === 'error') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Error
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Project not found
                </h1>
                <p className="mt-2 max-w-md text-center text-sm text-slate-500">
                    {state.message}
                </p>
            </div>
        );
    }

    const project = state.data;

    return (
        <div className="bg-slate-50 pb-20">
            <HeroSection project={project} />
            <TabShell project={project} />
        </div>
    );
}
