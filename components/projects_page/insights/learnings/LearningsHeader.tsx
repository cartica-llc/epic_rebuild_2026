// components/projects_page/insights/learnings/LearningsHeader.tsx

'use client';

interface LearningsHeaderProps {
    showReset: boolean;
    onReset: () => void;
}

export function LearningsHeader({ showReset, onReset }: LearningsHeaderProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    Has this been tried?
                </h2>
                <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-slate-500">
                    Search similar EPIC projects and preview summaries, innovations,
                    learnings, and barriers.
                </p>
            </div>

            {showReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className="self-start rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                    Reset all
                </button>
            )}
        </div>
    );
}
