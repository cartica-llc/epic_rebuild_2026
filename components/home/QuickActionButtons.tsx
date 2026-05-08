"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface QuickAction {
    label: string;
    onClick?: () => void;
    size?: "small" | "medium" | "large";
    param?: string;
}

const defaultActions: QuickAction[] = [
    {
        label: "How is funding being spent?",
        size: "large",
        param: "spending",
    },
    {
        label: "What have projects learned?",
        size: "medium",
        param: "technology",
    },
    {
        label: "What projects are near me?",
        size: "small",
        param: "map",
    },
    {
        label: "What is close to market?",
        size: "medium",
        param: "market",
    },
];

interface QuickActionButtonsProps {
    actions?: QuickAction[];
    subtitle?: string;
}

const getSizeClasses = (size?: QuickAction["size"]) => {
    switch (size) {
        case "large":
            return "md:col-span-2";

        case "medium":
        case "small":
        default:
            return "md:col-span-1";
    }
};

export function QuickActionButtons({
                                       actions = defaultActions,
                                       subtitle = "Pick a path to start exploring.",
                                   }: QuickActionButtonsProps) {
    const router = useRouter();

    const handleActionClick = (action: QuickAction) => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }

        if (action.onClick) {
            action.onClick();
            return;
        }

        if (action.param) {
            router.push(`/projects?view=${action.param}`);
        }
    };

    return (
        <section className="bg-white px-4 py-8 md:px-0 md:py-0">
            <div className="mx-auto max-w-3xl">
                <motion.div
                    className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.08,
                            },
                        },
                    }}
                >
                    {actions.map((action, index) => (
                        <motion.button
                            key={`${action.label}-${index}`}
                            type="button"
                            onClick={() => handleActionClick(action)}
                            className={`group relative flex min-h-[76px] w-full items-center justify-between overflow-hidden rounded-2xl bg-white px-5 py-4 text-left text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-400 active:scale-[0.98] md:min-h-[88px] md:px-6 md:py-5 ${getSizeClasses(
                                action.size
                            )}`}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    y: 20,
                                    scale: 0.98,
                                },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 15,
                                    },
                                },
                            }}
                        >
                            {/* Default border */}
                            <span className="absolute inset-0 rounded-2xl border border-slate-200 transition-opacity duration-200 md:group-hover:opacity-0" />

                            {/* Gradient border (Restricted hover to larger screens to prevent sticky hover on mobile) */}
                            <span
                                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 md:group-hover:opacity-100"
                                style={{
                                    background:
                                        "linear-gradient(to right, #0284c7, #059669, #e11d48)",
                                    padding: "2px",
                                    WebkitMask:
                                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "xor",
                                    maskComposite: "exclude",
                                }}
                            />

                            <span className="relative z-10 pr-4 text-[1rem] font-semibold leading-snug sm:text-[1.05rem] md:text-[1.15rem]">
                {action.label}
              </span>

                            {/* Arrow is persistently visible on mobile, animated on hover for desktop */}
                            <span className="relative z-10 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-1 md:opacity-0 md:group-hover:opacity-100">
                →
              </span>
                        </motion.button>
                    ))}
                </motion.div>

                <p className="mt-5 text-center text-sm text-slate-500 sm:mt-6 md:mt-4 md:block md:text-left md:text-slate-600">
                    {subtitle}
                </p>
            </div>
        </section>
    );
}