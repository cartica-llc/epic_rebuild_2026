'use client';

import Link from 'next/link';

interface NavLinksProps {
    activePath: string;
}

const links = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '#', label: 'FAQ' },
] as const;

function isActive(href: string, activePath: string) {
    if (href === '/') return activePath === '/';
    return activePath === href || activePath.startsWith(`${href}/`);
}

export function NavLinks({ activePath }: NavLinksProps) {
    return (
        <>
            {links.map(({ href, label }) => {
                const active = isActive(href, activePath);
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`text-sm font-medium transition-colors ${
                            active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
            <span className="relative">
              {label}
                {active && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600 rounded-full" />
                )}
            </span>
                    </Link>
                );
            })}
        </>
    );
}