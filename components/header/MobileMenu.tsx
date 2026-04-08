'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { SignInButton } from './SignInButton';
import logoImage from 'figma:asset/cd7bbceefbc74ac58784570fb273af12d547691e.png';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activePath: string;
}

const quickInsights = [
    { view: 'spending',     label: 'Spending',       sub: 'Track spending & compliance' },
    { view: 'technology',   label: 'Key Learnings',  sub: 'Browse by topic & expertise' },
    { view: 'map',          label: 'Project Map',    sub: 'Map / district view' },
    { view: 'market',       label: 'Market Maturity',sub: 'Where projects are and who\'s close to market' },
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

export function MobileMenu({ isOpen, onClose, activePath }: MobileMenuProps) {
    const router = useRouter();

    // Lock body scroll while drawer is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    function navigateTo(view: string) {
        onClose();
        router.push(`/projects?view=${view}`);
    }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/projects', label: 'Projects' },
        { href: '#', label: 'About EPIC' },
        { href: '#', label: 'FAQ' },
        { href: '#', label: 'Contact' },
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm md:hidden"
                        style={{ zIndex: 9998 }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-2xl overflow-y-auto md:hidden rounded-r-2xl"
                        style={{ zIndex: 9999, height: '100vh' }}
                    >
                        <div className="flex flex-col h-full">
                            {/* Logo section */}
                            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600" />
                                <Link href="/" onClick={onClose} className="flex flex-col items-center text-center gap-2">
                                    <img src={logoImage} alt="California Government Logo" className="h-12 w-auto object-contain" />
                                    <div>
                                        <h2 className="text-xs font-semibold text-slate-900 leading-tight">
                                            California Energy Commission
                                        </h2>
                                        <p className="text-[0.625rem] text-slate-600 mt-0.5">Infrastructure Portfolio</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Nav links */}
                            <nav className="flex flex-col px-3 py-4 space-y-0.5 flex-1 bg-white">
                                {navLinks.map(({ href, label }) => {
                                    const active = isActive(href, activePath);
                                    return (
                                        <Link
                                            key={label}
                                            href={href}
                                            onClick={onClose}
                                            className={`group relative px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                                                active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            {active && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-sky-600 via-emerald-600 to-rose-600" />
                                            )}
                                            {label}
                                        </Link>
                                    );
                                })}

                                <div className="py-2"><div className="border-t border-slate-200" /></div>

                                <div className="px-3 py-2">
                                    <p className="text-[0.625rem] font-semibold text-slate-500 uppercase tracking-wider">
                                        Quick Insights
                                    </p>
                                </div>

                                {quickInsights.map(({ view, label, sub }) => (
                                    <button
                                        key={view}
                                        type="button"
                                        onClick={() => navigateTo(view)}
                                        className="group relative flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition overflow-hidden hover:text-slate-900"
                                    >
                                        <span className="absolute inset-0 rounded-lg border border-slate-200 transition-opacity duration-200 group-hover:opacity-0" />
                                        <span className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={GRADIENT_BORDER_STYLE} />
                                        <div className="relative z-10 text-left">
                                            <div className="font-semibold text-slate-900">{label}</div>
                                            <div className="text-[0.625rem] text-slate-500 mt-0.5">{sub}</div>
                                        </div>
                                        <span className="text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 relative z-10 text-xs">→</span>
                                    </button>
                                ))}
                            </nav>

                            {/* Action buttons */}
                            <div className="p-3 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-2">
                                <Link href="/projects/create" onClick={onClose}>
                                    <Button size="sm" variant="ghost" className="w-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-sm">
                                        Create Project
                                    </Button>
                                </Link>
                                {/* SignInButton handles lazy Cognito modal internally */}
                                <SignInButton />
                                <div className="mt-3 h-0.5 rounded-full bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600 opacity-30" />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}