'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectPrintModal } from '../print/ProjectPrintModal';
import { useCanEdit } from '../shared/useCanEdit';
import type { ProjectCore } from '../types';

type Props = {
    project: ProjectCore;
};

export function HeroNav({ project }: Props) {
    const router = useRouter();
    const canEdit = useCanEdit(project.programAdminId);
    const [printOpen, setPrintOpen] = useState(false);

    return (
        <div className="pt-6 relative mx-auto flex max-w-5xl items-center justify-between px-6  pb-0 sm:px-8">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="rounded-xl px-3 text-white/60 hover:bg-white/10 hover:text-white"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
            </Button>
            <div className="flex items-center gap-2 print:hidden">
                <Button
                    variant="ghost"
                    onClick={() => setPrintOpen(true)}
                    className="rounded-xl text-white/50 hover:bg-white/10 hover:text-white sm:inline-flex"
                >
                    <Printer className="mr-1.5 h-4 w-4" />
                    Print
                </Button>
                {canEdit && (
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/projects/${project.id}/edit`)}
                        className="rounded-xl text-white/50 hover:bg-white/10 hover:text-white"
                    >
                        <Edit3 className="mr-1.5 h-4 w-4" />
                        Edit
                    </Button>
                )}
            </div>
            {printOpen && (
                <ProjectPrintModal project={project} onClose={() => setPrintOpen(false)} />
            )}
        </div>
    );
}