"use client"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({
                               currentPage,
                               totalPages,
                               onPageChange,
                           }: PaginationProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:ring-slate-100"
            >
                Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1
                const isActive = page === currentPage

                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`min-w-[40px] rounded-xl px-3 py-2 text-sm font-medium transition ${
                            isActive
                                ? "bg-slate-900 text-white shadow-sm"
                                : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/70 hover:bg-slate-50"
                        }`}
                    >
                        {page}
                    </button>
                )
            })}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:ring-slate-100"
            >
                Next
            </button>
        </div>
    )
}

export function PaginationCompact({
                                      currentPage,
                                      totalPages,
                                      onPageChange,
                                  }: PaginationProps) {
    return (
        <div className="flex items-center justify-between">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
                Previous
            </button>

            <p className="text-sm text-slate-500">
                {currentPage} / {totalPages}
            </p>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
                Next
            </button>
        </div>
    )
}