// app/api/(snowflakeUser)/projectEdit/[id]/financeQuarters/route.ts
//
// Quarterly finance records for a project.

// GET
//   Returns the current quarter from FINANCE_DETAIL along with all previous
//   quarters stored in FINANCE_DETAIL_HISTORY.
//
// POST
//   Adds a new quarterly record.
//   - If the quarter is newer than the current one, the current record is
//     moved to history and the new values become the current quarter.
//   - If the quarter is older, it is added directly to history.
//   - Duplicate quarters are prevented in the API.
//
// PUT
//   Updates the values for an existing current or historical quarter.
//   The reporting period (year/quarter) cannot be changed.
//
// DELETE
//   - target: "history" removes a historical quarter.
//   - target: "current" restores the most recent historical quarter as the
//     current record, allowing an incorrect current quarter to be rolled back.
//     This is only allowed when a history record exists.
//
// MATCH_FUNDING_SPLIT is always calculated by the API:
//   MATCH_FUNDING / (MATCH_FUNDING + COMMITED_FUNDING_AMT)

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/snowflake';
import { canEditProject } from '@/lib/permissions';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

const FINANCE_MAX = 999_999_999_999.999;

// ─── Safe SQL helpers (same conventions as projectCreate/projectEdit) ───────

function safeFinanceOrNull(v: unknown, fieldName: string): string {
    if (v === '' || v === null || v === undefined) return 'NULL';
    const n = parseFloat(String(v).replace(/[$,]/g, ''));
    if (!Number.isFinite(n)) return 'NULL';
    if (Math.abs(n) > FINANCE_MAX) {
        throw new Error(`${fieldName} exceeds the maximum value of $999,999,999,999.`);
    }
    return String(n);
}

interface QuarterValues {
    committedFundingAmt: string;   // SQL literal or 'NULL'
    encumberedFunding: string;
    fundsExpended: string;
    adminAndOverheadCost: string;
    matchFunding: string;
    contractAmount: string;
    leveragedFunds: string;
    matchFundingSplit: string;     // computed
}

function parseQuarterValues(body: Record<string, unknown>): QuarterValues {
    const committedFundingAmt = safeFinanceOrNull(body.committedFundingAmt, 'Committed funding amount');
    const matchFunding = safeFinanceOrNull(body.matchFunding, 'Match funding');

    let matchFundingSplit = 'NULL';
    if (matchFunding !== 'NULL' && committedFundingAmt !== 'NULL') {
        const m = parseFloat(matchFunding);
        const c = parseFloat(committedFundingAmt);
        if (m + c !== 0) matchFundingSplit = (m / (m + c)).toFixed(6);
    }

    return {
        committedFundingAmt,
        encumberedFunding: safeFinanceOrNull(body.encumberedFunding, 'Encumbered funding'),
        fundsExpended: safeFinanceOrNull(body.fundsExpended, 'Funds expended'),
        adminAndOverheadCost: safeFinanceOrNull(body.adminAndOverheadCost, 'Admin & overhead cost'),
        matchFunding,
        contractAmount: safeFinanceOrNull(body.contractAmount, 'Contract amount'),
        leveragedFunds: safeFinanceOrNull(body.leveragedFunds, 'Leveraged funds'),
        matchFundingSplit,
    };
}

function parsePeriod(body: Record<string, unknown>): { year: number; quarter: number } | null {
    const year = parseInt(String(body.reportingYear), 10);
    const quarter = parseInt(String(body.reportingQuarter), 10);
    if (!Number.isFinite(year) || year < 2000 || year > 2100) return null;
    if (!Number.isFinite(quarter) || quarter < 1 || quarter > 4) return null;
    return { year, quarter };
}

/** Total ordering for periods: 2026-Q2 → 8106 */
function periodKey(year: number, quarter: number): number {
    return year * 4 + quarter;
}

// ─── Auth + project lookup shared by all verbs ───────────────────────────────

async function authorize(id: string): Promise<
    | { ok: true; projectId: number; fdId: number | null }
    | { ok: false; res: NextResponse }
> {
    const session = await auth();
    if (!session?.user) {
        return { ok: false, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];
    if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
        return { ok: false, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }

    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
        return { ok: false, res: NextResponse.json({ error: 'Invalid project id' }, { status: 400 }) };
    }

    const t = `${DB}.${SCHEMA}`;
    const rows = (await query(`
        SELECT PROGRAM_ADMIN_PROGRAM_ADMIN_ID, FINANCE_DETAIL_FINANCE_DETAIL_ID
        FROM ${t}.PROJECT WHERE PROJECT_ID = ${projectId}
    `)) as Record<string, number | null>[];

    if (rows.length === 0) {
        return { ok: false, res: NextResponse.json({ error: 'Project not found' }, { status: 404 }) };
    }

    const userOrg = (session.user as { organization?: string | null }).organization ?? null;
    if (!canEditProject(userOrg, rows[0].PROGRAM_ADMIN_PROGRAM_ADMIN_ID)) {
        return { ok: false, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }

    return { ok: true, projectId, fdId: rows[0].FINANCE_DETAIL_FINANCE_DETAIL_ID };
}


const numStr = (v: unknown) => (v != null ? String(v) : '');

function mapRow(r: Record<string, unknown>, source: 'current' | 'history') {
    return {
        source,
        historyId: source === 'history' ? Number(r.FINANCE_DETAIL_HISTORY_ID) : null,
        reportingYear: r.REPORTING_YEAR != null ? Number(r.REPORTING_YEAR) : null,
        reportingQuarter: r.REPORTING_QUARTER != null ? Number(r.REPORTING_QUARTER) : null,
        committedFundingAmt: numStr(r.COMMITED_FUNDING_AMT),
        encumberedFunding: numStr(r.ENCUMBERED_FUNDING_AMT),
        fundsExpended: numStr(r.FUNDS_EXPENDED_TO_DATE),
        adminAndOverheadCost: numStr(r.ADMIN_AND_OVERHEAD_COST),
        matchFunding: numStr(r.MATCH_FUNDING),
        contractAmount: numStr(r.CONTRACT_AMOUNT),
        leveragedFunds: numStr(r.LEVERAGED_FUNDS),
        matchFundingSplit: numStr(r.MATCH_FUNDING_SPLIT),
    };
}

// GET — list current + history quarters

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const authRes = await authorize(id);
        if (!authRes.ok) return authRes.res;
        const { fdId } = authRes;

        if (fdId == null) return NextResponse.json({ quarters: [] });

        const t = `${DB}.${SCHEMA}`;
        const [currentRows, historyRows] = await Promise.all([
            query(`
                SELECT REPORTING_YEAR, REPORTING_QUARTER, COMMITED_FUNDING_AMT,
                       ENCUMBERED_FUNDING_AMT, FUNDS_EXPENDED_TO_DATE,
                       ADMIN_AND_OVERHEAD_COST, MATCH_FUNDING, CONTRACT_AMOUNT,
                       LEVERAGED_FUNDS, MATCH_FUNDING_SPLIT
                FROM ${t}.FINANCE_DETAIL WHERE FINANCE_DETAIL_ID = ${fdId}
            `) as Promise<Record<string, unknown>[]>,
            query(`
                SELECT FINANCE_DETAIL_HISTORY_ID, REPORTING_YEAR, REPORTING_QUARTER,
                       COMMITED_FUNDING_AMT, ENCUMBERED_FUNDING_AMT, FUNDS_EXPENDED_TO_DATE,
                       ADMIN_AND_OVERHEAD_COST, MATCH_FUNDING, CONTRACT_AMOUNT,
                       LEVERAGED_FUNDS, MATCH_FUNDING_SPLIT
                FROM ${t}.FINANCE_DETAIL_HISTORY
                WHERE FINANCE_DETAIL_ID = ${fdId}
                ORDER BY REPORTING_YEAR DESC, REPORTING_QUARTER DESC
            `) as Promise<Record<string, unknown>[]>,
        ]);

        const quarters = [
            ...currentRows.map((r) => mapRow(r, 'current')),
            ...historyRows.map((r) => mapRow(r, 'history')),
        ].sort((a, b) =>
            periodKey(b.reportingYear ?? 0, b.reportingQuarter ?? 0) -
            periodKey(a.reportingYear ?? 0, a.reportingQuarter ?? 0),
        );

        return NextResponse.json({ quarters });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('financeQuarters GET error:', message);
        return NextResponse.json({ error: 'Failed to load quarterly records' }, { status: 500 });
    }
}

// POST — add a new quarter

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const authRes = await authorize(id);
        if (!authRes.ok) return authRes.res;
        const { fdId } = authRes;

        if (fdId == null) {
            return NextResponse.json(
                { error: 'This project has no finance record yet. Save the project once before adding quarters.' },
                { status: 409 },
            );
        }

        const body = (await request.json()) as Record<string, unknown>;
        const period = parsePeriod(body);
        if (!period) {
            return NextResponse.json({ error: 'A valid reporting year and quarter (1–4) are required.' }, { status: 400 });
        }

        // No future quarters — an accidental future entry would become the
        // project's current record. (The UI doesn't offer them either.)
        const now = new Date();
        const nowKey = periodKey(now.getFullYear(), Math.floor(now.getMonth() / 3) + 1);
        if (periodKey(period.year, period.quarter) > nowKey) {
            return NextResponse.json(
                { error: `Q${period.quarter} ${period.year} is in the future. Quarters can only be added up to the current calendar quarter.` },
                { status: 400 },
            );
        }
        const vals = parseQuarterValues(body);
        const t = `${DB}.${SCHEMA}`;

        const currentRows = (await query(`
            SELECT * FROM ${t}.FINANCE_DETAIL WHERE FINANCE_DETAIL_ID = ${fdId}
        `)) as Record<string, unknown>[];
        if (currentRows.length === 0) {
            return NextResponse.json({ error: 'Finance record not found' }, { status: 404 });
        }
        const current = currentRows[0];
        const curYear = current.REPORTING_YEAR != null ? Number(current.REPORTING_YEAR) : null;
        const curQuarter = current.REPORTING_QUARTER != null ? Number(current.REPORTING_QUARTER) : null;

        if (curYear === period.year && curQuarter === period.quarter) {
            return NextResponse.json(
                { error: `A record for Q${period.quarter} ${period.year} already exists (current quarter).` },
                { status: 409 },
            );
        }

        const dupRows = (await query(`
            SELECT COUNT(*) AS CNT FROM ${t}.FINANCE_DETAIL_HISTORY
            WHERE FINANCE_DETAIL_ID = ${fdId}
              AND REPORTING_YEAR = ${period.year}
              AND REPORTING_QUARTER = ${period.quarter}
        `)) as { CNT: number }[];
        if (Number(dupRows[0]?.CNT) > 0) {
            return NextResponse.json(
                { error: `A record for Q${period.quarter} ${period.year} already exists.` },
                { status: 409 },
            );
        }

        const hasCurrentPeriod = curYear != null && curQuarter != null;
        const newIsNewer =
            !hasCurrentPeriod ||
            periodKey(period.year, period.quarter) > periodKey(curYear as number, curQuarter as number);

        // Bidder info (NUM_OF_BIDDERS, RANK_OF_SELECTED_BIDDERS,
        // BIDDER_DESCRIPTION) is intentionally NOT copied to history — it never
        // changes per quarter and lives only in FINANCE_DETAIL.
        const historyCols = `
            FINANCE_DETAIL_ID, REPORTING_YEAR, REPORTING_QUARTER,
            COMMITED_FUNDING_AMT, ENCUMBERED_FUNDING_AMT, FUNDS_EXPENDED_TO_DATE,
            ADMIN_AND_OVERHEAD_COST, MATCH_FUNDING, CONTRACT_AMOUNT,
            LEVERAGED_FUNDS, MATCH_FUNDING_SPLIT, CREATE_DATE, MODIFIED_DATE`;

        if (newIsNewer) {

            if (hasCurrentPeriod) {
                await query(`
                    INSERT INTO ${t}.FINANCE_DETAIL_HISTORY (${historyCols})
                    SELECT
                        FINANCE_DETAIL_ID, REPORTING_YEAR, REPORTING_QUARTER,
                        COMMITED_FUNDING_AMT, ENCUMBERED_FUNDING_AMT, FUNDS_EXPENDED_TO_DATE,
                        ADMIN_AND_OVERHEAD_COST, MATCH_FUNDING, CONTRACT_AMOUNT,
                        LEVERAGED_FUNDS, MATCH_FUNDING_SPLIT,
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    FROM ${t}.FINANCE_DETAIL
                    WHERE FINANCE_DETAIL_ID = ${fdId}
                `);
            }

            await query(`
                UPDATE ${t}.FINANCE_DETAIL SET
                    REPORTING_YEAR = ${period.year},
                    REPORTING_QUARTER = ${period.quarter},
                    COMMITED_FUNDING_AMT = ${vals.committedFundingAmt},
                    ENCUMBERED_FUNDING_AMT = ${vals.encumberedFunding},
                    FUNDS_EXPENDED_TO_DATE = ${vals.fundsExpended},
                    ADMIN_AND_OVERHEAD_COST = ${vals.adminAndOverheadCost},
                    MATCH_FUNDING = ${vals.matchFunding},
                    CONTRACT_AMOUNT = ${vals.contractAmount},
                    LEVERAGED_FUNDS = ${vals.leveragedFunds},
                    MATCH_FUNDING_SPLIT = ${vals.matchFundingSplit},
                    MODIFIED_DATE = CURRENT_TIMESTAMP()
                WHERE FINANCE_DETAIL_ID = ${fdId}
            `);
        } else {
            await query(`
                INSERT INTO ${t}.FINANCE_DETAIL_HISTORY (${historyCols})
                VALUES (
                    ${fdId}, ${period.year}, ${period.quarter},
                    ${vals.committedFundingAmt}, ${vals.encumberedFunding}, ${vals.fundsExpended},
                    ${vals.adminAndOverheadCost}, ${vals.matchFunding},
                    ${vals.contractAmount},
                    ${vals.leveragedFunds}, ${vals.matchFundingSplit},
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            `);
        }

        return NextResponse.json({ success: true, becameCurrent: newIsNewer });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('financeQuarters POST error:', message);
        const isValidation = message.includes('exceeds the maximum value');
        return NextResponse.json(
            { error: isValidation ? message : 'Failed to add quarterly record' },
            { status: isValidation ? 400 : 500 },
        );
    }
}


export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const authRes = await authorize(id);
        if (!authRes.ok) return authRes.res;
        const { fdId } = authRes;

        if (fdId == null) {
            return NextResponse.json({ error: 'This project has no finance record.' }, { status: 404 });
        }

        const body = (await request.json()) as Record<string, unknown>;
        const vals = parseQuarterValues(body);
        const t = `${DB}.${SCHEMA}`;

        if (body.target === 'history') {
            const historyId = parseInt(String(body.historyId), 10);
            if (isNaN(historyId)) {
                return NextResponse.json({ error: 'Invalid history record id' }, { status: 400 });
            }
            await query(`
                UPDATE ${t}.FINANCE_DETAIL_HISTORY SET
                    COMMITED_FUNDING_AMT = ${vals.committedFundingAmt},
                    ENCUMBERED_FUNDING_AMT = ${vals.encumberedFunding},
                    FUNDS_EXPENDED_TO_DATE = ${vals.fundsExpended},
                    ADMIN_AND_OVERHEAD_COST = ${vals.adminAndOverheadCost},
                    MATCH_FUNDING = ${vals.matchFunding},
                    CONTRACT_AMOUNT = ${vals.contractAmount},
                    LEVERAGED_FUNDS = ${vals.leveragedFunds},
                    MATCH_FUNDING_SPLIT = ${vals.matchFundingSplit},
                    MODIFIED_DATE = CURRENT_TIMESTAMP()
                WHERE FINANCE_DETAIL_HISTORY_ID = ${historyId}
                  AND FINANCE_DETAIL_ID = ${fdId}
            `);
        } else {
            await query(`
                UPDATE ${t}.FINANCE_DETAIL SET
                    COMMITED_FUNDING_AMT = ${vals.committedFundingAmt},
                    ENCUMBERED_FUNDING_AMT = ${vals.encumberedFunding},
                    FUNDS_EXPENDED_TO_DATE = ${vals.fundsExpended},
                    ADMIN_AND_OVERHEAD_COST = ${vals.adminAndOverheadCost},
                    MATCH_FUNDING = ${vals.matchFunding},
                    CONTRACT_AMOUNT = ${vals.contractAmount},
                    LEVERAGED_FUNDS = ${vals.leveragedFunds},
                    MATCH_FUNDING_SPLIT = ${vals.matchFundingSplit},
                    MODIFIED_DATE = CURRENT_TIMESTAMP()
                WHERE FINANCE_DETAIL_ID = ${fdId}
            `);
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('financeQuarters PUT error:', message);
        const isValidation = message.includes('exceeds the maximum value');
        return NextResponse.json(
            { error: isValidation ? message : 'Failed to update quarterly record' },
            { status: isValidation ? 400 : 500 },
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const authRes = await authorize(id);
        if (!authRes.ok) return authRes.res;
        const { fdId } = authRes;

        if (fdId == null) {
            return NextResponse.json({ error: 'This project has no finance record.' }, { status: 404 });
        }

        const body = (await request.json()) as Record<string, unknown>;
        const t = `${DB}.${SCHEMA}`;

        // ── Delete the CURRENT quarter: restore the newest history row into
        //    FINANCE_DETAIL, then remove that history row. Undo for a quarter
        //    (e.g. a future period) added by mistake. ──
        if (body.target === 'current') {
            const histRows = (await query(`
                SELECT *
                FROM ${t}.FINANCE_DETAIL_HISTORY
                WHERE FINANCE_DETAIL_ID = ${fdId}
                ORDER BY REPORTING_YEAR DESC, REPORTING_QUARTER DESC
                LIMIT 1
            `)) as Record<string, unknown>[];

            if (histRows.length === 0) {
                return NextResponse.json(
                    { error: 'The current quarter cannot be deleted — it is the only quarterly record for this project. Edit its values instead.' },
                    { status: 409 },
                );
            }
            const h = histRows[0];
            const restoreId = Number(h.FINANCE_DETAIL_HISTORY_ID);
            const numOrNull = (v: unknown) => {
                const n = Number(v);
                return v != null && Number.isFinite(n) ? String(n) : 'NULL';
            };

            await query(`
                UPDATE ${t}.FINANCE_DETAIL SET
                    REPORTING_YEAR = ${numOrNull(h.REPORTING_YEAR)},
                    REPORTING_QUARTER = ${numOrNull(h.REPORTING_QUARTER)},
                    COMMITED_FUNDING_AMT = ${numOrNull(h.COMMITED_FUNDING_AMT)},
                    ENCUMBERED_FUNDING_AMT = ${numOrNull(h.ENCUMBERED_FUNDING_AMT)},
                    FUNDS_EXPENDED_TO_DATE = ${numOrNull(h.FUNDS_EXPENDED_TO_DATE)},
                    ADMIN_AND_OVERHEAD_COST = ${numOrNull(h.ADMIN_AND_OVERHEAD_COST)},
                    MATCH_FUNDING = ${numOrNull(h.MATCH_FUNDING)},
                    CONTRACT_AMOUNT = ${numOrNull(h.CONTRACT_AMOUNT)},
                    LEVERAGED_FUNDS = ${numOrNull(h.LEVERAGED_FUNDS)},
                    MATCH_FUNDING_SPLIT = ${numOrNull(h.MATCH_FUNDING_SPLIT)},
                    MODIFIED_DATE = CURRENT_TIMESTAMP()
                WHERE FINANCE_DETAIL_ID = ${fdId}
            `);

            await query(`
                DELETE FROM ${t}.FINANCE_DETAIL_HISTORY
                WHERE FINANCE_DETAIL_HISTORY_ID = ${restoreId}
                  AND FINANCE_DETAIL_ID = ${fdId}
            `);

            return NextResponse.json({
                success: true,
                restored: { reportingYear: Number(h.REPORTING_YEAR), reportingQuarter: Number(h.REPORTING_QUARTER) },
            });
        }

        const historyId = parseInt(String(body.historyId), 10);
        if (isNaN(historyId)) {
            return NextResponse.json({ error: 'A valid historyId (or target: "current") is required.' }, { status: 400 });
        }

        const rows = (await query(`
            SELECT REPORTING_YEAR, REPORTING_QUARTER
            FROM ${t}.FINANCE_DETAIL_HISTORY
            WHERE FINANCE_DETAIL_HISTORY_ID = ${historyId}
              AND FINANCE_DETAIL_ID = ${fdId}
        `)) as { REPORTING_YEAR: number; REPORTING_QUARTER: number }[];

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Quarterly record not found for this project.' }, { status: 404 });
        }

        await query(`
            DELETE FROM ${t}.FINANCE_DETAIL_HISTORY
            WHERE FINANCE_DETAIL_HISTORY_ID = ${historyId}
              AND FINANCE_DETAIL_ID = ${fdId}
        `);

        return NextResponse.json({
            success: true,
            deleted: { reportingYear: Number(rows[0].REPORTING_YEAR), reportingQuarter: Number(rows[0].REPORTING_QUARTER) },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('financeQuarters DELETE error:', message);
        return NextResponse.json({ error: 'Failed to delete quarterly record' }, { status: 500 });
    }
}