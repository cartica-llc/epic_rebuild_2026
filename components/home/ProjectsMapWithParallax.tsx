// components/home/ProjectsMapWithParallax.tsx
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ProjectsMap } from './ProjectsMap';

const GRIDS_BG = '/images/home/recent/grids.webp';

export function ProjectsMapWithParallax() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    const skyY          = useTransform(scrollYProgress, [0, 1],            ['0%', '30%']);
    const solarY        = useTransform(scrollYProgress, [0, 0.5, 1],       ['60%', '20%', '10%']);
    const solarOpacity  = useTransform(scrollYProgress, [0, 0.3, 0.7],     [0, 0.5, 1]);
    const sectionOpacity = useTransform(scrollYProgress, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);

    const featherMask = `linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0,0,0,0.00) 4%,
        rgba(0,0,0,0.15) 10%,
        rgba(0,0,0,0.45) 16%,
        rgba(0,0,0,0.75) 22%,
        rgba(0,0,0,1.00) 30%,
        rgba(0,0,0,1.00) 70%,
        rgba(0,0,0,0.75) 78%,
        rgba(0,0,0,0.45) 84%,
        rgba(0,0,0,0.15) 90%,
        rgba(0,0,0,0.00) 96%,
        transparent 100%
    )`;

    return (
        <div ref={containerRef} className="relative -mt-10">
            <motion.div
                className="absolute inset-0 bg-white overflow-hidden"
                style={{
                    opacity:           sectionOpacity,
                    WebkitMaskImage:   featherMask,
                    maskImage:         featherMask,
                    WebkitMaskSize:    '100% 100%',
                    maskSize:          '100% 100%',
                    WebkitMaskRepeat:  'no-repeat',
                    maskRepeat:        'no-repeat',
                }}
            >
                <motion.div className="absolute inset-0 w-full h-full" style={{ y: skyY }}>
                    <div className="hidden absolute inset-0 w-full h-[120%] -top-[40%]" />
                </motion.div>

                <motion.div
                    className="absolute inset-0 w-full h-full"
                    style={{ y: solarY, opacity: solarOpacity }}
                >
                    <div
                        className="absolute inset-0 w-full h-[120%] -top-[40%] bg-no-repeat blur-[3px] md:blur-[6px]"
                        style={{
                            backgroundImage:    `url(${GRIDS_BG})`,
                            backgroundSize:     'cover',
                            backgroundPosition: 'bottom center',
                        }}
                    />
                </motion.div>

                <div className="pointer-events-none absolute inset-0 z-[5] bg-white/40" />
                <div className="pointer-events-none absolute inset-0 z-[6] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.40)_0%,rgba(255,255,255,0.10)_40%,rgba(255,255,255,0)_70%)]" />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <ProjectsMap />
            </div>
        </div>
    );
}