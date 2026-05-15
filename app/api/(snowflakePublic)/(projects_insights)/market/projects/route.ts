// app/api/(snowflakePublic)/(projects_insights)/market/projects/awardbands.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T, toNum, applyInsightCache } from '../../_shared';
import {
    MATURITY_ORDER,
    SIGNAL_BANDS,
    MARKET_BASE_CTE,
    type MaturityStage,
    type SignalBand,
} from '../_marketShared';

const HARD_LIMIT = 200;

interface ProjectRow {
    PROJECT_ID: number;
    PROJECT_NUMBER: string | null;
    PROJECT_NAME: string | null;
    LEAD_COMPANY: string | null;
    MATURITY: string;
    SIGNAL_SCORE: number | null;
    SIGNAL_BAND: string;
    INVESTMENT_AREAS: string | null;
}

const escape = (v: string) => v.replace(/'/g, "''");

function readSearchParams(url: URL) {
    const maturityRaw = (url.searchParams.get('maturity') ?? '').trim();
    const maturity = MATURITY_ORDER.includes(maturityRaw as MaturityStage)
        ? (maturityRaw as MaturityStage)
        : null;

    const bandRaw = (url.searchParams.get('band') ?? '').trim();
    const band = SIGNAL_BANDS.includes(bandRaw as SignalBand)
        ? (bandRaw as SignalBand)
        : null;

    const minScoreRaw = parseInt(url.searchParams.get('minScore') ?? '0', 10);
    const minScore = Number.isFinite(minScoreRaw)
        ? Math.max(0, Math.min(5, minScoreRaw))
        : 0;

    const nearMarketOnly = url.searchParams.get('nearMarket') === 'true';

    return { maturity, band, minScore, nearMarketOnly };
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const { maturity, band, minScore, nearMarketOnly } = readSearchParams(url);

    const wheres: string[] = [];

    if (maturity) {
        wheres.push(`pm.MATURITY = '${escape(maturity)}'`);
    } else if (nearMarketOnly) {
        wheres.push(`pm.MATURITY = 'Near-market'`);
    }

    if (band) {
        wheres.push(`psb.SIGNAL_BAND = '${escape(band)}'`);
    } else if (minScore > 0) {
        wheres.push(`psb.SIGNAL_SCORE >= ${minScore}`);
    }

    const whereClause = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';

    try {
        const rows = (await query(`
            ${MARKET_BASE_CTE}
            SELECT
                p.PROJECT_ID,
                p.PROJECT_NUMBER,
                p.PROJECT_NAME,
                c.COMPANY_NAME AS LEAD_COMPANY,
                pm.MATURITY,
                psb.SIGNAL_SCORE,
                psb.SIGNAL_BAND,
                (
                    SELECT LISTAGG(DISTINCT ia.INVESTMENT_AREA_NAME, ', ')
                        WITHIN GROUP (ORDER BY ia.INVESTMENT_AREA_NAME)
                    FROM ${T}.PROJECT_HAS_INVESTMENT_AREA phia
                    INNER JOIN ${T}.INVESTMENT_AREA ia
                        ON phia.INVESTMENT_AREA_INVESTMENT_AREA_ID = ia.INVESTMENT_AREA_ID
                    WHERE phia.PROJECT_PROJECT_ID = p.PROJECT_ID
                ) AS INVESTMENT_AREAS
            FROM ${T}.PROJECT p
            INNER JOIN project_maturity pm
                ON p.PROJECT_ID = pm.PROJECT_ID
            INNER JOIN project_signal_band psb
                ON p.PROJECT_ID = psb.PROJECT_ID
            LEFT JOIN ${T}.COMPANY c
                ON p.PROJECT_LEAD_COMPANY_ID = c.COMPANY_ID
            ${whereClause}
            ORDER BY psb.SIGNAL_SCORE DESC NULLS LAST, pm.MATURITY_RANK DESC
            LIMIT ${HARD_LIMIT}
        `)) as ProjectRow[];

        const splitMulti = (s: string | null) =>
            (s ?? '')
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean);

        const projects = rows.map((r) => ({
            id: r.PROJECT_ID,
            projectNumber: r.PROJECT_NUMBER,
            projectName: r.PROJECT_NAME,
            leadCompany: r.LEAD_COMPANY,
            maturity: r.MATURITY as MaturityStage,
            signalScore: toNum(r.SIGNAL_SCORE),
            signalBand: r.SIGNAL_BAND as SignalBand,
            investmentAreas: splitMulti(r.INVESTMENT_AREAS),
        }));
// new cache applied to each filter (stage, signal, score dropdowns) as well
        return applyInsightCache(
            NextResponse.json({
                projects,
                count: projects.length,
                truncated: rows.length === HARD_LIMIT,
                limit: HARD_LIMIT,
            }),
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[market/projects] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}