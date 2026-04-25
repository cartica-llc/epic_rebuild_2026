'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanEdit } from '../shared/useCanEdit';

type Props = {
    projectId: number | string;
    programAdminId: number | null | undefined;
};

export function HeroNav({ projectId, programAdminId }: Props) {
    const router = useRouter();
    const canEdit = useCanEdit(programAdminId);

    return (
        <div className="relative mx-auto flex max-w-5xl items-center justify-between px-6 pt-20 pb-0 sm:px-8">
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
                    onClick={() => window.print()}
                    className="rounded-xl text-white/50 hover:bg-white/10 hover:text-white sm:inline-flex"
                >
                    <Printer className="mr-1.5 h-4 w-4" />
                    Print
                </Button>
                {canEdit && (
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/projects/${projectId}/edit`)}
                        className="rounded-xl text-white/50 hover:bg-white/10 hover:text-white"
                    >
                        <Edit3 className="mr-1.5 h-4 w-4" />
                        Edit
                    </Button>
                )}
            </div>
        </div>
    );
}