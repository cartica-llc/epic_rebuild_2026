// components/projects_page/insights/map/MapVisualization.tsx

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, {
    Layer,
    Popup,
    Source,
    NavigationControl,
    FullscreenControl,
    type MapRef,
    type LayerProps,
    type MapMouseEvent,
} from 'react-map-gl/mapbox';
import type { GeoJSONSource, LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatMoneyShort } from '../spending/shared/format';
import type { MapProject } from './shared/types';

interface MapVisualizationProps {
    projects: MapProject[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
    loading: boolean;
    dacliFilterActive: boolean;
}

const INITIAL_VIEW = {
    longitude: -119.42,
    latitude: 36.78,
    zoom: 5.5,
};

/**
 * Tight California bounds
 * Format: [[westLng, southLat], [eastLng, northLat]]
 */
const CALIFORNIA_BOUNDS: LngLatBoundsLike = [
    [-125.0, 32.3],
    [-114.0, 42.2],
];

const MIN_ZOOM = 5.2;
const MAX_ZOOM = 15;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';


const clusterLayer: LayerProps = {
    id: 'clusters',
    type: 'circle',
    source: 'projects',
    filter: ['has', 'point_count'],
    paint: {
        'circle-color': [
            'step',
            ['get', 'point_count'],
            '#475569',
            10,
            '#64748b',
            50,
            '#94a3b8',
        ],
        'circle-radius': [
            'step',
            ['get', 'point_count'],
            16,
            10,
            22,
            50,
            30,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#0f172a',
        'circle-opacity': 0.9,
    },
};

const clusterCountLayer: LayerProps = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'projects',
    filter: ['has', 'point_count'],
    layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
    },
    paint: {
        'text-color': '#f8fafc',
    },
};

const unclusteredPointLayer: LayerProps = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'projects',
    filter: ['!', ['has', 'point_count']],
    paint: {
        'circle-color': [
            'case',
            ['==', ['get', 'dacli'], true],
            '#d97706',
            '#475569',
        ],
        'circle-radius': 6,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#0f172a',
    },
};

const dacliHaloLayer: LayerProps = {
    id: 'dacli-halo',
    type: 'circle',
    source: 'projects',
    filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'dacli'], true]],
    paint: {
        'circle-color': '#fbbf24',
        'circle-radius': 18,
        'circle-opacity': 0.18,
        'circle-blur': 0.5,
    },
};

const selectedRingLayer: LayerProps = {
    id: 'selected-ring',
    type: 'circle',
    source: 'projects',
    filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'selected'], true]],
    paint: {
        'circle-color': 'transparent',
        'circle-radius': 14,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#f8fafc',
    },
};

export function MapVisualization({
                                     projects,
                                     selectedId,
                                     onSelect,
                                     loading,
                                     dacliFilterActive,
                                 }: MapVisualizationProps) {
    const mapRef = useRef<MapRef | null>(null);
    const [hovered, setHovered] = useState<MapProject | null>(null);

    const geojson = useMemo(() => {
        return {
            type: 'FeatureCollection' as const,
            features: projects.map((p) => ({
                type: 'Feature' as const,
                geometry: {
                    type: 'Point' as const,
                    coordinates: [p.longitude, p.latitude] as [number, number],
                },
                properties: {
                    id: p.id,
                    name: p.projectName ?? 'Untitled project',
                    projectNumber: p.projectNumber ?? '',
                    epicPeriod: p.epicPeriod ?? '',
                    projectStatus: p.projectStatus ?? '',
                    city: p.city ?? '',
                    dacli: p.cpucDacli,
                    selected: p.id === selectedId,
                    committedFunding: p.committedFunding,
                    contractedFunding: p.contractedFunding,
                    expendedFunding: p.expendedFunding,
                },
            })),
        };
    }, [projects, selectedId]);

    /**
     * Fly the camera to the selected project whenever `selectedId` changes
     * — including selections that originate from clicks in the project list,
     * not just from the map itself. Skip when the selection is cleared, and
     * be defensive in case the project doesn't have valid coordinates.
     */
    useEffect(() => {
        if (selectedId == null) return;
        const project = projects.find((p) => p.id === selectedId);
        if (!project) return;
        if (
            typeof project.longitude !== 'number' ||
            typeof project.latitude !== 'number'
        ) {
            return;
        }

        const map = mapRef.current;
        if (!map) return;

        // Zoom in close enough to break out of clustering (clusterMaxZoom = 12)
        // so the user sees the actual selected dot, not a cluster.
        const targetZoom = Math.max(map.getZoom(), 12.5);
        map.easeTo({
            center: [project.longitude, project.latitude],
            zoom: targetZoom,
            duration: 700,
        });
    }, [selectedId, projects]);

    const handleClick = useCallback(
        (event: MapMouseEvent) => {
            const feature = event.features?.[0];
            if (!feature) return;

            if (feature.layer?.id === 'clusters') {
                const clusterId = feature.properties?.cluster_id as number | undefined;
                const source = mapRef.current?.getSource('projects') as
                    | GeoJSONSource
                    | undefined;
                if (clusterId == null || !source) return;

                const geometry = feature.geometry;
                if (geometry.type !== 'Point') return;
                const coords = geometry.coordinates as [number, number];

                const flyToCluster = (zoom: number) => {
                    mapRef.current?.easeTo({
                        center: coords,
                        zoom,
                        duration: 500,
                    });
                };

                const result = source.getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err || zoom == null) return;
                        flyToCluster(zoom);
                    },
                ) as unknown as Promise<number> | undefined;

                if (result && typeof result.then === 'function') {
                    result.then(flyToCluster).catch(() => {});
                }
                return;
            }

            if (feature.layer?.id === 'unclustered-point') {
                const id = feature.properties?.id as number | undefined;
                if (id == null) return;
                onSelect(selectedId === id ? null : id);
            }
        },
        [onSelect, selectedId],
    );

    const handleMouseMove = useCallback(
        (event: MapMouseEvent) => {
            const feature = event.features?.[0];
            if (!feature || feature.layer?.id !== 'unclustered-point') {
                setHovered(null);
                return;
            }
            const id = feature.properties?.id as number | undefined;
            if (id == null) {
                setHovered(null);
                return;
            }
            const project = projects.find((p) => p.id === id) ?? null;
            setHovered(project);
        },
        [projects],
    );

    const handleMouseLeave = useCallback(() => setHovered(null), []);

    if (!MAPBOX_TOKEN) {
        return (
            <section className="rounded-md border border-amber-200 bg-amber-50 p-6">
                <h4 className="text-sm font-semibold text-amber-900">
                    Map unavailable
                </h4>
                <p className="mt-1 text-xs text-amber-800">
                    {/*The Mapbox access token isn&apos;t configured. Set{' '}*/}
                    {/*<code className="rounded bg-amber-100 px-1">*/}
                    {/*    NEXT_PUBLIC_MAPBOX_TOKEN*/}
                    {/*</code>{' '}*/}
                    {/*in your environment to enable the map.*/}
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-md border border-slate-200 bg-neutral-900 p-4 md:p-5">
            <header className="mb-4 flex items-end justify-between gap-3">
                <div>
                    <h4 className="text-sm font-semibold text-white">
                        EPIC projects by location
                    </h4>
                    <p className="mt-1 text-sm text-slate-100">
                        {loading
                            ? 'Loading map…'
                            : `${projects.length} project${projects.length === 1 ? '' : 's'} · California`}
                    </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-100">
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: '#475569' }}
                        />
                        Project
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block h-2 w-2 rounded-full ring-2 ring-amber-300/60"
                            style={{ backgroundColor: '#d97706' }}
                        />
                        DAC / LI
                    </span>
                </div>
            </header>

            <div className="relative overflow-hidden rounded-md ring-1 ring-inset ring-slate-800">
                <Map
                    ref={mapRef}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={INITIAL_VIEW}
                    mapStyle={MAP_STYLE}
                    style={{ width: '100%', height: 540 }}
                    maxBounds={CALIFORNIA_BOUNDS}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                    interactiveLayerIds={['clusters', 'unclustered-point']}
                    onClick={handleClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    cursor={hovered ? 'pointer' : 'grab'}
                    reuseMaps
                >
                    <NavigationControl position="top-right" showCompass={false} />
                    <FullscreenControl position="top-right" />

                    <Source
                        id="projects"
                        type="geojson"
                        data={geojson}
                        cluster
                        clusterMaxZoom={12}
                        clusterRadius={50}
                    >
                        <Layer {...dacliHaloLayer} />
                        <Layer {...clusterLayer} />
                        <Layer {...clusterCountLayer} />
                        <Layer {...unclusteredPointLayer} />
                        <Layer {...selectedRingLayer} />
                    </Source>

                    {hovered && (
                        <Popup
                            longitude={hovered.longitude}
                            latitude={hovered.latitude}
                            anchor="bottom"
                            offset={12}
                            closeButton={false}
                            closeOnClick={false}
                            className="map-hover-popup"
                        >
                            <div className="min-w-[220px] max-w-[320px] rounded-md bg-slate-800 p-3 text-slate-50">
                                <p className="text-sm font-semibold leading-tight">
                                    {hovered.projectName ?? 'Untitled project'}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-300">
                                    {hovered.epicPeriod && <span>{hovered.epicPeriod}</span>}
                                    {hovered.epicPeriod && hovered.projectStatus && (
                                        <span className="text-slate-500">·</span>
                                    )}
                                    {hovered.projectStatus && (
                                        <span>{hovered.projectStatus}</span>
                                    )}
                                    {hovered.city && (
                                        <>
                                            <span className="text-slate-500">·</span>
                                            <span>{hovered.city}</span>
                                        </>
                                    )}
                                    {hovered.cpucDacli && (
                                        <span className="ml-1 rounded-sm bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-900">
                                            DAC / LI
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2.5 flex gap-5">
                                    <FundingFigure
                                        label="Committed"
                                        value={hovered.committedFunding}
                                    />
                                    <FundingFigure
                                        label="Contracted"
                                        value={hovered.contractedFunding}
                                    />
                                    <FundingFigure
                                        label="Expended"
                                        value={hovered.expendedFunding}
                                    />
                                </div>
                            </div>
                        </Popup>
                    )}
                </Map>

                {dacliFilterActive && !loading && (
                    <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-amber-300/40 bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200 backdrop-blur-sm">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                        DAC / LI only
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm">
                        <p className="text-xs text-slate-300">Loading map…</p>
                    </div>
                )}

                {!loading && projects.length === 0 && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/40">
                        <p className="text-xs text-slate-300">
                            {dacliFilterActive
                                ? 'No DAC / LI projects match the current filters'
                                : 'No projects with location data match the current filters'}
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                :global(.map-hover-popup .mapboxgl-popup-content) {
                    padding: 0;
                    background: transparent;
                    box-shadow: 0 10px 20px -4px rgba(0, 0, 0, 0.5);
                    border-radius: 6px;
                }
                :global(.map-hover-popup .mapboxgl-popup-tip) {
                    border-top-color: #1e293b;
                }
            `}</style>
        </section>
    );
}

function FundingFigure({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-50">
                {formatMoneyShort(value)}
            </p>
        </div>
    );
}