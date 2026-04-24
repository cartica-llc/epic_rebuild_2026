// components/HeroGallery.tsx
'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import type { GalleryImage } from '../types';

type Props = {
    main: string | null;
    thumb: string | null;
    gallery: GalleryImage[];
    loading?: boolean;
};

// ─── Shared sub-components ───────────────────────────────────────────────────

type NavButtonProps = {
    direction: 'prev' | 'next';
    onClick: (e: React.MouseEvent) => void;
    size?: 'sm' | 'lg';
};

function NavButton({ direction, onClick, size = 'sm' }: NavButtonProps) {
    const dim = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
    const iconDim = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    const pos = direction === 'prev' ? 'left-3' : 'right-3';
    const label = direction === 'prev' ? 'Previous image' : 'Next image';
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            aria-label={label}
            className={`absolute top-1/2 ${pos} z-10 flex ${dim} -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60`}
        >
            <Icon className={iconDim} />
        </button>
    );
}

type GalleryControlsProps = {
    index: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    navSize?: 'sm' | 'lg';
    counterClassName?: string;
};

function GalleryControls({
                             index,
                             total,
                             onPrev,
                             onNext,
                             navSize = 'sm',
                             counterClassName = 'absolute right-3 bottom-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm',
                         }: GalleryControlsProps) {
    if (total <= 1) return null;
    return (
        <>
            <NavButton direction="prev" onClick={onPrev} size={navSize} />
            <NavButton direction="next" onClick={onNext} size={navSize} />
            <span className={counterClassName}>
                {index + 1} / {total}
            </span>
        </>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HeroGallery({ main, thumb, gallery, loading = false }: Props) {
    const [index, setIndex] = useState(0);
    const [errors, setErrors] = useState<Record<number, boolean>>({});
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [expanded, setExpanded] = useState(false);

    const imgs = useMemo(() => {
        const out: { url: string; th: string }[] = [];
        if (main) out.push({ url: main, th: thumb || main });
        for (const g of gallery) out.push({ url: g.url, th: g.thumbnailUrl || g.url });
        return out;
    }, [main, thumb, gallery]);

    const prev = useCallback(() => setIndex((x) => (x > 0 ? x - 1 : imgs.length - 1)), [imgs.length]);
    const next = useCallback(() => setIndex((x) => (x < imgs.length - 1 ? x + 1 : 0)), [imgs.length]);

    // Touch swipe — applied to both gallery and lightbox via the wrapper div
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (touchStart === null || touchEnd === null) return;
        const dist = touchStart - touchEnd;
        if (dist > 50) next();
        if (dist < -50) prev();
    };

    // Keyboard + scroll-lock when lightbox is open
    useEffect(() => {
        if (!expanded) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setExpanded(false);
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [expanded, prev, next]);

    if (loading) {
        return (
            <div className="relative mt-6">
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-white/5" />
            </div>
        );
    }

    if (!imgs.length) {
        return (
            <div className="relative mt-6">
                <div className="relative flex aspect-[21/9] w-full items-center justify-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/5">
                    <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-10 w-10 text-white/20" />
                        <span className="text-xs text-white/40">No project images</span>
                    </div>
                </div>
            </div>
        );
    }

    const cur = imgs[index];
    const canExpand = !errors[index];
    const layoutId = `hero-image-${index}`;

    return (
        <>
            {/* ── Gallery strip ── */}
            <div
                className="group relative mt-6"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg">
                    {canExpand ? (
                        <motion.div
                            layoutId={layoutId}
                            className="absolute inset-0 cursor-zoom-in"
                            transition={{ layout: { type: 'spring', stiffness: 260, damping: 28 } }}
                            onClick={() => setExpanded(true)}
                        >
                            <Image
                                src={cur.url}
                                alt={`Project image ${index + 1}`}
                                fill
                                priority={index === 0}
                                sizes="(max-width: 1024px) 100vw, 1024px"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                                onError={() => setErrors((p) => ({ ...p, [index]: true }))}
                                unoptimized
                            />
                        </motion.div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                            <ImageIcon className="h-10 w-10 text-white/20" />
                        </div>
                    )}

                    <GalleryControls
                        index={index}
                        total={imgs.length}
                        onPrev={prev}
                        onNext={next}
                    />
                </div>

                {/* Thumbnail strip */}
                {imgs.length > 1 && (
                    <div className="hidden mt-3 flex gap-2 overflow-x-auto pb-1 h-14">
                        {imgs.map((img, j) => (
                            <button
                                key={j}
                                type="button"
                                onClick={() => setIndex(j)}
                                aria-label={`View image ${j + 1}`}
                                className={[
                                    'flex-none overflow-hidden rounded-md transition-all duration-300',
                                    j === index
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900/50'
                                        : 'opacity-40 hover:opacity-70',
                                ].join(' ')}
                            >
                                <Image
                                    src={img.th}
                                    alt=""
                                    width={80}
                                    height={56}
                                    className="h-14 w-20 object-cover"
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Lightbox ── */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        onClick={() => setExpanded(false)}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(false);
                            }}
                            aria-label="Close"
                            className="absolute top-4 right-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <GalleryControls
                            index={index}
                            total={imgs.length}
                            onPrev={prev}
                            onNext={next}
                            navSize="lg"
                            counterClassName="absolute bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm"
                        />

                        {/* Image — stopPropagation only on the image itself, not a large wrapper */}
                        {canExpand && (
                            <motion.img
                                layoutId={layoutId}
                                src={cur.url}
                                alt={`Project image ${index + 1}`}
                                className="relative z-[55] block max-h-[92vh] max-w-[92vw] object-contain"
                                style={{ pointerEvents: 'auto' }}
                                transition={{
                                    layout: { type: 'spring', stiffness: 220, damping: 26 },
                                    opacity: { duration: 0.22 },
                                    scale: { duration: 0.28, ease: 'easeOut' },
                                }}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.985 }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}