// components/projects_page/insights/spending/SpendingHeader.tsx

'use client';

export function SpendingHeader() {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="hidden">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    Spending &amp; Investment Analysis
                </h2>
                <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-slate-500">
                    Filters persist across every analysis tab. Adjust metric, period, or
                    area to refine the view.
                </p>
            </div>
        </div>
    );
}