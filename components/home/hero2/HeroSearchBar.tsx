'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

const PLACEHOLDER_TERMS = [
    'solar storage',
    'wildfire resilience',
    'EV charging',
    'heat pumps',
    'microgrids',
    'building retrofits',
];

export function HeroSearchBar() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [value, setValue] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_TERMS.length);
        }, 2800);
        return () => clearInterval(id);
    }, []);

    const handleSubmit = () => {
        const trimmed = value.trim();
        setSubmitting(true);
        const params = new URLSearchParams();
        if (trimmed) params.set('search', trimmed);
        router.push(`/projects${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <div className="w-full max-w-3xl">
            <label
                htmlFor="hero-search"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
                Search the database
            </label>

            <div className="group relative flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm transition-all focus-within:border-slate-400 focus-within:shadow-md">
                <div className="flex items-center pl-4 text-slate-400">
                    <Search className="h-5 w-5" />
                </div>

                <input
                    id="hero-search"
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmit();
                    }}
                    placeholder={`Try "${PLACEHOLDER_TERMS[placeholderIndex]}"...`}
                    className="flex-1 bg-transparent px-3 py-4 text-base text-slate-900 placeholder:text-slate-200 focus:outline-none"
                />

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 sm:px-6"
                >
                    {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <span className="hidden sm:inline">Search</span>
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
                Search by project name, technology, recipient, or location &mdash;
                or{' '}
                <button
                    type="button"
                    onClick={() => router.push('/projects')}
                    className="font-semibold text-slate-700 underline-offset-2 hover:underline"
                >
                    browse all projects
                </button>
                .
            </p>
        </div>
    );
}
