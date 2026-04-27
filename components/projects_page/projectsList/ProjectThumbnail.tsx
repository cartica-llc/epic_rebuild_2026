// components/projects_page/projectsList/ProjectThumbnail.tsx

'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

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
    const [src, setSrc] = useState<string | null>(null);

    const thumbnailKey = useMemo(() => {
        return imageKey ? buildThumbnailKey(imageKey) : '';
    }, [imageKey]);

    const displaySrc = thumbnailKey ? src : null;

    useEffect(() => {
        if (!thumbnailKey) return;

        let cancelled = false;

        fetch(`/api/projectImages/projectImagethumbnails?key=${encodeURIComponent(thumbnailKey)}`)
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) {
                    setSrc(data?.url ?? null);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSrc(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [thumbnailKey]);

    return (
        <div className={`relative h-full w-full overflow-hidden ${className}`}>
            {displaySrc ? (
                <>
                    <Image
                        src={displaySrc}
                        alt={alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className={`object-cover rounded-xl overflow-hidden ${imageClassName}`}
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