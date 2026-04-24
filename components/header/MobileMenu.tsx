'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activePath: string;
    isSignedIn: boolean;
    onSignIn: () => void;
}

const quickInsights = [
    { view: 'spending', label: 'Spending', sub: 'Track spending & compliance' },
    { view: 'technology', label: 'Key Learnings', sub: 'Browse by topic & expertise' },
    { view: 'map', label: 'Project Map', sub: 'Map / district view' },
    { view: 'market', label: 'Market Maturity', sub: "Where projects are and who's close to market" },
    { view: 'all-projects', label: 'Browse all projects', sub: 'Full project database' },
] as const;

function isActive(href: string, activePath: string) {
    if (href === '/') return activePath === '/';
    return activePath === href || activePath.startsWith(`${href}/`);
}

const GRADIENT_BORDER_STYLE: React.CSSProperties = {
    background: 'linear-gradient(to right, #0284c7, #059669, #e11d48)',
    padding: '1.5px',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
};

export function MobileMenu({ isOpen, onClose, activePath, isSignedIn, onSignIn }: MobileMenuProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const displayName = session?.user?.name ?? session?.user?.email;

    const groups = (session?.user as { groups?: string[] } | undefined)?.groups ?? [];
    const org = (session?.user as { organization?: string | null } | undefined)?.organization ?? null;
    const isMasterAdmin = groups.includes('MasterAdmin');

    const ORG_LABELS: Record<string, string> = {
        epc: 'CEC', cec: 'CEC',
        sce: 'SCE',
        sdge: 'SDG\u0026E', sdg: 'SDG\u0026E',
        pge: 'PG\u0026E',
    };
    const roleLabel = isMasterAdmin
        ? 'Master Administrator'
        : org
            ? (ORG_LABELS[org.toLowerCase().trim()] ?? org.toUpperCase())
            : null;

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    function navigateTo(view: string) {
        onClose();
        router.push(`/projects?view=${view}`);
    }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/projects', label: 'Projects' },
        // { href: '#', label: 'About EPIC' },
        // { href: '#', label: 'FAQ' },
        // { href: '#', label: 'Contact' },
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                        style={{ zIndex: 9998 }}
                    />

                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-64 overflow-y-auto rounded-r-2xl bg-white shadow-2xl"
                        style={{ zIndex: 9999, height: '100vh' }}
                    >
                        <div className="flex h-full flex-col">
                            {/* Logo section */}
                            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600" />
                                <Link href="/" onClick={onClose} className="flex flex-col items-center gap-2 text-center">
                                    <Image
                                        src="/logo/CAgov-logo.svg"
                                        alt="California Government Logo"
                                        width={48}
                                        height={48}
                                        className="h-12 w-auto object-contain"
                                    />
                                    <div>
                                        <h2 className="text-xs font-semibold leading-tight text-slate-900">
                                            California Energy Commission
                                        </h2>
                                        <p className="mt-0.5 text-[0.625rem] text-slate-600">Infrastructure Portfolio</p>
                                    </div>
                                </Link>
                            </div>

                            {/* User info bar */}
                            {isSignedIn && (
                                <div className="border-b border-slate-200 bg-white px-4 py-3">
                                    <p className="truncate text-sm font-semibold capitalize text-slate-900">{displayName}</p>
                                    {roleLabel && (
                                        <p className={`mt-0.5 text-[0.625rem] font-semibold ${isMasterAdmin ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {roleLabel}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Nav links */}
                            <nav className="flex flex-1 flex-col space-y-0.5 bg-white px-3 py-4">
                                {navLinks.map(({ href, label }) => {
                                    const active = isActive(href, activePath);
                                    return (
                                        <Link
                                            key={label}
                                            href={href}
                                            onClick={onClose}
                                            className={`group relative rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                                                active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            {active && (
                                                <span className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-600 via-emerald-600 to-rose-600" />
                                            )}
                                            {label}
                                        </Link>
                                    );
                                })}

                                {isSignedIn && (
                                    <Link
                                        href="/dashboard"
                                        onClick={onClose}
                                        className={`group relative rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                                            isActive('/dashboard', activePath)
                                                ? 'text-slate-900'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {isActive('/dashboard', activePath) && (
                                            <span className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-600 via-emerald-600 to-rose-600" />
                                        )}
                                        Dashboard
                                    </Link>
                                )}

                                <div className="py-2">
                                    <div className="border-t border-slate-200" />
                                </div>

                                <div className="px-3 py-2">
                                    <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-slate-500">
                                        Quick Insights
                                    </p>
                                </div>

                                {quickInsights.map(({ view, label, sub }) => (
                                    <button
                                        key={view}
                                        type="button"
                                        onClick={() => navigateTo(view)}
                                        className="group relative flex items-center justify-between overflow-hidden rounded-lg bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:text-slate-900"
                                    >
                                        <span className="absolute inset-0 rounded-lg border border-slate-200 transition-opacity duration-200 group-hover:opacity-0" />
                                        <span
                                            className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                            style={GRADIENT_BORDER_STYLE}
                                        />
                                        <div className="relative z-10 text-left">
                                            <div className="font-semibold text-slate-900">{label}</div>
                                            <div className="mt-0.5 text-[0.625rem] text-slate-500">{sub}</div>
                                        </div>
                                        <span className="relative z-10 text-xs text-slate-400 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                                            →
                                        </span>
                                    </button>
                                ))}
                            </nav>

                            {/* Bottom actions */}
                            <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
                                {isSignedIn ? (
                                    <div className="space-y-2">
                                        <Link
                                            href="/projects/create"
                                            onClick={onClose}
                                            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                                        >
                                            Create Project
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                signOut({ callbackUrl: '/' });
                                            }}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={onSignIn}
                                        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                                    >
                                        Sign In
                                    </button>
                                )}
                                <div className="mt-3 h-0.5 rounded-full bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600 opacity-30" />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}