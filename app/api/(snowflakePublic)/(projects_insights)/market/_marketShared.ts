// app/api/(snowflakePublic)/(projects_insights)/market/_marketShared.ts

import { T } from '../_shared';

/**
 * Canonical maturity stage order — display order, deepest-funnel first.
 * Used by routes for ORDER BY and by the UI for axis labels.
 */
export const MATURITY_ORDER = [
    'Near-market',
    'Validation',
    'Development',
    'Demonstration / Build',
    'Early R&D',
    'Unstaged',
] as const;

export type MaturityStage = (typeof MATURITY_ORDER)[number];

export const SIGNAL_BANDS = ['Strong', 'Emerging', 'Early'] as const;
export type SignalBand = (typeof SIGNAL_BANDS)[number];

/**
 * Derives the maturity stage for a project based on its assigned development stages.
 * Picks the *most advanced* stage when a project has multiple (e.g., TRL 5 AND
 * Design/Engineer would resolve to "Development" since both fall there, but
 * TRL 9 + TRL 5 would resolve to "Near-market").
 *
 * NOTE: this is a derived field — there is no canonical maturity column in the
 * schema. Surface this clearly in the UI.
 */
export const MATURITY_DERIVATION_SQL = `
    WITH project_stages AS (
        SELECT
            phds.PROJECT_PROJECT_ID AS PROJECT_ID,
            ds.DEVELOPMENT_STAGE_NAME AS STAGE_NAME,
            CASE ds.DEVELOPMENT_STAGE_NAME
                WHEN 'TRL 9' THEN 6
                WHEN 'TRL 8' THEN 5
                WHEN 'TRL 7' THEN 5
                WHEN 'Precommercial technology demonstration' THEN 5
                WHEN 'TRL 6' THEN 4
                WHEN 'Build/Test' THEN 4
                WHEN 'Technology Demonstration' THEN 4
                WHEN 'TRL 5' THEN 3
                WHEN 'TRL 4' THEN 3
                WHEN 'Design/Engineer' THEN 3
                WHEN 'TRL 3' THEN 2
                WHEN 'TRL 2' THEN 2
                WHEN 'TRL 1' THEN 2
                ELSE 0
            END AS STAGE_RANK
        FROM ${T}.PROJECT_HAS_DEVELOPMENT_STAGE phds
        INNER JOIN ${T}.DEVELOPMENT_STAGE ds
            ON phds.DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID = ds.DEVELOPMENT_STAGE_ID
    ),
    project_max_rank AS (
        SELECT
            PROJECT_ID,
            MAX(STAGE_RANK) AS MAX_RANK
        FROM project_stages
        GROUP BY PROJECT_ID
    ),
    project_maturity AS (
        SELECT
            p.PROJECT_ID,
            CASE COALESCE(pmr.MAX_RANK, 0)
                WHEN 6 THEN 'Near-market'
                WHEN 5 THEN 'Validation'
                WHEN 4 THEN 'Demonstration / Build'
                WHEN 3 THEN 'Development'
                WHEN 2 THEN 'Early R&D'
                ELSE 'Unstaged'
            END AS MATURITY,
            COALESCE(pmr.MAX_RANK, 0) AS MATURITY_RANK
        FROM ${T}.PROJECT p
        LEFT JOIN project_max_rank pmr
            ON p.PROJECT_ID = pmr.PROJECT_ID
        WHERE COALESCE(p.IS_ACTIVE, 1) = 1
    )
`;

/**
 * Signal score (0–5) derived from observable project evidence.
 * Each indicator contributes one point. Surface as a PROXY in the UI.
 *
 * - FINAL_REPORT_URL present                       → +1
 * - PROJECT_STATUS suggests completion             → +1
 * - MATCH_FUNDING > 0                              → +1
 * - LEVERAGED_FUNDS > 0                            → +1
 * - GETTING_TO_SCALE or KEY_LEARNINGS populated    → +1
 */
export const SIGNAL_DERIVATION_SQL = `
    project_signals AS (
        SELECT
            p.PROJECT_ID,
            (
                CASE WHEN TRIM(COALESCE(pd.FINAL_REPORT_URL, '')) <> '' THEN 1 ELSE 0 END
              + CASE WHEN UPPER(COALESCE(p.PROJECT_STATUS, '')) IN ('COMPLETED', 'COMPLETE', 'CLOSED', 'FINISHED') THEN 1 ELSE 0 END
              + CASE WHEN COALESCE(fd.MATCH_FUNDING, 0) > 0 THEN 1 ELSE 0 END
              + CASE WHEN COALESCE(fd.LEVERAGED_FUNDS, 0) > 0 THEN 1 ELSE 0 END
              + CASE WHEN TRIM(COALESCE(pd.GETTING_TO_SCALE, '')) <> '' OR TRIM(COALESCE(pd.KEY_LEARNINGS, '')) <> '' THEN 1 ELSE 0 END
            ) AS SIGNAL_SCORE
        FROM ${T}.PROJECT p
        LEFT JOIN ${T}.PROJECT_DETAIL pd
            ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
        LEFT JOIN ${T}.FINANCE_DETAIL fd
            ON p.FINANCE_DETAIL_FINANCE_DETAIL_ID = fd.FINANCE_DETAIL_ID
        WHERE COALESCE(p.IS_ACTIVE, 1) = 1
    ),
    project_signal_band AS (
        SELECT
            PROJECT_ID,
            SIGNAL_SCORE,
            CASE
                WHEN SIGNAL_SCORE >= 4 THEN 'Strong'
                WHEN SIGNAL_SCORE >= 2 THEN 'Emerging'
                ELSE 'Early'
            END AS SIGNAL_BAND
        FROM project_signals
    )
`;

/**
 * Combined CTE prefix to use at the start of any market query.
 * Provides project_maturity and project_signal_band CTEs.
 */
export const MARKET_BASE_CTE = `
    ${MATURITY_DERIVATION_SQL},
    ${SIGNAL_DERIVATION_SQL}
`;
