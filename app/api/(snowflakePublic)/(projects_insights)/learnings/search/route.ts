// app/api/(snowflakePublic)/(projects_insights)/learnings/search/awardbands.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T, toNum, applyInsightCache } from '../../_shared';

const HARD_LIMIT = 200;
const NARRATIVE_TRUNCATE = 1200; // chars — server-side cap to keep payload small

type NarrativeLens = 'innovations' | 'barriers' | 'learnings' | 'summary';

interface SearchRow {
    PROJECT_ID: number;
    PROJECT_NUMBER: string | null;
    PROJECT_NAME: string | null;
    PROJECT_STATUS: string | null;
    PROJECT_LEAD: string | null;
    COMMITTED_FUNDING_AMT: number | null;
    INVESTMENT_AREAS: string | null;
    CPUC_PROCEEDINGS: string | null;
    NARRATIVE: string | null;
    NARRATIVE_SOURCE: string | null;
}

const escape = (v: string) => v.replace(/'/g, "''");

function readSearchParams(url: URL) {
    const q = (url.searchParams.get('q') ?? '').trim();

    const lensRaw = (url.searchParams.get('lens') ?? '').toLowerCase();
    const lens: NarrativeLens | null =
        lensRaw === 'innovations' ||
        lensRaw === 'barriers' ||
        lensRaw === 'learnings' ||
        lensRaw === 'summary'
            ? lensRaw
            : null;

    const area = (url.searchParams.get('area') ?? '').trim();
    const proceeding = (url.searchParams.get('proceeding') ?? '').trim();
    const status = (url.searchParams.get('status') ?? '').trim();

    return {
        q,
        lens,
        area: area || null,
        proceeding: proceeding || null,
        status: status || null,
    };
}

function buildNarrativeSelect(lens: NarrativeLens | null): string {

    switch (lens) {
        case 'innovations':
            return `
                COALESCE(NULLIF(TRIM(pd.KEY_INNOVATIONS), ''), NULLIF(TRIM(pd.SUMMARY_PROJECT_DESCRIPTION), '')) AS RAW_NARRATIVE,
                CASE
                    WHEN TRIM(COALESCE(pd.KEY_INNOVATIONS, '')) <> '' THEN 'innovations'
                    WHEN TRIM(COALESCE(pd.SUMMARY_PROJECT_DESCRIPTION, '')) <> '' THEN 'summary'
                    ELSE NULL
                END AS NARRATIVE_SOURCE
            `;
        case 'learnings':
            return `
                COALESCE(NULLIF(TRIM(pd.KEY_LEARNINGS), ''), NULLIF(TRIM(pd.SUMMARY_PROJECT_DESCRIPTION), '')) AS RAW_NARRATIVE,
                CASE
                    WHEN TRIM(COALESCE(pd.KEY_LEARNINGS, '')) <> '' THEN 'learnings'
                    WHEN TRIM(COALESCE(pd.SUMMARY_PROJECT_DESCRIPTION, '')) <> '' THEN 'summary'
                    ELSE NULL
                END AS NARRATIVE_SOURCE
            `;
        case 'barriers':
            // Barriers is a composite of three fields — concat the non-empty ones.
            return `
                NULLIF(TRIM(
                    CONCAT_WS(' • ',
                        NULLIF(TRIM(pd.TECHNICAL_BARRIERS), ''),
                        NULLIF(TRIM(pd.MARKET_BARRIERS), ''),
                        NULLIF(TRIM(pd.POLICY_AND_REGULATORY_BARRIERS), '')
                    )
                ), '') AS RAW_NARRATIVE,
                CASE
                    WHEN TRIM(COALESCE(pd.TECHNICAL_BARRIERS, '')) <> ''
                      OR TRIM(COALESCE(pd.MARKET_BARRIERS, '')) <> ''
                      OR TRIM(COALESCE(pd.POLICY_AND_REGULATORY_BARRIERS, '')) <> ''
                    THEN 'barriers'
                    ELSE NULL
                END AS NARRATIVE_SOURCE
            `;
        case 'summary':
            return `
                NULLIF(TRIM(pd.SUMMARY_PROJECT_DESCRIPTION), '') AS RAW_NARRATIVE,
                CASE WHEN TRIM(COALESCE(pd.SUMMARY_PROJECT_DESCRIPTION, '')) <> '' THEN 'summary' ELSE NULL END AS NARRATIVE_SOURCE
            `;
        default:
            // No lens selected — pick the first non-empty among summary → innovations → learnings.
            return `
                COALESCE(
                    NULLIF(TRIM(pd.SUMMARY_PROJECT_DESCRIPTION), ''),
                    NULLIF(TRIM(pd.KEY_INNOVATIONS), ''),
                    NULLIF(TRIM(pd.KEY_LEARNINGS), '')
                ) AS RAW_NARRATIVE,
                CASE
                    WHEN TRIM(COALESCE(pd.SUMMARY_PROJECT_DESCRIPTION, '')) <> '' THEN 'summary'
                    WHEN TRIM(COALESCE(pd.KEY_INNOVATIONS, '')) <> '' THEN 'innovations'
                    WHEN TRIM(COALESCE(pd.KEY_LEARNINGS, '')) <> '' THEN 'learnings'
                    ELSE NULL
                END AS NARRATIVE_SOURCE
            `;
    }
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const { q, lens, area, proceeding, status } = readSearchParams(url);

    // Build the WHERE/HAVING clauses dynamically.
    const wheres: string[] = ['COALESCE(p.IS_ACTIVE, 1) = 1'];

    // Text search across name + narrative fields (case-insensitive).
    if (q) {
        const safe = escape(q);
        wheres.push(`(
            p.PROJECT_NAME ILIKE '%${safe}%'
            OR pd.SUMMARY_PROJECT_DESCRIPTION ILIKE '%${safe}%'
            OR pd.KEY_INNOVATIONS ILIKE '%${safe}%'
            OR pd.KEY_LEARNINGS ILIKE '%${safe}%'
            OR pd.TECHNICAL_BARRIERS ILIKE '%${safe}%'
            OR pd.MARKET_BARRIERS ILIKE '%${safe}%'
            OR pd.POLICY_AND_REGULATORY_BARRIERS ILIKE '%${safe}%'
        )`);
    }

    if (status) {
        wheres.push(`p.PROJECT_STATUS = '${escape(status)}'`);
    }

    // Area filter via EXISTS so we don't disrupt the LISTAGG aggregation.
    if (area) {
        wheres.push(`EXISTS (
            SELECT 1
            FROM ${T}.PROJECT_HAS_INVESTMENT_AREA phia_f
            INNER JOIN ${T}.INVESTMENT_AREA ia_f
                ON phia_f.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia_f.INVESTMENT_AREA_ID
            WHERE phia_f.PROJECT_PROJECT_ID = p.PROJECT_ID
              AND ia_f.INVESTMENT_AREA_NAME = '${escape(area)}'
        )`);
    }

    // Proceeding filter — incoming value is the formatted "[number] - desc" label.
    if (proceeding) {
        wheres.push(`EXISTS (
            SELECT 1
            FROM ${T}.PROJECT_HAS_CPUC_PROCEEDING phcp_f
            INNER JOIN ${T}.CPUC_PROCEEDING cp_f
                ON phcp_f.CPUC_PROCEEDING_CPUC_PROCEEDING_ID = cp_f.CPUC_PROCEEDING_ID
            WHERE phcp_f.PROJECT_PROJECT_ID = p.PROJECT_ID
              AND CONCAT('[', cp_f.CPUC_PROCEEDING_NUMBER, '] - ', cp_f.CPUC_PROCEEDING_DESC) = '${escape(proceeding)}'
        )`);
    }

    const whereClause = wheres.join(' AND ');
    const narrativeSelect = buildNarrativeSelect(lens);

    try {
        const rows = (await query(`
            WITH base AS (
                SELECT
                    p.PROJECT_ID,
                    p.PROJECT_NUMBER,
                    p.PROJECT_NAME,
                    p.PROJECT_STATUS,
                    c.COMPANY_NAME AS PROJECT_LEAD,
                    COALESCE(fd.COMMITED_FUNDING_AMT, 0) AS COMMITTED_FUNDING_AMT,
                    ${narrativeSelect}
                FROM ${T}.PROJECT p
                LEFT JOIN ${T}.PROJECT_DETAIL pd
                    ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
                LEFT JOIN ${T}.COMPANY c
                    ON p.PROJECT_LEAD_COMPANY_ID = c.COMPANY_ID
                LEFT JOIN ${T}.FINANCE_DETAIL fd
                    ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
                WHERE ${whereClause}
            )
            SELECT
                b.PROJECT_ID,
                b.PROJECT_NUMBER,
                b.PROJECT_NAME,
                b.PROJECT_STATUS,
                b.PROJECT_LEAD,
                b.COMMITTED_FUNDING_AMT,
                b.NARRATIVE_SOURCE,
                LEFT(COALESCE(b.RAW_NARRATIVE, ''), ${NARRATIVE_TRUNCATE}) AS NARRATIVE,
                (
                    SELECT LISTAGG(DISTINCT ia.INVESTMENT_AREA_NAME, ', ')
                        WITHIN GROUP (ORDER BY ia.INVESTMENT_AREA_NAME)
                    FROM ${T}.PROJECT_HAS_INVESTMENT_AREA phia
                    INNER JOIN ${T}.INVESTMENT_AREA ia
                        ON phia.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia.INVESTMENT_AREA_ID
                    WHERE phia.PROJECT_PROJECT_ID = b.PROJECT_ID
                ) AS INVESTMENT_AREAS,
                (
                    SELECT LISTAGG(DISTINCT cp.CPUC_PROCEEDING_NUMBER, ', ')
                        WITHIN GROUP (ORDER BY cp.CPUC_PROCEEDING_NUMBER)
                    FROM ${T}.PROJECT_HAS_CPUC_PROCEEDING phcp
                    INNER JOIN ${T}.CPUC_PROCEEDING cp
                        ON phcp.CPUC_PROCEEDING_CPUC_PROCEEDING_ID = cp.CPUC_PROCEEDING_ID
                    WHERE phcp.PROJECT_PROJECT_ID = b.PROJECT_ID
                ) AS CPUC_PROCEEDINGS
            FROM base b
            ORDER BY b.COMMITTED_FUNDING_AMT DESC NULLS LAST
            LIMIT ${HARD_LIMIT}
        `)) as SearchRow[];

        const splitMulti = (s: string | null) =>
            (s ?? '')
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean);

        const projects = rows.map((r) => ({
            id: r.PROJECT_ID,
            projectNumber: r.PROJECT_NUMBER,
            projectName: r.PROJECT_NAME,
            projectStatus: r.PROJECT_STATUS,
            projectLead: r.PROJECT_LEAD,
            committedFunding: toNum(r.COMMITTED_FUNDING_AMT),
            investmentAreas: splitMulti(r.INVESTMENT_AREAS),
            cpucProceedings: splitMulti(r.CPUC_PROCEEDINGS),
            narrative: r.NARRATIVE && r.NARRATIVE.trim() ? r.NARRATIVE : null,
            narrativeSource: (r.NARRATIVE_SOURCE as NarrativeLens | null) ?? null,
        }));

        // Aggregate stats for the summary row.
        const totalCommitted = projects.reduce((s, p) => s + p.committedFunding, 0);

//cache applied
        return applyInsightCache(
         NextResponse.json({
            projects,
            totalCommitted,
            count: projects.length,
            truncated: rows.length === HARD_LIMIT,
            limit: HARD_LIMIT,
        }),
    );

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[learnings/search] failed:', message);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}