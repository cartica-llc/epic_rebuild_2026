// ─── components/project_forms/useProjectNumberCheck.ts ───────────────
// Debounced hook that checks whether a full project number (PREFIX-NUMBER)
// already exists in the PROJECT table. Only surfaces errors — stays
// silent when the number is available.

import { useEffect, useRef, useState } from 'react';

export type ProjectNumberStatus = 'idle' | 'checking' | 'ok' | 'taken' | 'error';

export function useProjectNumberCheck(
    /** The prefix portion, e.g. "CEC" */
    prefix: string,
    /** The user-entered number portion (without prefix) */
    numberPart: string,
    /** In edit mode, the current project's ID so we don't flag ourselves */
    excludeProjectId?: string | number,
): { status: ProjectNumberStatus } {
    const [status, setStatus] = useState<ProjectNumberStatus>('idle');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (abortRef.current) abortRef.current.abort();

        const trimmed = numberPart.trim();

        if (!prefix || !trimmed) {
            setStatus('idle');
            return;
        }

        const fullNumber = `${prefix}-${trimmed}`.toUpperCase();

        setStatus('checking');

        // Debounce 500ms
        timerRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const params = new URLSearchParams({ projectNumber: fullNumber });
                if (excludeProjectId !== undefined && excludeProjectId !== '') {
                    params.set('excludeId', String(excludeProjectId));
                }

                const res = await fetch(`/api/checkProjectNumber?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (!res.ok) { setStatus('error'); return; }

                const data = await res.json();
                setStatus(data.exists ? 'taken' : 'ok');
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setStatus('error');
            }
        }, 500);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [prefix, numberPart, excludeProjectId]);

    return { status };
}