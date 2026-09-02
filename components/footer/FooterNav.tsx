'use client'

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';

import { motion } from 'motion/react';

const CognitoSignInModal = dynamic(
    () => import('@/components/auth/CognitoSignInModal'),
    {
        ssr: false,
        loading: () => null,
    },
);

const links = [
    { href: '/',          label: 'Home',                 external: false },
    { href: '/projects',  label: 'Projects',             external: false },
    { href: '/about',          label: 'About EPIC',           external: true },
    // { href: '/projects?view=market',          label: 'Funding Opportunities', external: true },
    { href: '/projects?view=technology',          label: 'Research & Results',   external: true },
] as const;

export function FooterNav() {
    const [modalOpen, setModalOpen] = useState(false);
    const handleClose = useCallback(() => setModalOpen(false), []);

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
                <li>
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Sign In
                    </button>
                </li>
            </ul>

            {modalOpen && (
                <CognitoSignInModal isOpen={modalOpen} onClose={handleClose} />
            )}
        </motion.div>
    );
}