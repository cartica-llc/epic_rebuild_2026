// app/api/(snowflakePublic)/(projects_insights)/map/projects/awardbands.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T, toNum, applyInsightCache } from '../../_shared';

const HARD_LIMIT = 1000;

const CA_LAT_MIN = 32.0;
const CA_LAT_MAX = 42.5;
const CA_LNG_MIN = -125.0;
const CA_LNG_MAX = -114.0;

interface ProjectRow {
    PROJECT_ID: number;
    PROJECT_NUMBER: string | null;
    PROJECT_NAME: string | null;
    PROJECT_STATUS: string | null;
    EPIC_PERIOD: string | null;
    PROJECT_LEAD: string | null;
    COMMITTED_FUNDING: number | null;
    CONTRACTED_FUNDING: number | null;
    EXPENDED_FUNDING: number | null;
    MATCH_FUNDING: number | null;
    LEVERAGED_FUNDS: number | null;
    CPUC_DACLI: number | null;
    INVESTMENT_AREAS: string | null;
    LATITUDE: number;
    LONGITUDE: number;
    CITY: string | null;
}

const escape = (v: string) => v.replace(/'/g, "''");

function readParams(url: URL) {
    const areaRaw = (url.searchParams.get('area') ?? '').trim();
    const area = areaRaw || null;
    const dacliOnly = url.searchParams.get('dacli') === 'true';
    return { area, dacliOnly };
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const { area, dacliOnly } = readParams(url);

    const projectWheres: string[] = ['COALESCE(p.IS_ACTIVE, 1) = 1'];
    if (dacliOnly) {
        projectWheres.push('COALESCE(p.CPUC_DACLI, 0) = 1');
    }

    if (area) {
        projectWheres.push(`EXISTS (
            SELECT 1
            FROM ${T}.PROJECT_HAS_INVESTMENT_AREA phia_f
            INNER JOIN ${T}.INVESTMENT_AREA ia_f
                ON phia_f.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia_f.INVESTMENT_AREA_ID
            WHERE phia_f.PROJECT_PROJECT_ID = p.PROJECT_ID
              AND ia_f.INVESTMENT_AREA_NAME = '${escape(area)}'
        )`);
    }

    const projectWhereClause = projectWheres.join(' AND ');

    try {
        const rows = (await query(`
            WITH ranked_addresses AS (

                SELECT
                    pha.PROJECT_PROJECT_ID  AS PROJECT_ID,
                    a.LATITUDE_Y            AS LATITUDE,
                    a.LONGITUDE_X           AS LONGITUDE,
                    a.CITY                  AS CITY,
                    ROW_NUMBER() OVER (
                        PARTITION BY pha.PROJECT_PROJECT_ID
                        ORDER BY pha.CREATE_DATE DESC NULLS LAST, pha.PROJECT_HAS_ADDRESS_ID DESC
                    ) AS rn
                FROM ${T}.PROJECT_HAS_ADDRESS pha
                INNER JOIN ${T}.ADDRESS a
                    ON pha.ADDRESS_ADDRESS_ID = a.ADDRESS_ID
                WHERE COALESCE(pha.IS_ACTIVE, 1) = 1
                  AND COALESCE(a.IS_ACTIVE, 1) = 1
                  AND a.LATITUDE_Y IS NOT NULL
                  AND a.LONGITUDE_X IS NOT NULL
                  AND a.LATITUDE_Y BETWEEN ${CA_LAT_MIN} AND ${CA_LAT_MAX}
                  AND a.LONGITUDE_X BETWEEN ${CA_LNG_MIN} AND ${CA_LNG_MAX}
            ),
            primary_address AS (
                SELECT PROJECT_ID, LATITUDE, LONGITUDE, CITY
                FROM ranked_addresses
                WHERE rn = 1
            )
            SELECT
                p.PROJECT_ID,
                p.PROJECT_NUMBER,
                p.PROJECT_NAME,
                p.PROJECT_STATUS,
                ipp.PERIOD_NAME                                AS EPIC_PERIOD,
                c.COMPANY_NAME                                 AS PROJECT_LEAD,
                COALESCE(fd.COMMITED_FUNDING_AMT, 0)           AS COMMITTED_FUNDING,
                COALESCE(fd.CONTRACT_AMOUNT, 0)                AS CONTRACTED_FUNDING,
                COALESCE(fd.FUNDS_EXPENDED_TO_DATE, 0)         AS EXPENDED_FUNDING,
                COALESCE(fd.MATCH_FUNDING, 0)                  AS MATCH_FUNDING,
                COALESCE(fd.LEVERAGED_FUNDS, 0)                AS LEVERAGED_FUNDS,
                COALESCE(p.CPUC_DACLI, 0)                      AS CPUC_DACLI,
                pa.LATITUDE,
                pa.LONGITUDE,
                pa.CITY,
                (
                    SELECT LISTAGG(DISTINCT ia.INVESTMENT_AREA_NAME, ', ')
                        WITHIN GROUP (ORDER BY ia.INVESTMENT_AREA_NAME)
                    FROM ${T}.PROJECT_HAS_INVESTMENT_AREA phia
                    INNER JOIN ${T}.INVESTMENT_AREA ia
                        ON phia.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia.INVESTMENT_AREA_ID
                    WHERE phia.PROJECT_PROJECT_ID = p.PROJECT_ID
                ) AS INVESTMENT_AREAS
            FROM ${T}.PROJECT p
            INNER JOIN primary_address pa
                ON p.PROJECT_ID = pa.PROJECT_ID
            LEFT JOIN ${T}.FINANCE_DETAIL fd
                ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
            LEFT JOIN ${T}.INVESTMENT_PROGRAM_PERIOD ipp
                ON p.INVESTMENT_PROGRAM_PERIOD_PERIOD_ID = ipp.PERIOD_ID
            LEFT JOIN ${T}.COMPANY c
                ON p.PROJECT_LEAD_COMPANY_ID = c.COMPANY_ID
            WHERE ${projectWhereClause}
            ORDER BY COMMITTED_FUNDING DESC NULLS LAST
            LIMIT ${HARD_LIMIT}
        `)) as ProjectRow[];

        const splitMulti = (s: string | null): string[] =>
            (s ?? '')
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean);

        const projects = rows.map((r) => ({
            id: r.PROJECT_ID,
            projectNumber: r.PROJECT_NUMBER,
            projectName: r.PROJECT_NAME,
            projectStatus: r.PROJECT_STATUS,
            epicPeriod: r.EPIC_PERIOD,
            projectLead: r.PROJECT_LEAD,
            committedFunding: toNum(r.COMMITTED_FUNDING),
            contractedFunding: toNum(r.CONTRACTED_FUNDING),
            expendedFunding: toNum(r.EXPENDED_FUNDING),
            matchFunding: toNum(r.MATCH_FUNDING),
            leveragedFunds: toNum(r.LEVERAGED_FUNDS),
            cpucDacli: toNum(r.CPUC_DACLI) === 1,
            investmentAreas: splitMulti(r.INVESTMENT_AREAS),
            latitude: toNum(r.LATITUDE),
            longitude: toNum(r.LONGITUDE),
            city: r.CITY,
        }));

        const totals = projects.reduce(
            (acc, p) => {
                acc.committed += p.committedFunding;
                acc.contracted += p.contractedFunding;
                acc.expended += p.expendedFunding;
                return acc;
            },
            { committed: 0, contracted: 0, expended: 0 },
        );

        return applyInsightCache(
            NextResponse.json({
                projects,
                count: projects.length,
                totals,
                truncated: rows.length === HARD_LIMIT,
                limit: HARD_LIMIT,
            }),
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[map/projects] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}