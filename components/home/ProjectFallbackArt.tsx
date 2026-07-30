'use client';

import { motion } from 'framer-motion';

interface ProjectFallbackArtProps {
    organizationShort?: string;
    groupHover?: boolean;
}

export function ProjectFallbackArt({ organizationShort }: ProjectFallbackArtProps) {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Cool, Desaturated Blue-Grey Background Gradient (Matching Map Palette) */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-200" />

            {/* Ambient Sun/Light Glow Effect */}
            <div
                className="absolute inset-0 opacity-80"
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.9) 0%, transparent 65%)',
                }}
            />

            {/* Organization Short Text — Fades in on hover (Updated Color) */}
            <motion.div
                initial={false}
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            >
                <span className="text-slate-950/60 text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-sm">
                    {organizationShort || 'EPIC'}
                </span>
            </motion.div>

            {/* Floating Energy Icon Centerpiece */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <motion.div
                    animate={{
                        y: [0, -6, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="relative flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:opacity-20"
                >
                    {/* Rotating Outer Energy/Grid Ring (Updated Color) */}
                    <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        viewBox="0 0 100 100"
                        className="w-28 h-28 text-slate-400/30 absolute"
                        aria-hidden="true"
                    >
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="6 6"
                        />
                    </motion.svg>

                    {/* Central Minimal Energy Icon (Single Lightning Bolt - Updated Color) */}
                    <svg
                        viewBox="0 0 100 100"
                        className="w-20 h-20 text-slate-600 fill-current drop-shadow-sm relative z-10"
                        aria-hidden="true"
                    >
                        {/* Minimalistic Lightning Bolt */}
                        <path
                            d="M50 15 L30 50 H45 L35 85 L70 45 H55 Z"
                        />
                    </svg>
                </motion.div>
            </div>
        </div>
    );
}