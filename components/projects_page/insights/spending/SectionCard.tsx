// components/projects_page/insights/spending/shared/SectionCard.tsx

'use client';

import { ReactNode } from 'react';

interface SectionCardProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}

export function SectionCard({ title, description, action, children }: SectionCardProps) {
    return (
        <section className="rounded-md border border-slate-200 bg-white p-4 md:p-5">
            <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
                    {description && (
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                    )}
                </div>
                {action && (
                    <div className="flex-shrink-0 sm:pt-0.5">{action}</div>
                )}
            </header>
            {children}
        </section>
    );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
    return (
        <div
            className="flex animate-pulse items-end gap-2 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4"
            style={{ height }}
            aria-hidden="true"
        >
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm bg-slate-200"
                    style={{ height: `${30 + ((i * 13) % 60)}%` }}
                />
            ))}
        </div>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 py-12">
            <p className="text-xs text-slate-500">{message}</p>
        </div>
    );
}

export function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center rounded-md border border-dashed border-red-200 bg-red-50 py-12">
            <p className="text-xs text-red-600">Failed to load: {message}</p>
        </div>
    );
}