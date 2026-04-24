// components/dashboard/program_admin/DashboardQuickActions.tsx

'use client';

import Link from 'next/link';
import { LayoutGrid, PlusCircle, BarChart2, EyeOff } from 'lucide-react';

interface QuickActionProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
}

function QuickAction({ href, icon, label, description }: QuickActionProps) {
    return (
        <Link
            href={href}
            className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-200/70 transition hover:bg-slate-100 hover:ring-slate-300"
        >
            <span className="mt-0.5 shrink-0 text-slate-500">{icon}</span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            </div>
        </Link>
    );
}

interface Props {
    programAdminId: number | null;
}

export function DashboardQuickActions({ programAdminId }: Props) {
    // Build scoped query param — MasterAdmin (null) sees all, ProgramAdmin scoped to their org
    const scopeParam = programAdminId !== null ? `?programAdminId=${programAdminId}` : '';
    const inactiveScopeParam = programAdminId !== null
        ? `?programAdminId=${programAdminId}&inactiveFilter=inactive_only`
        : '?inactiveFilter=inactive_only';

    const actions: QuickActionProps[] = [
        {
            href: `/projects${scopeParam}`,
            icon: <LayoutGrid className="h-4 w-4" />,
            label: 'All Projects',
            description: 'Browse and search your published projects',
        },
        {
            href: `/projects/create`,
            icon: <PlusCircle className="h-4 w-4" />,
            label: 'Create Project',
            description: 'Add a new project to the portfolio',
        },
        // {
        //     href: `/projects${scopeParam ? scopeParam + '&view=spending' : '?view=spending'}`,
        //     icon: <BarChart2 className="h-4 w-4" />,
        //     label: 'Spending Analytics',
        //     description: 'View funding and expenditure breakdowns',
        // },
        {
            href: `/projects${inactiveScopeParam}`,
            icon: <EyeOff className="h-4 w-4" />,
            label: 'Unpublished Projects',
            description: 'Review projects hidden from the public site',
        },
    ];

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
                <p className="mt-0.5 text-sm text-slate-500">Shortcuts to common tasks.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {actions.map((action) => (
                    <QuickAction key={action.href} {...action} />
                ))}
            </div>
        </div>
    );
}
