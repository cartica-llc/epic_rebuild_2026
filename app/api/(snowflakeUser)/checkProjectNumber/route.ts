//app/api/(snowflakeUser)/checkProjectNumber/route.ts


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const projectNumber = searchParams.get('projectNumber')?.trim().toUpperCase();
    const excludeId = searchParams.get('excludeId');

    if (!projectNumber) {
        return NextResponse.json({ error: 'projectNumber is required' }, { status: 400 });
    }

    try {
        let sql = `SELECT COUNT(*) AS CNT FROM ${DB}.${SCHEMA}.PROJECT WHERE UPPER(PROJECT_NUMBER) = '${projectNumber.replace(/'/g, "''")}'`;

        if (excludeId) {
            const id = parseInt(String(excludeId), 10);
            if (!isNaN(id)) {
                sql += ` AND PROJECT_ID != ${id}`;
            }
        }

        const rows = (await query(sql)) as { CNT: number }[];
        const exists = (rows[0]?.CNT ?? 0) > 0;

        return NextResponse.json({ exists });
    } catch (err) {
        console.error('checkProjectNumber error:', err);
        return NextResponse.json({ error: 'Failed to check project number' }, { status: 500 });
    }
}