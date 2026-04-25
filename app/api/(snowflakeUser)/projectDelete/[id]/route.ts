// app/api/(snowflakeUser)/projectDelete/[id]/route.ts
//
// Two-phase project deletion.
//
// GET    — Preview / safe-check. Counts rows in every table that WOULD be
//          deleted, and probes S3 for the image folder + final report key.
//          Never mutates anything. The UI calls this first, shows the user
//          a summary, and only enables the confirm button once the preview
//          returns cleanly.
//
// DELETE — Execute the delete inside a Snowflake transaction. All DB
//          deletes succeed together or roll back together. S3 cleanup
//          happens AFTER the DB commit — S3 has no transactions, so if S3
//          fails mid-way the DB is still clean and the S3 remnants can be
//          cleaned up out-of-band. The reverse (S3 gone, DB half-deleted)
//          would be much worse, which is why the order is DB-first.


import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
    ListObjectsV2Command,
    DeleteObjectsCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { query } from '@/lib/snowflake';
import { s3Client, S3_BUCKET } from '@/lib/s3';
import { canEditProject, isMasterAdmin } from '@/lib/permissions';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;
const REPORTS_BUCKET = 'epic-final-reports';

const reportsS3 = new S3Client({
    region: process.env.AW_S_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AW_S_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AW_S_S3_SECRET_KEY!,
    },
});

// ─── Types ───────────────────────────────────────────────────────────

interface ProjectRefs {
    PROJECT_ID: number;
    PROJECT_NUMBER: string | null;
    PROGRAM_ADMIN_ID: number | null;
    PROJECT_DETAIL_ID: number | null;
    FINANCE_DETAIL_ID: number | null;
    PROJECT_METRIC_ID: number | null;
    FINAL_REPORT_URL: string | null;
}

interface TableCount {
    table: string;
    keyedBy: string;
    count: number;
}

interface S3Probe {
    ok: boolean;
    count: number;
    note?: string;
}

interface Manifest {
    project: {
        id: number;
        number: string | null;
        detailId: number | null;
        financeId: number | null;
        metricId: number | null;
    };
    tables: TableCount[];
    images: S3Probe;
    finalReport: S3Probe & { key: string | null; isLegacy: boolean };
    warnings: string[];
    totalRows: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function isNewStyleKey(key: string): boolean {
    return key.includes('/');
}

/**
 * Pull the COUNT value out of a Snowflake result row. The driver returns
 * column names in the case they were aliased, but it's safer to grab the
 * first numeric-looking value rather than hardcode the key — Snowflake can
 * return NUMBER(38,0) as a string for very large values, so we coerce
 * explicitly and check for NaN instead of relying on `Number()` alone.
 */
function extractCount(row: unknown): number {
    if (!row || typeof row !== 'object') return 0;
    const vals = Object.values(row as Record<string, unknown>);
    for (const v of vals) {
        if (v === null || v === undefined) continue;
        const n = typeof v === 'number' ? v : parseInt(String(v), 10);
        if (!Number.isNaN(n)) return n;
    }
    return 0;
}

/** Look up the project plus all its child-table FKs. Returns null if not found. */
async function loadProjectRefs(projectId: number): Promise<ProjectRefs | null> {
    const rows = (await query(`
        SELECT
            p.PROJECT_ID,
            p.PROJECT_NUMBER,
            p.PROGRAM_ADMIN_PROGRAM_ADMIN_ID   AS PROGRAM_ADMIN_ID,
            p.PROJECT_DETAIL_PROJECT_DETAIL_ID AS PROJECT_DETAIL_ID,
            p.FINANCE_DETAIL_FINANCE_DETAIL_ID AS FINANCE_DETAIL_ID,
            p.PROJECT_METRIC_PROJECT_METRIC_ID AS PROJECT_METRIC_ID,
            pd.FINAL_REPORT_URL
        FROM ${DB}.${SCHEMA}.PROJECT p
        LEFT JOIN ${DB}.${SCHEMA}.PROJECT_DETAIL pd
          ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
        WHERE p.PROJECT_ID = ${projectId}
    `)) as ProjectRefs[];

    return rows.length ? rows[0] : null;
}

/**
 * Run COUNT(*) against every table that could hold rows for this project,
 * keyed appropriately. Returns one entry per table — count 0 is normal and
 * expected (not every project has every kind of related row).
 *
 * A table that errors (e.g. doesn't exist, column mismatch) shows up as
 * count -1 with a warning, so the preview doesn't silently lie about
 * coverage. The caller should inspect `warnings` before enabling delete.
 */
async function countAllRelated(refs: ProjectRefs): Promise<{ tables: TableCount[]; warnings: string[] }> {
    const warnings: string[] = [];

    // Each entry is [tableName, keyColumn, keyValue-or-null-to-skip]
    // Key columns verified against live DESC TABLE output.
    const plan: [string, string, number | null][] = [
        // Keyed by PROJECT_ID
        ['PROJECT_HAS_CPUC_PROCEEDING',                 'PROJECT_PROJECT_ID',                refs.PROJECT_ID],
        ['PROJECT_HAS_INVESTMENT_AREA',                 'PROJECT_PROJECT_ID',                refs.PROJECT_ID],
        ['PROJECT_HAS_DEVELOPMENT_STAGE',               'PROJECT_PROJECT_ID',                refs.PROJECT_ID],

        // Keyed by PROJECT_DETAIL_ID
        ['PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION',  'PROJECT_DETAIL_PROJECT_DETAIL_ID',  refs.PROJECT_DETAIL_ID],
        ['PROJECT_DETAIL_HAS_PARTNER',                  'PROJECT_DETAIL_PROJECT_DETAIL_ID',  refs.PROJECT_DETAIL_ID],
        ['PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA',     'PROJECT_DETAIL_PROJECT_DETAIL_ID',  refs.PROJECT_DETAIL_ID],

        // Keyed by FINANCE_DETAIL_ID
        ['FINANCE_DETAIL_HAS_FUNDING_MECHANISM',        'FINANCE_DETAIL_FINANCE_DETAIL_ID',  refs.FINANCE_DETAIL_ID],
        ['FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER',    'FINANCE_DETAIL_FINANCE_DETAIL_ID',  refs.FINANCE_DETAIL_ID],

        // Keyed by PROJECT_METRIC_ID
        ['PROJECT_METRIC_HAS_CIC',                      'PROJECT_METRIC_PROJECT_METRIC_ID',  refs.PROJECT_METRIC_ID],

        // Parent tables (always 1 row if the ID exists, counted for transparency)
        ['PROJECT',         'PROJECT_ID',          refs.PROJECT_ID],
        ['PROJECT_DETAIL',  'PROJECT_DETAIL_ID',   refs.PROJECT_DETAIL_ID],
        ['FINANCE_DETAIL',  'FINANCE_DETAIL_ID',   refs.FINANCE_DETAIL_ID],
        ['PROJECT_METRIC',  'PROJECT_METRIC_ID',   refs.PROJECT_METRIC_ID],
    ];

    // Run counts in parallel — they're independent
    const results = await Promise.all(
        plan.map(async ([table, keyCol, keyVal]) => {
            if (keyVal === null) {
                return { table, keyedBy: keyCol, count: 0 };
            }
            try {
                const rows = (await query(
                    `SELECT COUNT(*) AS CNT FROM ${DB}.${SCHEMA}.${table} WHERE ${keyCol} = ${keyVal}`
                )) as unknown[];
                return { table, keyedBy: keyCol, count: extractCount(rows[0]) };
            } catch (err) {
                warnings.push(`Could not count ${table}: ${err instanceof Error ? err.message : String(err)}`);
                return { table, keyedBy: keyCol, count: -1 };
            }
        })
    );

    return { tables: results, warnings };
}

/** Probe the S3 image folder — returns count of objects found (or error). */
async function probeImages(projectNumber: string | null): Promise<S3Probe> {
    if (!projectNumber) {
        return { ok: true, count: 0, note: 'No project number — skipping image probe' };
    }
    try {
        const prefix = `${projectNumber.toLowerCase()}/`;
        let count = 0;
        let continuationToken: string | undefined;
        do {
            const list = await s3Client.send(new ListObjectsV2Command({
                Bucket: S3_BUCKET,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            }));
            count += (list.Contents ?? []).length;
            continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
        } while (continuationToken);
        return { ok: true, count };
    } catch (err) {
        return { ok: false, count: 0, note: err instanceof Error ? err.message : String(err) };
    }
}

/**
 * Probe the final report. Three shapes of result:
 *   • No key stored            → ok, count 0, note
 *   • Legacy key (no "/")      → ok, count 0, note, isLegacy true (won't touch S3)
 *   • New-style key            → HeadObject to check existence + list sibling files
 */
async function probeFinalReport(reportKey: string | null): Promise<S3Probe & { key: string | null; isLegacy: boolean }> {
    if (!reportKey) {
        return { ok: true, count: 0, key: null, isLegacy: false, note: 'No final report stored' };
    }
    if (!isNewStyleKey(reportKey)) {
        return {
            ok: true,
            count: 0,
            key: reportKey,
            isLegacy: true,
            note: 'Legacy flat filename — S3 object will be left in place',
        };
    }

    try {
        // Count objects in the report's folder (includes the main report + any siblings)
        const prefix = reportKey.substring(0, reportKey.lastIndexOf('/') + 1);
        let count = 0;
        let continuationToken: string | undefined;
        do {
            const list = await reportsS3.send(new ListObjectsV2Command({
                Bucket: REPORTS_BUCKET,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            }));
            count += (list.Contents ?? []).length;
            continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
        } while (continuationToken);

        return { ok: true, count, key: reportKey, isLegacy: false };
    } catch (err) {
        return {
            ok: false,
            count: 0,
            key: reportKey,
            isLegacy: false,
            note: err instanceof Error ? err.message : String(err),
        };
    }
}

/** Build the full preview manifest. Pure read-only. */
async function buildManifest(refs: ProjectRefs): Promise<Manifest> {
    const [countResult, imageProbe, reportProbe] = await Promise.all([
        countAllRelated(refs),
        probeImages(refs.PROJECT_NUMBER),
        probeFinalReport(refs.FINAL_REPORT_URL),
    ]);

    // Sum only successful counts (skip -1 error sentinels)
    const totalRows = countResult.tables
        .filter((t) => t.count >= 0)
        .reduce((sum, t) => sum + t.count, 0);

    const warnings = [...countResult.warnings];
    if (!imageProbe.ok) warnings.push(`S3 image probe failed: ${imageProbe.note}`);
    if (!reportProbe.ok) warnings.push(`S3 final report probe failed: ${reportProbe.note}`);

    return {
        project: {
            id: refs.PROJECT_ID,
            number: refs.PROJECT_NUMBER,
            detailId: refs.PROJECT_DETAIL_ID,
            financeId: refs.FINANCE_DETAIL_ID,
            metricId: refs.PROJECT_METRIC_ID,
        },
        tables: countResult.tables,
        images: imageProbe,
        finalReport: reportProbe,
        warnings,
        totalRows,
    };
}

/** Authorization gate shared by GET and DELETE. */
async function authorize(
    groups: string[],
    userOrg: string | null,
    refs: ProjectRefs,
): Promise<NextResponse | null> {
    if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!isMasterAdmin(groups)) {
        if (!canEditProject(userOrg, refs.PROGRAM_ADMIN_ID)) {
            return NextResponse.json(
                { error: 'Forbidden: you do not have permission to delete this project' },
                { status: 403 },
            );
        }
    }
    return null;
}

// ─── GET — preview / safe-check ──────────────────────────────────────

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const projectId = parseInt(id, 10);
        if (isNaN(projectId)) {
            return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
        }

        const refs = await loadProjectRefs(projectId);
        if (!refs) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];
        const userOrg = (session.user as { organization?: string | null }).organization ?? null;
        const authError = await authorize(groups, userOrg, refs);
        if (authError) return authError;

        const manifest = await buildManifest(refs);
        return NextResponse.json(manifest);
    } catch (err) {
        console.error('[projectDelete] preview', err);
        return NextResponse.json(
            { error: 'Preview failed', detail: err instanceof Error ? err.message : String(err) },
            { status: 500 },
        );
    }
}

// ─── DELETE — transactional execution ────────────────────────────────

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const projectId = parseInt(id, 10);
        if (isNaN(projectId)) {
            return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
        }

        const refs = await loadProjectRefs(projectId);
        if (!refs) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const groups: string[] = (session.user as { groups?: string[] }).groups ?? [];
        const userOrg = (session.user as { organization?: string | null }).organization ?? null;
        const authError = await authorize(groups, userOrg, refs);
        if (authError) return authError;

        // Re-run the preview immediately before deleting. If any count came
        // back as -1 (error), we refuse — we don't want to delete rows in a
        // table we couldn't even read. Empty counts are fine.
        const preflight = await buildManifest(refs);
        const erroredTables = preflight.tables.filter((t) => t.count < 0);
        if (erroredTables.length > 0) {
            return NextResponse.json(
                {
                    error: 'Pre-flight check failed — refusing to delete',
                    erroredTables: erroredTables.map((t) => t.table),
                    warnings: preflight.warnings,
                },
                { status: 500 },
            );
        }

        // ── DB phase — single transaction ────────────────────────────
        // We use the snowflake-sdk's sequential-execute guarantee: all
        // statements run on the same cached connection in order. Any failure
        // triggers ROLLBACK and we return an error; the caller knows nothing
        // was deleted.
        const deletesExecuted: string[] = [];
        try {
            await query('BEGIN');

            // 1. Junctions keyed by PROJECT_ID
            await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_HAS_CPUC_PROCEEDING WHERE PROJECT_PROJECT_ID = ${projectId}`);
            deletesExecuted.push('PROJECT_HAS_CPUC_PROCEEDING');
            await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_HAS_INVESTMENT_AREA WHERE PROJECT_PROJECT_ID = ${projectId}`);
            deletesExecuted.push('PROJECT_HAS_INVESTMENT_AREA');
            await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_HAS_DEVELOPMENT_STAGE WHERE PROJECT_PROJECT_ID = ${projectId}`);
            deletesExecuted.push('PROJECT_HAS_DEVELOPMENT_STAGE');

            // 2. Junctions keyed by PROJECT_DETAIL_ID
            if (refs.PROJECT_DETAIL_ID !== null) {
                const d = refs.PROJECT_DETAIL_ID;
                await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION WHERE PROJECT_DETAIL_PROJECT_DETAIL_ID = ${d}`);
                deletesExecuted.push('PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION');
                await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_DETAIL_HAS_PARTNER WHERE PROJECT_DETAIL_PROJECT_DETAIL_ID = ${d}`);
                deletesExecuted.push('PROJECT_DETAIL_HAS_PARTNER');
                await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA WHERE PROJECT_DETAIL_PROJECT_DETAIL_ID = ${d}`);
                deletesExecuted.push('PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA');
            }

            // 3. Junctions keyed by FINANCE_DETAIL_ID
            if (refs.FINANCE_DETAIL_ID !== null) {
                const f = refs.FINANCE_DETAIL_ID;
                await query(`DELETE FROM ${DB}.${SCHEMA}.FINANCE_DETAIL_HAS_FUNDING_MECHANISM WHERE FINANCE_DETAIL_FINANCE_DETAIL_ID = ${f}`);
                deletesExecuted.push('FINANCE_DETAIL_HAS_FUNDING_MECHANISM');
                await query(`DELETE FROM ${DB}.${SCHEMA}.FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER WHERE FINANCE_DETAIL_FINANCE_DETAIL_ID = ${f}`);
                deletesExecuted.push('FINANCE_DETAIL_HAS_MATCH_FUNDING_PARTNER');
            }

            // 4. Junctions keyed by PROJECT_METRIC_ID
            if (refs.PROJECT_METRIC_ID !== null) {
                await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_METRIC_HAS_CIC WHERE PROJECT_METRIC_PROJECT_METRIC_ID = ${refs.PROJECT_METRIC_ID}`);
                deletesExecuted.push('PROJECT_METRIC_HAS_CIC');
            }

            // 5. PROJECT row (holds references to detail/finance/metric)
            await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT WHERE PROJECT_ID = ${projectId}`);
            deletesExecuted.push('PROJECT');

            // 6. Orphaned parent rows
            if (refs.PROJECT_DETAIL_ID !== null) {
                await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_DETAIL WHERE PROJECT_DETAIL_ID = ${refs.PROJECT_DETAIL_ID}`);
                deletesExecuted.push('PROJECT_DETAIL');
            }
            if (refs.FINANCE_DETAIL_ID !== null) {
                await query(`DELETE FROM ${DB}.${SCHEMA}.FINANCE_DETAIL WHERE FINANCE_DETAIL_ID = ${refs.FINANCE_DETAIL_ID}`);
                deletesExecuted.push('FINANCE_DETAIL');
            }
            if (refs.PROJECT_METRIC_ID !== null) {
                await query(`DELETE FROM ${DB}.${SCHEMA}.PROJECT_METRIC WHERE PROJECT_METRIC_ID = ${refs.PROJECT_METRIC_ID}`);
                deletesExecuted.push('PROJECT_METRIC');
            }

            await query('COMMIT');
        } catch (dbErr) {
            // Any failure anywhere in the transaction — roll back and bail.
            try {
                await query('ROLLBACK');
            } catch (rbErr) {
                console.error('[projectDelete] ROLLBACK failed:', rbErr);
            }
            console.error('[projectDelete] DB phase failed:', dbErr);
            return NextResponse.json(
                {
                    error: 'Delete failed — database changes rolled back, nothing was removed',
                    detail: dbErr instanceof Error ? dbErr.message : String(dbErr),
                    deletesAttempted: deletesExecuted,
                },
                { status: 500 },
            );
        }

        // ── S3 phase — best-effort, DB is already gone ───────────────
        // We still try to clean everything up, but report partial failures
        // to the caller so they can be surfaced / retried manually.
        const s3Errors: string[] = [];
        let imagesDeleted = 0;
        let reportDeleted = false;

        // Images
        if (refs.PROJECT_NUMBER) {
            try {
                const prefix = `${refs.PROJECT_NUMBER.toLowerCase()}/`;
                imagesDeleted = await deleteS3Folder(s3Client, S3_BUCKET, prefix);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                s3Errors.push(`Image cleanup: ${msg}`);
                console.warn('[projectDelete] S3 images cleanup failed:', msg);
            }
        }

        // Final report (new-style keys only)
        if (refs.FINAL_REPORT_URL && isNewStyleKey(refs.FINAL_REPORT_URL)) {
            try {
                const reportKey = refs.FINAL_REPORT_URL;
                const reportPrefix = reportKey.substring(0, reportKey.lastIndexOf('/') + 1);

                try {
                    await reportsS3.send(new HeadObjectCommand({ Bucket: REPORTS_BUCKET, Key: reportKey }));
                    await reportsS3.send(new DeleteObjectCommand({ Bucket: REPORTS_BUCKET, Key: reportKey }));
                    reportDeleted = true;
                } catch {
                    // already gone — move on to folder cleanup
                }

                if (reportPrefix) {
                    await deleteS3Folder(reportsS3, REPORTS_BUCKET, reportPrefix);
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                s3Errors.push(`Final report cleanup: ${msg}`);
                console.warn('[projectDelete] Final report cleanup failed:', msg);
            }
        }

        return NextResponse.json({
            success: true,
            projectId,
            projectNumber: refs.PROJECT_NUMBER,
            tablesDeleted: deletesExecuted,
            imagesDeleted,
            reportDeleted,
            s3Errors, // empty array on clean success
        });
    } catch (err) {
        console.error('[projectDelete]', err);
        return NextResponse.json(
            { error: 'Failed to delete project', detail: err instanceof Error ? err.message : String(err) },
            { status: 500 },
        );
    }
}

// ─── Shared S3 folder-delete helper ──────────────────────────────────

async function deleteS3Folder(client: S3Client, bucket: string, prefix: string): Promise<number> {
    let deleted = 0;
    let continuationToken: string | undefined;

    do {
        const list = await client.send(new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: continuationToken,
        }));

        const objects = (list.Contents ?? [])
            .map((o) => o.Key)
            .filter((k): k is string => !!k)
            .map((Key) => ({ Key }));

        if (objects.length > 0) {
            await client.send(new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: { Objects: objects, Quiet: true },
            }));
            deleted += objects.length;
        }

        continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (continuationToken);

    return deleted;
}