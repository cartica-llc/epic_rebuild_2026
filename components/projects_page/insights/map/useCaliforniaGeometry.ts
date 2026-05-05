// // components/projects_page/insights/map/useCaliforniaGeometry.ts
//
// 'use client';
//
// import { useEffect, useState } from 'react';
// import { geoMercator, geoPath, type GeoProjection } from 'd3-geo';
// import * as topojson from 'topojson-client';
// import type { Topology } from 'topojson-specification';
// import type { FeatureCollection } from 'geojson';
//
// export interface MapGeometry {
//     width: number;
//     height: number;
//     californiaPath: string;
//     projection: GeoProjection | null;
// }
//
// const VIEWBOX_WIDTH = 380;
// const VIEWBOX_HEIGHT = 480;
// const TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
//

// export function useCaliforniaGeometry(): MapGeometry & { loading: boolean; error: string | null } {
//     const [state, setState] = useState<{
//         path: string;
//         projection: GeoProjection | null;
//         loading: boolean;
//         error: string | null;
//     }>({
//         path: '',
//         projection: null,
//         loading: true,
//         error: null,
//     });
//
//     useEffect(() => {
//         let cancelled = false;
//         const controller = new AbortController();
//
//         fetch(TOPO_URL, { signal: controller.signal })
//             .then((r) => {
//                 if (!r.ok) throw new Error(`Topology fetch failed (${r.status})`);
//                 return r.json();
//             })
//             .then((us: Topology) => {
//                 if (cancelled) return;
//                 const states = topojson.feature(
//                     us,
//                     us.objects.states,
//                 ) as FeatureCollection;
//                 const ca = states.features.find(
//                     (d) => d.properties?.name === 'California',
//                 );
//                 if (!ca) throw new Error('California feature not found in topology');
//
//                 const proj = geoMercator().fitSize([VIEWBOX_WIDTH, VIEWBOX_HEIGHT], ca);
//                 const pathGen = geoPath().projection(proj);
//
//                 setState({
//                     path: pathGen(ca) || '',
//                     projection: proj,
//                     loading: false,
//                     error: null,
//                 });
//             })
//             .catch((err: unknown) => {
//                 if (cancelled) return;
//                 if (err instanceof DOMException && err.name === 'AbortError') return;
//                 const message = err instanceof Error ? err.message : 'Geometry load failed';
//                 setState({
//                     path: '',
//                     projection: null,
//                     loading: false,
//                     error: message,
//                 });
//             });
//
//         return () => {
//             cancelled = true;
//             controller.abort();
//         };
//     }, []);
//
//     return {
//         width: VIEWBOX_WIDTH,
//         height: VIEWBOX_HEIGHT,
//         californiaPath: state.path,
//         projection: state.projection,
//         loading: state.loading,
//         error: state.error,
//     };
// }
