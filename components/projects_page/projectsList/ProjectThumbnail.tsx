'use client';

import { useEffect, useState } from 'react';

function buildThumbnailKey(imageKey: string): string {
    if (!imageKey) return '';
    return `${imageKey}_thumbnail.webp`;
}

export function ProjectThumbnail({
                                     imageKey,
                                     alt,
                                     className = '',
                                     imageClassName = '',
                                 }: {
    imageKey?: string;
    alt: string;
    className?: string;
    imageClassName?: string;
}) {
    // Derive null synchronously — no effect needed for the reset case
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        const thumbnailKey = imageKey ? buildThumbnailKey(imageKey) : '';
        if (!thumbnailKey) return; // nothing to fetch — src stays null

        let cancelled = false;

        fetch(`/api/projectImages/projectImagethumbnails?key=${encodeURIComponent(thumbnailKey)}`)
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) setSrc(data?.url ?? null);
            })
            .catch(() => {
                if (!cancelled) setSrc(null);
            });

        return () => {
            cancelled = true;
            setSrc(null); // reset on cleanup so stale src doesn't flash on imageKey change
        };
    }, [imageKey]);

    return (
        <div className={`relative h-full w-full overflow-hidden ${className}`}>
            {src ? (
                <>
                    <img
                        src={src}
                        alt={alt}
                        className={`absolute inset-0 h-full w-full object-cover rounded-xl overflow-hidden ${imageClassName}`}
                        onError={() => setSrc(null)}
                    />
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.52) 56%, rgba(255,255,255,0.78) 70%, rgba(255,255,255,0.96) 84%, rgba(255,255,255,1) 100%)',
                        }}
                    />
                </>
            ) : (
                <div className="absolute inset-0" />
            )}
        </div>
    );
}