'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { LoadingOverlay, type LoadingOverlayState } from '@/components/shared/LoadingOverlay';

interface CognitoSignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type View = 'sign-in' | 'change-password' | 'forgot' | 'reset';

interface PasswordInputProps {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    show: boolean;
    onToggle: () => void;
    autoComplete?: string;
    placeholder?: string;
}

function PasswordInput({
                           id,
                           value,
                           onChange,
                           show,
                           onToggle,
                           autoComplete = 'current-password',
                           placeholder,
                       }: PasswordInputProps) {
    return (
        <div className="relative">
            <input
                id={id}
                type={show ? 'text' : 'password'}
                required
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-base text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                aria-label={show ? 'Hide password' : 'Show password'}
                tabIndex={-1}
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

export default function CognitoSignInModal({ isOpen, onClose }: CognitoSignInModalProps) {
    const [view, setView] = useState<View>('sign-in');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [challengeSession, setChallengeSession] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [overlay, setOverlay] = useState<LoadingOverlayState>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    function resetState() {
        setError('');
        setMessage('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setChallengeSession('');
        setShowPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    }

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        setOverlay({ phase: 'loading' });

        try {
            const res = await fetch('/api/auth/initiate-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setLoading(false);
                setOverlay(null);
                setError(data.error ?? 'Invalid email or password.');
                return;
            }

            if (data.challenge === 'NEW_PASSWORD_REQUIRED') {
                setChallengeSession(data.session);
                setLoading(false);
                setOverlay(null);
                setView('change-password');
                return;
            }
        } catch {
            // initiate-auth unavailable — continue with normal sign-in
        }

        const result = await signIn('cognito-credentials', {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setOverlay(null);
            setError('Invalid email or password.');
        } else {
            const session = await fetch('/api/auth/session').then(r => r.json());
            const name = session?.user?.name ?? email;
            setOverlay({ phase: 'success', detail: name });
            setTimeout(() => { window.location.href = '/dashboard'; }, 1800);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        setOverlay({ phase: 'loading' });

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    newPassword,
                    session: challengeSession,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setLoading(false);
                setOverlay(null);
                setError(data.error ?? 'Failed to set new password.');
                return;
            }

            const result = await signIn('cognito-credentials', {
                email,
                password: newPassword,
                redirect: false,
            });

            setLoading(false);

            if (result?.error) {
                setOverlay(null);
                setMessage('Password updated. Please sign in with your new password.');
                setPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setChallengeSession('');
                setView('sign-in');
            } else {
                const session = await fetch('/api/auth/session').then(r => r.json());
                const name = session?.user?.name ?? email;
                setOverlay({ phase: 'success', detail: name });
                setTimeout(() => { window.location.href = '/dashboard'; }, 1800);
            }
        } catch {
            setLoading(false);
            setOverlay(null);
            setError('Something went wrong.');
        }
    }

    async function handleForgotPassword(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
                setError(data.error ?? 'Something went wrong.');
            } else {
                setMessage('A verification code has been sent to your email.');
                setView('reset');
            }
        } catch {
            setLoading(false);
            setError('Something went wrong.');
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/confirm-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
                setError(data.error ?? 'Something went wrong.');
            } else {
                setMessage('Password reset successfully. You can now sign in.');
                setView('sign-in');
                setPassword('');
            }
        } catch {
            setLoading(false);
            setError('Something went wrong.');
        }
    }

    if (!isOpen || typeof document === 'undefined') return null;

    return (
        <>
            <LoadingOverlay
                state={overlay}
                onDismissError={() => setOverlay(null)}
                loadingText="Signing you in…"
                loadingSubtext="Verifying your credentials"
                successText="Welcome back!"
                successRedirectText="Taking you to your dashboard…"
                accentColor="blue"
            />
            {createPortal(
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <div
                        className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-[3px] w-full bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600" />

                        <div className="relative p-6 sm:p-7">
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="pr-10">
                                <div className="mb-5 flex items-center justify-center sm:justify-start">
                                    <Image
                                        src="/logo/CAgov-logo.svg"
                                        alt="California Government Logo"
                                        width={40}
                                        height={40}
                                        className="h-10 w-auto object-contain"
                                        priority
                                    />
                                </div>

                                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                                    {view === 'sign-in' && 'Sign in'}
                                    {view === 'change-password' && 'Set new password'}
                                    {view === 'forgot' && 'Forgot password'}
                                    {view === 'reset' && 'Reset password'}
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {view === 'sign-in' && 'Use your EPIC account to continue to the dashboard.'}
                                    {view === 'change-password' &&
                                        'Your temporary password has expired. Please create a new password to continue.'}
                                    {view === 'forgot' && "Enter your email and we'll send you a verification code."}
                                    {view === 'reset' && 'Enter the code from your email and your new password.'}
                                </p>
                            </div>

                            {error && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                    {message}
                                </div>
                            )}

                            {/* Sign In Form */}
                            {view === 'sign-in' && (
                                <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-1.5 block text-sm font-medium text-slate-700"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@host.com"
                                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-1.5 block text-sm font-medium text-slate-700"
                                        >
                                            Password
                                        </label>
                                        <PasswordInput
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            show={showPassword}
                                            onToggle={() => setShowPassword((v) => !v)}
                                            autoComplete="current-password"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetState();
                                                setView('forgot');
                                            }}
                                            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </button>
                                </form>
                            )}

                            {/* Change Password Form */}
                            {view === 'change-password' && (
                                <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="new-pw"
                                            className="mb-1.5 block text-sm font-medium text-slate-700"
                                        >
                                            New password
                                        </label>
                                        <PasswordInput
                                            id="new-pw"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            show={showNewPassword}
                                            onToggle={() => setShowNewPassword((v) => !v)}
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirm-pw"
                                            className="mb-1.5 block text-sm font-medium text-slate-700"
                                        >
                                            Confirm password
                                        </label>
                                        <PasswordInput
                                            id="confirm-pw"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            show={showConfirmPassword}
                                            onToggle={() => setShowConfirmPassword((v) => !v)}
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading ? 'Setting password...' : 'Set Password & Sign In'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetState();
                                            setView('sign-in');
                                        }}
                                        className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back to sign in
                                    </button>
                                </form>
                            )}

                            {/* Forgot Password Form */}
                            {view === 'forgot' && (
                                <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="forgot-email"
                                            className="mb-1.5 block text-sm font-medium text-slate-700"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@host.com"
                                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Send Code'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetState();
                                            setView('sign-in');
                                        }}
                                        className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back to sign in
                                    </button>
                                </form>
                            )}

                            {/* Reset Password Form */}
                            {view === 'reset' && (
                                <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="code"
                                            className="mb-1.5 block text-sm font-medium text-slate-700"
                                        >
                                            Verification code
                                        </label>
                                        <input
                                            id="code"
                                            type="text"
                                            required
                                            inputMode="numeric"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="123456"
                                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="new-password"
                                            className="mb-1.5 block text-sm font-medium text-slate-700"
                                        >
                                            New password
                                        </label>
                                        <PasswordInput
                                            id="new-password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            show={showNewPassword}
                                            onToggle={() => setShowNewPassword((v) => !v)}
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetState();
                                            setView('sign-in');
                                        }}
                                        className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back to sign in
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}</>
    );}