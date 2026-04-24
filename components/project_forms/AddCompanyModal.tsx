// ─── components/project_forms/AddCompanyModal.tsx ─────────────────────
// Modal dialog for creating a new lead company.


'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';

interface AddCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (company: { id: number; name: string }) => void;
}

const inputClass =
    'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200';

interface CompanyForm {
    name: string;
    shortName: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    longitude: string;
    latitude: string;
}

const EMPTY: CompanyForm = {
    name: '', shortName: '', email: '',
    address1: '', address2: '', city: '', state: '', zip: '',
    longitude: '', latitude: '',
};

function validate(f: CompanyForm): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = 'Company name is required';
    if (!f.shortName.trim()) errs.shortName = 'Short name is required';
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = 'Invalid email';
    if (!f.address1.trim()) errs.address1 = 'Address 1 is required';
    if (!f.city.trim()) errs.city = 'City is required';
    if (!f.state.trim()) errs.state = 'State is required';
    if (f.state.length > 2) errs.state = 'Max 2 characters';
    if (!f.zip.trim()) errs.zip = 'ZIP is required';
    if (f.zip && !/^\d{5}(-\d{4})?$/.test(f.zip)) errs.zip = 'Use 5 digits or 5+4';
    if (!f.longitude.trim()) errs.longitude = 'Longitude is required';
    if (f.longitude && !/^[-+]?\d+(\.\d{1,6})?$/.test(f.longitude)) errs.longitude = 'Invalid format';
    if (f.longitude && !errs.longitude) {
        const n = parseFloat(f.longitude);
        if (n < -180 || n > 180) errs.longitude = 'Must be -180 to 180';
    }
    if (!f.latitude.trim()) errs.latitude = 'Latitude is required';
    if (f.latitude && !/^[-+]?\d+(\.\d{1,6})?$/.test(f.latitude)) errs.latitude = 'Invalid format';
    if (f.latitude && !errs.latitude) {
        const n = parseFloat(f.latitude);
        if (n < -90 || n > 90) errs.latitude = 'Must be -90 to 90';
    }
    if (!errs.longitude && !errs.latitude && f.longitude && f.latitude) {
        if (parseFloat(f.longitude) === 0 && parseFloat(f.latitude) === 0) {
            errs.longitude = 'Coordinates (0, 0) not allowed';
            errs.latitude = 'Coordinates (0, 0) not allowed';
        }
    }
    return errs;
}

function FieldLabel({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[13px] font-medium text-slate-500 mb-1">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function AddCompanyModal({ isOpen, onClose, onCreated }: AddCompanyModalProps) {
    const [form, setForm] = useState<CompanyForm>({ ...EMPTY });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({ ...EMPTY });
            setErrors({});
            setSaving(false);
            setServerError('');
            setSuccess(false);
            setTouched(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const set = (key: keyof CompanyForm, val: string) => {
        setForm((prev) => ({ ...prev, [key]: val }));
        if (touched) {
            const next = { ...form, [key]: val };
            setErrors(validate(next));
        }
    };

    const handleSave = async () => {
        setTouched(true);
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSaving(true);
        setServerError('');

        try {
            const res = await fetch('/api/companyCreate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    shortName: form.shortName.trim(),
                    email: form.email.trim(),
                    address: {
                        address1: form.address1.trim(),
                        address2: form.address2.trim(),
                        city: form.city.trim(),
                        state: form.state.trim().toUpperCase(),
                        zip: form.zip.trim(),
                        longitude: form.longitude,
                        latitude: form.latitude,
                    },
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setServerError(data.error ?? 'Failed to create company');
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                onCreated(data.company);
                onClose();
            }, 800);
        } catch {
            setServerError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const hasErrors = Object.keys(errors).length > 0;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Dialog */}
            <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-slate-900">Add New Lead Company</h2>
                    <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Company fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldLabel label="Company name *" error={errors.name}>
                            <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Acme Energy Inc." />
                        </FieldLabel>
                        <FieldLabel label="Short name *" error={errors.shortName}>
                            <input className={inputClass} value={form.shortName} onChange={(e) => set('shortName', e.target.value)} placeholder="ACME" />
                        </FieldLabel>
                    </div>
                    <FieldLabel label="Email" error={errors.email}>
                        <input className={inputClass} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@company.com" />
                    </FieldLabel>

                    {/* Divider */}
                    <div className="flex items-center gap-3 pt-2">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Address</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <FieldLabel label="Address 1 *" error={errors.address1}>
                        <input className={inputClass} value={form.address1} onChange={(e) => set('address1', e.target.value)} placeholder="123 Main St" />
                    </FieldLabel>
                    <FieldLabel label="Address 2">
                        <input className={inputClass} value={form.address2} onChange={(e) => set('address2', e.target.value)} placeholder="Suite 100" />
                    </FieldLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <FieldLabel label="City *" error={errors.city}>
                            <input className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Sacramento" />
                        </FieldLabel>
                        <FieldLabel label="State *" error={errors.state}>
                            <input className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)} maxLength={2} placeholder="CA" />
                        </FieldLabel>
                        <FieldLabel label="ZIP *" error={errors.zip}>
                            <input className={inputClass} value={form.zip} onChange={(e) => set('zip', e.target.value)} placeholder="95814" />
                        </FieldLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FieldLabel label="Longitude *" error={errors.longitude}>
                            <input className={inputClass} value={form.longitude} onChange={(e) => set('longitude', e.target.value)} placeholder="-121.4944" />
                            <p className="mt-0.5 text-[10px] text-slate-400">Range: -180 to 180</p>
                        </FieldLabel>
                        <FieldLabel label="Latitude *" error={errors.latitude}>
                            <input className={inputClass} value={form.latitude} onChange={(e) => set('latitude', e.target.value)} placeholder="38.5816" />
                            <p className="mt-0.5 text-[10px] text-slate-400">Range: -90 to 90</p>
                        </FieldLabel>
                    </div>

                    {/* Status banners */}
                    {serverError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{serverError}</div>
                    )}
                    {success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">Company created.</div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 rounded-b-2xl">
                    <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving || (touched && hasErrors)}
                            className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}