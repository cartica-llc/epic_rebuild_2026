// app/api/(snowflakePublic)/home/investmentAreasTreeMap/route.ts

import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { query } from '@/lib/snowflake';

const DB     = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

const S_MAX_AGE              = 3600;
const STALE_WHILE_REVALIDATE = 600;
const CACHE_TTL_SECONDS      = 600;

interface AreaRow {
    INVESTMENT_AREA_ID:   number;
    INVESTMENT_AREA_NAME: string | null;
    TOTAL_FUNDING:        number | null;
    PROJECT_COUNT:        number | null;
}

interface TopProjectRow {
    INVESTMENT_AREA_ID:   number;
    PROJECT_ID:           number;
    PROJECT_NUMBER:       string | null;
    PROJECT_NAME:         string | null;
    PROJECT_STATUS:       string | null;
    COMMITED_FUNDING_AMT: number | null;
    AREA_RANK:            number;
}

interface Project {
    id:      number;
    number:  string;
    name:    string;
    status:  string;
    funding: number;
}

interface InvestmentArea {
    id:           number;
    name:         string;
    funding:      number;
    projectCount: number;
    projects:     Project[];
}

const getInvestmentAreasData = unstable_cache(
    async (limit: number, projectsPerArea: number) => {
        const t = `${DB}.${SCHEMA}`;

        const [areaRowsRaw, projectRowsRaw] = await Promise.all([
            query(`
                SELECT
                    ia.INVESTMENT_AREA_ID,
                    ia.INVESTMENT_AREA_NAME,
                    SUM(COALESCE(fd.COMMITED_FUNDING_AMT, 0)) AS TOTAL_FUNDING,
                    COUNT(DISTINCT p.PROJECT_ID)              AS PROJECT_COUNT
                FROM ${t}.INVESTMENT_AREA ia
                INNER JOIN ${t}.PROJECT_HAS_INVESTMENT_AREA phia
                    ON phia.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia.INVESTMENT_AREA_ID
                INNER JOIN ${t}.PROJECT p
                    ON p.PROJECT_ID = phia.PROJECT_PROJECT_ID
                LEFT JOIN ${t}.FINANCE_DETAIL fd
                    ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                WHERE COALESCE(ia.IS_ACTIVE, 1) = 1
                  AND COALESCE(p.IS_ACTIVE, 1)  = 1
                GROUP BY ia.INVESTMENT_AREA_ID, ia.INVESTMENT_AREA_NAME
                HAVING SUM(COALESCE(fd.COMMITED_FUNDING_AMT, 0)) > 0
                ORDER BY TOTAL_FUNDING DESC NULLS LAST
                LIMIT ${limit}
            `),
            query(`
                WITH ranked AS (
                    SELECT
                        phia.INVESTMENT_AREA_INVESTMENT_AREA_ID AS INVESTMENT_AREA_ID,
                        p.PROJECT_ID,
                        p.PROJECT_NUMBER,
                        p.PROJECT_NAME,
                        p.PROJECT_STATUS,
                        fd.COMMITED_FUNDING_AMT,
                        ROW_NUMBER() OVER (
                            PARTITION BY phia.INVESTMENT_AREA_INVESTMENT_AREA_ID
                            ORDER BY COALESCE(fd.COMMITED_FUNDING_AMT, 0) DESC, p.PROJECT_ID DESC
                        ) AS AREA_RANK
                    FROM ${t}.PROJECT_HAS_INVESTMENT_AREA phia
                    INNER JOIN ${t}.PROJECT p
                        ON p.PROJECT_ID = phia.PROJECT_PROJECT_ID
                    LEFT JOIN ${t}.FINANCE_DETAIL fd
                        ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                    WHERE COALESCE(p.IS_ACTIVE, 1) = 1
                )
                SELECT *
                FROM ranked
                WHERE AREA_RANK <= ${projectsPerArea}
            `),
        ]);

        const areaRows    = areaRowsRaw    as unknown as AreaRow[];
        const projectRows = projectRowsRaw as unknown as TopProjectRow[];

        const projectsByArea = new Map<number, Project[]>();
        for (const r of projectRows) {
            const list = projectsByArea.get(r.INVESTMENT_AREA_ID) ?? [];
            list.push({
                id:      r.PROJECT_ID,
                number:  r.PROJECT_NUMBER ?? '',
                name:    r.PROJECT_NAME   ?? '',
                status:  r.PROJECT_STATUS ?? '',
                funding: Number(r.COMMITED_FUNDING_AMT ?? 0),
            });
            projectsByArea.set(r.INVESTMENT_AREA_ID, list);
        }

        const areas: InvestmentArea[] = areaRows.map(a => ({
            id:           a.INVESTMENT_AREA_ID,
            name:         a.INVESTMENT_AREA_NAME ?? '',
            funding:      Number(a.TOTAL_FUNDING ?? 0),
            projectCount: Number(a.PROJECT_COUNT ?? 0),
            projects:     projectsByArea.get(a.INVESTMENT_AREA_ID) ?? [],
        }));

        const totalFunding = areas.reduce((s, a) => s + a.funding, 0);

        return {
            areas,
            totalFunding,
            total: areas.length,
        };
    },
    ['home:investmentAreasTreeMap'],
    {
        revalidate: CACHE_TTL_SECONDS,
        tags: ['home-data', 'home:investmentAreasTreeMap'],
    },
);
function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
    const n = parseInt(raw ?? '', 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit           = clampInt(searchParams.get('limit'), 1, 20, 8);
        const projectsPerArea = clampInt(searchParams.get('projectsPerArea'), 1, 10, 3);

        const payload = await getInvestmentAreasData(limit, projectsPerArea);

        const res = NextResponse.json(payload);
        res.headers.set(
            'Cache-Control',
            `public, s-maxage=${S_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        );
        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Investment areas treemap query error:', message);
        return NextResponse.json(
            { areas: [], totalFunding: 0, total: 0 },
            { status: 500 },
        );
    }
}