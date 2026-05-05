// components/projects_page/insights/map/MapLegend.tsx

'use client';

import { colorForArea, INNOVATION_COLORS } from './shared/colors';
import type { MapProject } from './shared/types';

interface MapLegendProps {
    projects: MapProject[];
}

export function MapLegend({ projects }: MapLegendProps) {
    const present = new Set<string>();
    let hasNoAreaProject = false;

    projects.forEach((p) => {
        if (p.investmentAreas.length === 0) {
            hasNoAreaProject = true;
            return;
        }
        p.investmentAreas.forEach((a) => present.add(a));
    });

    const knownAreas = [...present]
        .filter((a) => a in INNOVATION_COLORS)
        .sort((a, b) =>
            (INNOVATION_COLORS[a].label || a).localeCompare(
                INNOVATION_COLORS[b].label || b,
            ),
        );

    const hasUncuratedAreas = [...present].some((a) => !(a in INNOVATION_COLORS));

    if (knownAreas.length === 0 && !hasUncuratedAreas && !hasNoAreaProject) {
        return null;
    }

    return (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
            {knownAreas.map((area) => {
                const c = colorForArea(area);
                return (
                    <span key={area} className="flex items-center gap-1.5">
                        <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: c.dot }}
                        />
                        {c.label || area}
                    </span>
                );
            })}
            {hasUncuratedAreas && (
                <span className="flex items-center gap-1.5">
                    <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: colorForArea(undefined).dot }}
                    />
                    Other areas
                </span>
            )}
        </div>
    );
}