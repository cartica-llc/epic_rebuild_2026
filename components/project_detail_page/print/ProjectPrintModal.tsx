// components/project_detail_page/print/ProjectPrintModal.tsx

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Loader2, Printer, X } from 'lucide-react';
import type { ProjectCore } from '../types';
import { PrintDocument } from './PrintDocument';

const EMPTY_DOCUMENT = '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body></body></html>';

type Props = {
    project: ProjectCore;
    onClose: () => void;
};

export function ProjectPrintModal({ project, onClose }: Props) {
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);
    const [ready, setReady] = useState(false);

    const fileName = [project.projectNumber?.toUpperCase(), project.projectName]
        .filter(Boolean)
        .join(' - ')
        .slice(0, 100)
        .trim();

    const handleFrameLoad = () => {
        const doc = frameRef.current?.contentDocument;
        if (!doc) return;
        doc.title = fileName;
        setFrameBody(doc.body);
    };

    const handleReady = useCallback(() => setReady(true), []);

    const handlePrint = useCallback(() => {
        const frameWindow = frameRef.current?.contentWindow;
        if (!frameWindow) return;
        frameWindow.focus();
        frameWindow.print();
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                if (ready) handlePrint();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, ready, handlePrint]);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousTitle = document.title;
        document.body.style.overflow = 'hidden';
        document.title = fileName;
        return () => {
            document.body.style.overflow = previousOverflow;
            document.title = previousTitle;
        };
    }, [fileName]);

    return createPortal(
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm print:hidden sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Print preview"
                className="flex h-full max-h-[920px] w-full max-w-[872px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
                    <p className="text-sm font-semibold text-slate-900">Print preview</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={!ready}
                            onClick={handlePrint}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-default disabled:opacity-60"
                        >
                            {ready ? (
                                <Printer className="h-4 w-4" />
                            ) : (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {ready ? 'Print / Save as PDF' : 'Preparing…'}
                        </button>
                        <button
                            type="button"
                            autoFocus
                            onClick={onClose}
                            aria-label="Close print preview"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <iframe
                    ref={frameRef}
                    title="Project print preview"
                    srcDoc={EMPTY_DOCUMENT}
                    onLoad={handleFrameLoad}
                    className="min-h-0 w-full flex-1 border-0 bg-slate-200"
                />

                {frameBody &&
                    createPortal(<PrintDocument project={project} onReady={handleReady} />, frameBody)}
            </motion.div>
        </motion.div>,
        document.body
    );
}