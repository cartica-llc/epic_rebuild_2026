// app/api/(snowflakePublic)/(projects_insights)/_shared.ts
import type { NextResponse } from 'next/server';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

export const T = `${DB}.${SCHEMA}`;

const escape = (v: string) => v.replace(/'/g, "''");


export function readInsightFilters(url: URL) {
    const periodRaw = url.searchParams.get('period');
    const period =
        periodRaw && periodRaw !== 'all' && periodRaw.trim() !== '' ? periodRaw : null;

    const areaRaw = url.searchParams.get('area');
    const area =
        areaRaw && areaRaw !== 'all' && areaRaw.trim() !== '' ? areaRaw : null;

    return { period, area };
}


export function buildFilterSql(opts: { period: string | null; area: string | null }) {
    const wheres: string[] = ['COALESCE(p.IS_ACTIVE, 1) = 1'];

    if (opts.period) {
        wheres.push(`ipp.PERIOD_NAME = '${escape(opts.period)}'`);
    }

    let areaJoin = '';
    if (opts.area) {
        areaJoin = `
            INNER JOIN ${T}.PROJECT_HAS_INVESTMENT_AREA phia_filter
                ON p.PROJECT_ID = phia_filter.PROJECT_PROJECT_ID
            INNER JOIN ${T}.INVESTMENT_AREA ia_filter
                ON phia_filter.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia_filter.INVESTMENT_AREA_ID
                AND ia_filter.INVESTMENT_AREA_NAME = '${escape(opts.area)}'
        `;
    }

    return {
        whereClause: wheres.join(' AND '),
        areaJoin,
    };
}


export function buildGroupingAreaFilter(area: string | null): string {
    return area ? `AND ia.INVESTMENT_AREA_NAME = '${escape(area)}'` : '';
}


export async function safeQuery<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.warn(`[insight:${label}] failed:`, message);
        return null;
    }
}

export const toNum = (v: unknown): number => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

// this is for the caching of the data visualizations 60s
export function applyInsightCache(res: NextResponse, seconds = 60): NextResponse {
    res.headers.set(
        'Cache-Control',
        `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}`,
    );
    return res;
}