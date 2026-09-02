// components/projects_page/projectsList/ProjectThumbnail.tsx

'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

function buildThumbnailKey(imageKey: string): string {
    if (!imageKey) return '';
    return `${imageKey}_thumbnail.webp`;
}

export function ProjectThumbnail({
                                     imageKey,
                                     alt,
                                     className = '',
                                     imageClassName = '',
                                     onImageAvailabilityChange,
                                 }: {
    imageKey?: string;
    alt: string;
    className?: string;
    imageClassName?: string;
    /** Fires once we know whether a real image will actually render (no
     *  imageKey, a failed lookup, or a broken image all report `false`). Lets
     *  the parent card drop its gradient/mask styling when there's nothing to show. */
    onImageAvailabilityChange?: (available: boolean) => void;
}) {
    const [src, setSrc] = useState<string | null>(null);

    const thumbnailKey = useMemo(() => {
        return imageKey ? buildThumbnailKey(imageKey) : '';
    }, [imageKey]);

    const displaySrc = thumbnailKey ? src : null;

    // Ref so the fetch effect below doesn't need the callback in its deps
    // (callers often pass an inline function).
    const onAvailabilityRef = useRef(onImageAvailabilityChange);
    useEffect(() => {
        onAvailabilityRef.current = onImageAvailabilityChange;
    }, [onImageAvailabilityChange]);

    useEffect(() => {
        if (!thumbnailKey) {
            setSrc(null);
            onAvailabilityRef.current?.(false);
            return;
        }

        let cancelled = false;

        fetch(`/api/projectImages/projectImagethumbnails?key=${encodeURIComponent(thumbnailKey)}`)
            .then((r) => r.json())
            .then((data) => {
                if (cancelled) return;
                const url = data?.url ?? null;
                setSrc(url);
                onAvailabilityRef.current?.(Boolean(url));
            })
            .catch(() => {
                if (cancelled) return;
                setSrc(null);
                onAvailabilityRef.current?.(false);
            });

        return () => {
            cancelled = true;
        };
    }, [thumbnailKey]);

    const handleImageError = () => {
        setSrc(null);
        onAvailabilityRef.current?.(false);
    };

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
                        onError={handleImageError}
                    />
                    {/* No full-image whiteout here anymore — ProjectCard's
                        BLUR_MASK_STYLE handles legibility, contained to just
                        behind the amount text instead of washing out the photo. */}
                </>
            ) : (
                <div className="absolute inset-0" />
            )}
        </div>
    );
}