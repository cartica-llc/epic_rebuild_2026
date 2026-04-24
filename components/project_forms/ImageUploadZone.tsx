// ─── components/project_forms/ImageUploadZone.tsx ────────────────────

'use client';

import { useRef } from 'react';
import Image from 'next/image';

export function ImageUploadZone({ label, images, onAdd, onRemove, max = 1, disabled }: {
    label: string; images: { name: string; url: string }[];
    onAdd: (img: { name: string; url: string }) => void; onRemove: (i: number) => void;
    max?: number; disabled?: boolean;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((f) => {
            const reader = new FileReader();
            reader.onload = () => onAdd({ name: f.name, url: reader.result as string });
            reader.readAsDataURL(f);
        });
        e.target.value = '';
    };
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-slate-600">{label}</span>
                {max > 1 && <span className="text-xs text-slate-400">{images.length}/{max}</span>}
            </div>
            <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                    <div key={i} className="relative group">
                        <div className="w-28 h-20 rounded-lg overflow-hidden bg-slate-200 relative">
                            <Image src={img.url} alt={img.name} fill className="object-cover" unoptimized />
                        </div>
                        <button type="button" onClick={() => onRemove(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none">×</button>
                        <div className="text-[10px] text-slate-400 mt-1 truncate w-28">{img.name}</div>
                    </div>
                ))}
                {images.length < max && (
                    <button type="button" disabled={disabled} onClick={() => fileRef.current?.click()}
                            className="w-28 h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-[10px] text-slate-400">{disabled ? 'Enter # first' : 'Upload PNG'}</span>
                    </button>
                )}
            </div>
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp" hidden multiple={max > 1} onChange={handleFiles} />
        </div>
    );
}
