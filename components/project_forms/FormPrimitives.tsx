// ─── components/project_forms/FormPrimitives.tsx ─────────────────────
// Low-level reusable form building blocks.

'use client';

import { inputClass, selectClass, textareaClass } from './types';

// ─── Field wrapper ───────────────────────────────────────────────────

export function Field({ label, tooltip, children, full, required }: {
    label: string; tooltip?: string; children: React.ReactNode; full?: boolean; required?: boolean;
}) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <label className="block text-[13px] font-medium text-slate-500 mb-1.5 tracking-wide">
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
                {tooltip && (
                    <span className="group relative ml-1 inline-flex">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-slate-400 cursor-help inline -mt-px">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 7v4M8 5.5v-.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                            {tooltip}
                        </span>
                    </span>
                )}
            </label>
            {children}
        </div>
    );
}

// ─── Text input ──────────────────────────────────────────────────────

export function TextInput({ placeholder, value, onChange, disabled, prefix, type = 'text', ...rest }: {
    placeholder?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean; prefix?: string; type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'disabled' | 'placeholder' | 'prefix'>) {
    if (prefix) {
        return (
            <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium">
                    {prefix}
                </span>
                <input type={type} className={inputClass + ' rounded-l-none'} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} {...rest} />
            </div>
        );
    }
    return <input type={type} className={inputClass} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} {...rest} />;
}

// ─── Select ──────────────────────────────────────────────────────────

export function Select({ value, onChange, options, placeholder }: {
    value: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string | number; label: string }[]; placeholder?: string;
}) {
    return (
        <select className={selectClass} value={value} onChange={onChange}>
            <option value="">{placeholder || 'Select...'}</option>
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

// ─── Textarea ────────────────────────────────────────────────────────

export function Textarea({ value, onChange, placeholder, rows = 5 }: {
    value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string; rows?: number;
}) {
    return <textarea className={textareaClass} rows={rows} placeholder={placeholder} value={value} onChange={onChange} />;
}

// ─── Checkbox ────────────────────────────────────────────────────────

export function Checkbox({ label, checked, onChange, tooltip }: {
    label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; tooltip?: string;
}) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer group py-1">
            <div className="relative flex items-center">
                <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
                <div className="w-[18px] h-[18px] rounded border border-slate-300 bg-white peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-all flex items-center justify-center">
                    {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </div>
            <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
            {tooltip && (
                <span className="group/tip relative">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-slate-400 cursor-help">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 7v4M8 5.5v-.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-xl leading-relaxed">
                        {tooltip}
                    </span>
                </span>
            )}
        </label>
    );
}

// ─── Section divider ─────────────────────────────────────────────────

export function SectionDivider({ title }: { title: string }) {
    return (
        <div className="col-span-2 mt-4 mb-1">
            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">{title}</span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>
        </div>
    );
}
