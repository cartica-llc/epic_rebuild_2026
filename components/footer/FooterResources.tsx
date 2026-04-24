'use client';

import { motion } from 'motion/react';



const links = [
    { href: '#', label: 'FAQ' },
    { href: '#', label: 'Documentation' },
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Accessibility' },
    { href: '#', label: 'Contact Us' },
] as const;

export function FooterResources() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
                Resources
            </h4>

            <ul className="space-y-3">
                {links.map(({ href, label }) => (
                    <li key={label}>
                        <a
                            href={href}
                            className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                        >
                            {label}
                        </a>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}