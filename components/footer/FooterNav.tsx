'use client'

import Link from 'next/link';


import { motion } from 'motion/react';

const links = [
    { href: '/',          label: 'Home',                 external: false },
    { href: '/projects',  label: 'Projects',             external: false },
    { href: '#',          label: 'About EPIC',           external: true },
    { href: '#',          label: 'Funding Opportunities', external: true },
    { href: '#',          label: 'Research & Results',   external: true },
] as const;

export function FooterNav() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Navigation
            </h4>
            <ul className="space-y-3">
                {links.map(({ href, label, external }) => (
                    <li key={label}>
                        {external ? (
                            <a href={href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                                {label}
                            </a>
                        ) : (
                            <Link href={href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                                {label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}