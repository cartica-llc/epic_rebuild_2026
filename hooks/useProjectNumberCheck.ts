// hooks/useProjectNumberCheck.ts
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type ProjectNumberStatus = 'idle' | 'checking' | 'ok' | 'taken' | 'error';

export function useProjectNumberCheck(
    prefix: string,
    numberPart: string,
    excludeProjectId?: string | number,
): { status: ProjectNumberStatus } {
    const [checkStatus, setCheckStatus] = useState<ProjectNumberStatus>('idle');

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const trimmed = numberPart.trim();
    const shouldCheck = Boolean(prefix && trimmed);

    const fullNumber = useMemo(() => {
        if (!shouldCheck) return '';
        return `${prefix}-${trimmed}`.toUpperCase();
    }, [prefix, trimmed, shouldCheck]);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (abortRef.current) abortRef.current.abort();

        if (!shouldCheck) return;

        timerRef.current = setTimeout(async () => {
            setCheckStatus('checking');

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

                if (!res.ok) {
                    setCheckStatus('error');
                    return;
                }

                const data = (await res.json()) as { exists?: boolean };

                setCheckStatus(data.exists ? 'taken' : 'ok');
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setCheckStatus('error');
            }
        }, 500);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [shouldCheck, fullNumber, excludeProjectId]);

    return {
        status: shouldCheck ? checkStatus : 'idle',
    };
}