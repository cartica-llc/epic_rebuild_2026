'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'motion/react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from './BrandLogo';
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';
import { SignInButton } from './SignInButton';
import type { HeaderProps } from './types';

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
    const pathname = usePathname();
    const activePath = currentPath ?? pathname;
    const { opacity, y } = useHeaderVisibility(activePath);

    return (
        <>
            <motion.header style={{ opacity, y }} className="fixed top-0 left-0 right-0 z-50">
                <div className="h-[3px] w-full bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600" />

                <div className="bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <BrandLogo />

                            <nav className="hidden md:flex items-center gap-6">
                                <NavLinks activePath={activePath} />
                                <Link href="/projects/create">
                                    <Button size="sm" variant="ghost" className="text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                                        Create Project
                                    </Button>
                                </Link>
                                <SignInButton />
                            </nav>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-slate-900 hover:bg-slate-100"
                                aria-label="Open menu"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                activePath={activePath}
            />
        </>
    );
}