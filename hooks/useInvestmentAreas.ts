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

const ENDPOINT = '/api/home/investmentAreasTreeMap?limit=8&projectsPerArea=3';

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