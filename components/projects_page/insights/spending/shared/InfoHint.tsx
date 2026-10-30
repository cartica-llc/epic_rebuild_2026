// components/projects_page/insights/spending/shared/InfoHint.tsx

'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TOOLTIP_WIDTH = 256;
const EDGE_GAP = 8;

interface InfoHintProps {
    text: string;
}


export function InfoHint({ text }: InfoHintProps) {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
    const tooltipId = useId();

    const place = useCallback(() => {
        const el = buttonRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const width = Math.min(TOOLTIP_WIDTH, window.innerWidth - EDGE_GAP * 2);
        const centered = rect.left + rect.width / 2 - width / 2;
        const left = Math.max(EDGE_GAP, Math.min(centered, window.innerWidth - width - EDGE_GAP));
        setPos({ top: rect.bottom + 6, left, width });
    }, []);

    const show = useCallback(() => {
        place();
        setOpen(true);
    }, [place]);

    const hide = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') hide();
        };
        window.addEventListener('scroll', hide, true);
        window.addEventListener('resize', hide);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('scroll', hide, true);
            window.removeEventListener('resize', hide);
            window.removeEventListener('keydown', onKey);
        };
    }, [open, hide]);

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                aria-label="More info"
                aria-describedby={open ? tooltipId : undefined}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                onClick={() => (open ? hide() : show())}
                className="inline-flex h-3.5 w-3.5 flex-shrink-0 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] normal-case not-italic text-slate-400 outline-none transition hover:border-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-slate-300"
            >
                i
            </button>


            {open &&
                pos &&
                typeof document !== 'undefined' &&
                createPortal(
                    <span
                        id={tooltipId}
                        role="tooltip"
                        className="pointer-events-none fixed z-[1000] whitespace-normal break-words rounded-md bg-slate-900 px-3 py-2 text-left text-xs font-normal normal-case leading-snug tracking-normal text-slate-50 shadow-lg"
                        style={{ top: pos.top, left: pos.left, width: pos.width }}
                    >
                        {text}
                    </span>,
                    document.body,
                )}
        </>
    );
}