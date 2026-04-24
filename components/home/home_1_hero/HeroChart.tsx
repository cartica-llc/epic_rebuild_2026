'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

type ChartDatum = {
    name: string;
    value: number;
};

const data: ChartDatum[] = [
    { name: 'Q1', value: 2400 },
    { name: 'Q2', value: 1900 },
    { name: 'Q3', value: 900 },
];

type AnimatedBarShapeProps = {
    fill?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    payload?: ChartDatum;
};

export function HeroChart() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    const bar0Y = useTransform(scrollYProgress, [0, 0.5, 1], [0, -200, 0]);
    const bar1Y = useTransform(scrollYProgress, [0, 0.5, 1], [0, 200, 0]);
    const bar2Y = useTransform(scrollYProgress, [0, 0.5, 1], [0, -200, 0]);

    const chartScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 1]);
    const chartOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6]);

    const barTransforms = [bar0Y, bar1Y, bar2Y];

    const AnimatedBarShape = ({ fill, x = 0, y = 0, width = 0, height = 0, payload }: AnimatedBarShapeProps) => {
        const index = data.findIndex((d) => d.name === payload?.name);
        const transformY = barTransforms[index] ?? bar0Y;

        return (
            <motion.rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                rx={12}
                ry={12}
                style={{ y: transformY }}
            />
        );
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen w-full overflow-hidden"
            style={{ height: '100vh' }}
        >
            <motion.div
                className="absolute inset-0 h-full w-full bg-gradient-to-b from-slate-50 to-white"
                style={{
                    scale: chartScale,
                    opacity: chartOpacity,
                    WebkitMaskImage: `linear-gradient(
            to bottom,
            rgba(0,0,0,0.00) 0%,
            rgba(0,0,0,0.00) 6%,
            rgba(0,0,0,0.20) 14%,
            rgba(0,0,0,0.70) 24%,
            rgba(0,0,0,1.00) 32%,
            rgba(0,0,0,1.00) 74%,
            rgba(0,0,0,0.78) 84%,
            rgba(0,0,0,0.26) 92%,
            rgba(0,0,0,0.00) 100%
          )`,
                    maskImage: `linear-gradient(
            to bottom,
            rgba(0,0,0,0.00) 0%,
            rgba(0,0,0,0.00) 6%,
            rgba(0,0,0,0.20) 14%,
            rgba(0,0,0,0.70) 24%,
            rgba(0,0,0,1.00) 32%,
            rgba(0,0,0,1.00) 74%,
            rgba(0,0,0,0.78) 84%,
            rgba(0,0,0,0.26) 92%,
            rgba(0,0,0,0.00) 100%
          )`,
                    WebkitMaskSize: '100% 100%',
                    maskSize: '100% 100%',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                }}
            >
                <div
                    className="flex h-full w-full items-center justify-center opacity-[0.5]"
                    style={{ minHeight: '600px' }}
                >
                    <ResponsiveContainer width="100%" height="100%" minHeight={600}>
                        <BarChart data={data} margin={{ top: 40, right: 20, left: 20, bottom: 40 }} className="md:!mx-10">
                            <defs>
                                <linearGradient id="slateGradientLight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.92} />
                                    <stop offset="55%" stopColor="#94a3b8" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.22} />
                                </linearGradient>

                                <linearGradient id="slateGradientMedium" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#64748b" stopOpacity={0.95} />
                                    <stop offset="55%" stopColor="#64748b" stopOpacity={0.42} />
                                    <stop offset="100%" stopColor="#64748b" stopOpacity={0.22} />
                                </linearGradient>

                                <linearGradient id="slateGradientDark" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#334155" stopOpacity={0.98} />
                                    <stop offset="55%" stopColor="#334155" stopOpacity={0.46} />
                                    <stop offset="100%" stopColor="#334155" stopOpacity={0.24} />
                                </linearGradient>
                            </defs>

                            <XAxis dataKey="name" hide />
                            <YAxis hide />

                            <Bar dataKey="value" maxBarSize={360} shape={<AnimatedBarShape />}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`bar-cell-${entry.name}-${index}`}
                                        fill={
                                            index === 0
                                                ? 'url(#slateGradientMedium)'
                                                : index === 1
                                                    ? 'url(#slateGradientLight)'
                                                    : 'url(#slateGradientDark)'
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/90 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-full backdrop-blur-[16px]" />
        </div>
    );
}