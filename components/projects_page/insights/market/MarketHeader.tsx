// components/projects_page/insights/market/MarketHeader.tsx

'use client';

interface MarketHeaderProps {
    showReset: boolean;
    onReset: () => void;
}

export function MarketHeader({ showReset, onReset }: MarketHeaderProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    Market Maturity Analysis
                </h2>
                <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-slate-500">
                    See where projects sit in the development funnel and which ones show
                    the strongest signs of being close to market.{' '}
                    <span className="font-medium text-amber-700">
                        Maturity and signal score are proxy indicators
                    </span>{' '}
                    derived from project evidence, not authoritative fields.
                </p>
            </div>

            {showReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className="self-start rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                    Reset filters
                </button>
            )}
        </div>
    );
}
