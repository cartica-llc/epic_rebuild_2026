'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { FooterSocialLinks } from './FooterSocialLinks';

export function FooterBrand() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
        >
            <Link href="/">
                <Image
                    src="/logo/CAgov-logo.svg"
                    alt="California Energy Commission Logo"
                    width={64}
                    height={64}
                    className="mb-4 h-16 w-auto object-contain"
                />
            </Link>

            <h3 className="mb-2 text-lg font-semibold text-slate-900">
                California Public Utilities Commission
            </h3>

            <p className="mb-4 max-w-md text-sm leading-relaxed text-slate-600">
                Building California&apos;s clean energy future through strategic investments in
                electric infrastructure and innovative energy solutions.
            </p>

            <FooterSocialLinks />
        </motion.div>
    );
}