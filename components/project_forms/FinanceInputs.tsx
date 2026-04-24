// ─── components/project_forms/FinanceInputs.tsx ──────────────────────
// Specialized numeric inputs for the Finance tab.
//
// CurrencyInput  — $ prefix, comma-formatted on blur, over-max red state
// RatioInput     — decimal 0–1 stored in DB, % equivalent shown live
// IntegerInput   — whole numbers, # prefix badge

'use client';

import { useEffect, useState } from 'react';
import { FINANCE_MAX } from './types';

// ─── CurrencyInput ───────────────────────────────────────────────────

export function CurrencyInput({ value, onChange, placeholder = '0.00' }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const [display, setDisplay] = useState('');
    const [focused, setFocused] = useState(false);

    const formatForDisplay = (raw: string): string => {
        const n = parseFloat(raw);
        if (!Number.isFinite(n)) return '';
        return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
    };

    useEffect(() => {
        if (!focused) setDisplay(formatForDisplay(value));
    }, [value, focused]);

    useEffect(() => {
        setDisplay(formatForDisplay(value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rawNum = parseFloat(value);
    const isOverMax = value.trim() !== '' && Number.isFinite(rawNum) && Math.abs(rawNum) > FINANCE_MAX;

    const handleFocus = () => {
        setFocused(true);
        setDisplay(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const stripped = e.target.value.replace(/[^0-9.\-]/g, '');
        setDisplay(stripped);
        onChange(stripped);
    };

    const handleBlur = () => {
        setFocused(false);
        const n = parseFloat(value);
        if (Number.isFinite(n)) {
            setDisplay(n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }));
        } else {
            setDisplay('');
            onChange('');
        }
    };

    return (
        <div>
            <div className={`flex rounded-lg overflow-hidden border transition-all
                ${isOverMax
                ? 'border-red-300 ring-2 ring-red-100'
                : focused
                    ? 'border-slate-400 ring-2 ring-slate-200'
                    : 'border-slate-200 hover:border-slate-300'}`}>
                <span className={`inline-flex items-center justify-center w-9 border-r text-sm font-semibold shrink-0 transition-colors
                    ${isOverMax ? 'bg-red-50 border-red-200 text-red-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    $
                </span>
                <input
                    type="text"
                    inputMode="decimal"
                    className={`flex-1 h-10 px-3 text-sm bg-white outline-none tabular-nums
                        ${isOverMax ? 'text-red-700' : 'text-slate-900'}`}
                    placeholder={placeholder}
                    value={display}
                    onFocus={handleFocus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                {focused && value && Number.isFinite(parseFloat(value)) && (
                    <span className="hidden sm:inline-flex items-center px-2.5 border-l border-slate-100 bg-slate-50 text-[10px] text-slate-400 tabular-nums shrink-0 max-w-[120px] truncate">
                        {parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                    </span>
                )}
            </div>
            {isOverMax ? (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 5v3M8 10.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Exceeds max of $999,999,999,999
                </p>
            ) : (
                <p className="mt-0.5 text-[10px] text-slate-400">e.g. 1,500,000.00 · max $999,999,999,999</p>
            )}
        </div>
    );
}

// ─── RatioInput ──────────────────────────────────────────────────────

export function RatioInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [focused, setFocused] = useState(false);
    const n = parseFloat(value);
    const isValid = value === '' || (Number.isFinite(n) && n >= 0 && n <= 1);
    const pct = Number.isFinite(n) ? (n * 100).toFixed(2) : null;

    return (
        <div>
            <div className={`flex rounded-lg overflow-hidden border transition-all
                ${!isValid
                ? 'border-red-300 ring-2 ring-red-100'
                : focused
                    ? 'border-slate-400 ring-2 ring-slate-200'
                    : 'border-slate-200 hover:border-slate-300'}`}>
                <input
                    type="text"
                    inputMode="decimal"
                    className={`flex-1 h-10 px-3 text-sm bg-white outline-none tabular-nums
                        ${!isValid ? 'text-red-700' : 'text-slate-900'}`}
                    placeholder="e.g. 0.3333"
                    value={value}
                    onFocus={() => setFocused(true)}
                    onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
                    onBlur={() => setFocused(false)}
                />
                <span className={`inline-flex items-center px-3 border-l text-sm font-medium shrink-0 min-w-[72px] justify-center transition-colors tabular-nums
                    ${pct !== null && isValid
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                    {pct !== null && isValid ? `${pct}%` : '–%'}
                </span>
            </div>
            {!isValid ? (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 5v3M8 10.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Must be between 0 and 1
                </p>
            ) : (
                <p className="mt-0.5 text-[10px] text-slate-400">Decimal 0–1 · e.g. 0.3333 = 33.33%</p>
            )}
        </div>
    );
}

export function IntegerInput({ value, onChange, placeholder = '0', hint }: {
    value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
    const [focused, setFocused] = useState(false);
    const n = parseInt(value, 10);
    const isInvalid = value !== '' && (!Number.isFinite(n) || n < 0 || String(n) !== value.trim());

    return (
        <div>
            <div className={`flex rounded-lg overflow-hidden border transition-all
                ${isInvalid
                ? 'border-red-300 ring-2 ring-red-100'
                : focused
                    ? 'border-slate-400 ring-2 ring-slate-200'
                    : 'border-slate-200 hover:border-slate-300'}`}>
                <span className={`inline-flex items-center justify-center w-9 border-r text-sm font-semibold shrink-0 transition-colors
                    ${isInvalid ? 'bg-red-50 border-red-200 text-red-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    #
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    className={`flex-1 h-10 px-3 text-sm bg-white outline-none tabular-nums
                        ${isInvalid ? 'text-red-700' : 'text-slate-900'}`}
                    placeholder={placeholder}
                    value={value}
                    onFocus={() => setFocused(true)}
                    onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
                    onBlur={() => setFocused(false)}
                />
            </div>
            {isInvalid ? (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 5v3M8 10.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Whole numbers only
                </p>
            ) : (
                <p className="mt-0.5 text-[10px] text-slate-400">{hint ?? 'Whole number'}</p>
            )}
        </div>
    );
}
