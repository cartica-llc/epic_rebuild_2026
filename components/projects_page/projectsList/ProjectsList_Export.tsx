// ─── components/projects_page/projectsList/ProjectsList_Export.tsx ─────
// Export modal — "Filtered Results" (single sheet) or "Entire Database" (4 sheets)

'use client';

import { useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ProjectExportProps {
    /** Returns current search + filter state as URLSearchParams */
    buildFilterParams: () => URLSearchParams;
}

export function ProjectExport({ buildFilterParams }: ProjectExportProps) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState<'filtered' | 'all' | null>(null);

    const handleFilteredExport = () => {
        setLoading('filtered');
        const params = buildFilterParams();
        params.delete('page');
        params.delete('limit');
        window.open(`/api/projectsList/export?${params}`, '_blank');
        setTimeout(() => { setLoading(null); setShowModal(false); }, 1500);
    };

    const handleFullExport = () => {
        setLoading('all');
        window.open('/api/projectsList/exportAll', '_blank');
        setTimeout(() => { setLoading(null); setShowModal(false); }, 1500);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
            >
                <Download className="h-4 w-4" />
            </button>

            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => !loading && setShowModal(false)}
                            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
                        />

                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={() => !loading && setShowModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
                            >
                                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                                    <h3 className="text-lg font-bold text-slate-900">Export Data</h3>
                                    <button
                                        type="button"
                                        onClick={() => !loading && setShowModal(false)}
                                        className="text-slate-600 transition-colors hover:text-slate-900"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <p className="mb-6 text-slate-600">Choose what you'd like to export:</p>

                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={handleFilteredExport}
                                            disabled={loading !== null}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-4 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-60"
                                        >
                                            {loading === 'filtered' ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Download className="h-5 w-5" />
                                            )}
                                            Filtered Results
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleFullExport}
                                            disabled={loading !== null}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-4 font-semibold text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-60"
                                        >
                                            {loading === 'all' ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Download className="h-5 w-5" />
                                            )}
                                            Entire Database
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}