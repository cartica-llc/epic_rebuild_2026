'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Menu, LogOut } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';
import type { HeaderProps } from './types';

const CognitoSignInModal = dynamic(
    () => import('@/components/auth/CognitoSignInModal'),
    { ssr: false, loading: () => null },
);

const STATIC_ROUTES = ['/projects', '/dashboard'];

function useHeaderVisibility(activePath: string) {
    const isStatic =
        STATIC_ROUTES.some((r) => activePath === r || activePath.startsWith(`${r}/`)) ||
        activePath.startsWith('/admin/');

    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [100, 200], [0, 1]);
    const y = useTransform(scrollY, [100, 200], [-100, 0]);

    return {
        opacity: isStatic ? 1 : opacity,
        y: isStatic ? 0 : y,
    };
}

export function Header({ currentPath }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const pathname = usePathname();
    const activePath = currentPath ?? pathname;
    const { opacity, y } = useHeaderVisibility(activePath);
    const { data: session } = useSession();

    const isSignedIn = !!session?.user;
    const displayName = session?.user?.name ?? session?.user?.email;

    const groups = (session?.user as { groups?: string[] } | undefined)?.groups ?? [];
    const org = (session?.user as { organization?: string | null } | undefined)?.organization ?? null;
    const isMasterAdmin = groups.includes('MasterAdmin');

    // Map org string → display label shown in the sub-header
    const ORG_LABELS: Record<string, string> = {
        epc: 'CEC', cec: 'CEC',
        sce: 'SCE',
        sdge: 'SDG&E', sdg: 'SDG&E',
        pge: 'PG&E',
    };
    const roleLabel = isMasterAdmin
        ? 'Master Administrator'
        : org
            ? (ORG_LABELS[org.toLowerCase().trim()] ?? org.toUpperCase())
            : null;

    function openSignInModal() {
        setIsMobileMenuOpen(false);
        setIsSignInModalOpen(true);
    }

    return (
        <>
            <motion.header style={{ opacity, y }} className="fixed top-0 left-0 right-0 z-50">
                <div className="h-[3px] w-full bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600" />

                <div className="bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <BrandLogo />

                            <nav className="hidden lg:flex items-center gap-6">
                                <NavLinks activePath={activePath} />

                                {isSignedIn && (
                                    <Link
                                        href="/projects/create"
                                        className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                                    >
                                        Create Project
                                    </Link>
                                )}

                                {isSignedIn ? (
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-400"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign Out</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={openSignInModal}
                                        className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </nav>

                            <button
                                className="lg:hidden rounded-md p-2 text-slate-900 transition-colors hover:bg-slate-200"
                                aria-label="Open menu"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {isSignedIn && (
                    <div className="bg-white backdrop-blur-sm border-b border-slate-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-9">
                                <p className="text-xs text-slate-500">
                                    Welcome back, <span className=" capitalize font-semibold text-slate-700">{displayName}</span>
                                </p>
                                <div className="hidden lg:flex items-center gap-4 text-xs">
                                    <Link href="/dashboard" className="text-slate-500 font-bold transition-colors hover:text-slate-700">
                                        Dashboard
                                    </Link>
                                    <span className="text-slate-300">|</span>
                                    {roleLabel && (
                                        <span className={`font-semibold ${isMasterAdmin ? 'text-slate-300' : 'text-slate-300'}`}>
                                            {roleLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.header>

            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                activePath={activePath}
                isSignedIn={isSignedIn}
                onSignIn={openSignInModal}
            />

            <CognitoSignInModal
                isOpen={isSignInModalOpen}
                onClose={() => setIsSignInModalOpen(false)}
            />
        </>
    );
}