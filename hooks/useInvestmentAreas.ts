// hooks/useInvestmentAreas.ts
'use client';

import { useEffect, useState } from 'react';

export interface Project {
    id:      number;
    number:  string;
    name:    string;
    status:  string;
    funding: number;
}

export interface InvestmentArea {
    id:           number;
    name:         string;
    funding:      number;
    projectCount: number;
    projects:     Project[];
}

export interface InvestmentAreasResponse {
    areas:        InvestmentArea[];
    totalFunding: number;
    total:        number;
}

// `limit` bounds how many investment areas the API returns. There are 23
// active investment areas as of writing (see INVESTMENT_AREA table) — 50
// gives headroom for that to grow without silently dropping rows again.
// If the true count ever exceeds this, bump it further, or better: have the
// API endpoint support omitting `limit` entirely to mean "all".
const ENDPOINT = '/api/home/investmentAreasTreeMap?limit=50&projectsPerArea=3';

let inflight: Promise<InvestmentAreasResponse> | null = null;
let cached: InvestmentAreasResponse | null = null;

function fetchOnce(): Promise<InvestmentAreasResponse> {
    if (cached) return Promise.resolve(cached);
    if (inflight) return inflight;

    inflight = fetch(ENDPOINT)
        .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json() as Promise<InvestmentAreasResponse>;
        })
        .then((json) => {
            cached = json;
            return json;
        })
        .catch((err) => {
            inflight = null;
            throw err;
        });

    return inflight;
}

type State = {
    data: InvestmentAreasResponse | null;
    loading: boolean;
    error: Error | null;
};

export function useInvestmentAreas(): State {
    const [state, setState] = useState<State>(() =>
        cached
            ? { data: cached, loading: false, error: null }
            : { data: null, loading: true, error: null },
    );

    useEffect(() => {
        if (cached) return;

        let cancelled = false;

        fetchOnce()
            .then((res) => {
                if (cancelled) return;
                setState({ data: res, loading: false, error: null });
            })
            .catch((err: Error) => {
                if (cancelled) return;
                setState({ data: null, loading: false, error: err });
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}