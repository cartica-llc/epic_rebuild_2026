import type { CSSProperties } from 'react';

const GRADIENT_BORDER_STYLE: CSSProperties = {
    background: 'linear-gradient(to right, #0284c7, #059669, #e11d48)',
    padding: '2px',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
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
        label: 'Twitter',
        href: '#',
        path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    },
    {
        label: 'LinkedIn',
        href: '#',
        path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
    {
        label: 'YouTube',
        href: '#',
        path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
];

export function FooterSocialLinks() {
    return (
        <div className="flex gap-3">
            {socials.map(({ label, href, path }) => (
                <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white transition-all overflow-hidden"
                >
                    <span className="absolute inset-0 rounded-lg border border-slate-200 transition-opacity duration-200 group-hover:opacity-0" />
                    <span
                        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        style={GRADIENT_BORDER_STYLE}
                    />
                    <svg
                        className="relative z-10 w-5 h-5 text-slate-700"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d={path} />
                    </svg>
                </a>
            ))}
        </div>
    );
}