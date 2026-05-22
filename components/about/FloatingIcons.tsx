"use client";

import React, { useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface IconConfig {
    src: string;
    alt: string;
    position: string; // tailwind absolute-positioning classes — one per corner
    size: number;
    delay: number; // entrance order — alternates corners
    floatDuration: number;
    floatRange: number;
}

/**
 * One icon per corner, inset from the edges. Entrance delays alternate
 * corners (TL → TR → BL → BR) so they rise in one at a time.
 * Each icon is draggable, constrained to the hero (constraintsRef).
 */
const icons: IconConfig[] = [
    {
        src: "/images/about/epic_grid.svg",
        alt: "Solar panel",
        position: "left-12 top-12 lg:left-24 lg:top-16",
        size: 76,
        delay: 0.4,
        floatDuration: 6,
        floatRange: 14,
    },
    {
        src: "/images/about/epic_wind.svg",
        alt: "Wind turbine",
        position: "right-12 top-12 lg:right-24 lg:top-16",
        size: 72,
        delay: 0.7,
        floatDuration: 7,
        floatRange: 12,
    },
    {
        src: "/images/about/epic_man.svg",
        alt: "Field worker",
        position: "left-12 bottom-12 lg:left-24 lg:bottom-16",
        size: 70,
        delay: 1.0,
        floatDuration: 6.5,
        floatRange: 16,
    },
    {
        src: "/images/about/epic_elect.svg",
        alt: "Electricity tower",
        position: "right-12 bottom-12 lg:right-24 lg:bottom-16",
        size: 66,
        delay: 1.3,
        floatDuration: 5.5,
        floatRange: 13,
    },
];

export default function FloatingIcons() {
    const constraintsRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={constraintsRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] hidden sm:block"
        >
            {icons.map((icon) => (
                // Draggable element IS the positioned element — matches the
                // official dragConstraints pattern. Entrance + float live on
                // inner children so they never conflict with the drag transform.
                <motion.div
                    key={icon.src}
                    drag
                    dragConstraints={constraintsRef}
                    dragElastic={0.2}
                    dragTransition={{ bounceStiffness: 320, bounceDamping: 22 }}
                    whileHover={{ scale: 1.08 }}
                    whileDrag={{ scale: 1.14, zIndex: 30 }}
                    className={`absolute ${icon.position} pointer-events-auto cursor-grab touch-none active:cursor-grabbing`}
                >
                    {/* Entrance — rises up + fades in once */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: icon.delay, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Continuous gentle float */}
                        <motion.div
                            animate={{ y: [0, -icon.floatRange, 0] }}
                            transition={{
                                duration: icon.floatDuration,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: icon.delay,
                            }}
                        >
                            <Image
                                src={icon.src}
                                alt={icon.alt}
                                width={icon.size}
                                height={icon.size}
                                draggable={false}
                                className="select-none opacity-90 drop-shadow-sm"
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
}