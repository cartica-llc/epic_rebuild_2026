'use client';

import type { CSSProperties } from 'react';
import { motion } from 'motion/react';

const GRADIENT_BORDER_STYLE: CSSProperties = {
    background: 'linear-gradient(to right, #0284c7, #059669, #e11d48) border-box',
    border: '2px solid transparent',
    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
};

interface Social {
    label: string;
    href: string;
    path: string;
}

const socials: Social[] = [
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/californiapuc',
        path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    },
    {
        label: 'Facebook',
        href: 'https://www.facebook.com/CaliforniaPUC',
        path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 1.913-.287 1.754h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
    },
    {
        label: 'Twitter',
        href: 'https://x.com/californiapuc',
        path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/californiapuc',
        path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
    {
        label: 'YouTube',
        href: 'https://www.youtube.com/user/CaliforniaPUC',
        path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    }
];

export function FooterSocialLinks() {
    return (
        <div className="flex flex-wrap gap-3">
            {socials.map(({ label, href, path }) => (
                <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white transition-all hover:shadow-sm"
                >

                    <span className="absolute inset-0 rounded-lg border border-slate-200 transition-opacity duration-200 group-hover:opacity-0" />

                    <motion.span
                        className="pointer-events-none absolute inset-0 rounded-lg"
                        style={GRADIENT_BORDER_STYLE}
                        variants={{
                            rest: {
                                opacity: 0,
                                clipPath: 'polygon(0 0, 0 0, 0 0, 0 0, 0 0)',
                                transition: { duration: 0.2 },
                            },
                            hover: {
                                opacity: 1,
                                clipPath: [
                                    'polygon(0 0, 0 0, 0 0, 0 0, 0 0)',
                                    'polygon(0 0, 100% 0, 100% 0, 100% 0, 100% 0)',
                                    'polygon(0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%)',
                                    'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 100%)',
                                    'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0)',
                                ],
                                transition: {
                                    duration: 0.5,
                                    ease: 'linear',
                                },
                            },
                        }}
                    />

                    {/* Foreground Content */}
                    <svg
                        className="relative z-10 h-5 w-5 text-slate-500 transition-colors group-hover:text-slate-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d={path} />
                    </svg>
                </motion.a>
            ))}
        </div>
    );
}