//app/api/(snowflakeUser)/companyCreate/route.ts
//Users can create/add new companies in the Create/edit project forms
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/snowflake';

const DB = process.env.SNOWFLAKE_DATABASE;
const SCHEMA = process.env.SNOWFLAKE_SCHEMA;

function safeStr(v: unknown): string {
    return String(v ?? '').replace(/'/g, "''");
}
function safeFloatOrNull(v: unknown): string {
    if (v === '' || v === null || v === undefined) return 'NULL';
    const n = parseFloat(String(v));
    return Number.isFinite(n) ? String(n) : 'NULL';
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const groups: string[] = (session.user as { groups?: string[] } | undefined)?.groups ?? [];
        if (!groups.includes('ProgramAdmin') && !groups.includes('MasterAdmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const t = `${DB}.${SCHEMA}`;
        const seqBase = `${DB}.${SCHEMA}`;

        if (!body.name?.trim()) {
            return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
        }
        if (!body.shortName?.trim()) {
            return NextResponse.json({ error: 'Short name is required' }, { status: 400 });
        }

        // ── Create ADDRESS row ──
        let addressId: number | null = null;
        const addr = body.address;

        if (addr && addr.address1?.trim()) {
            // Get next ID from sequence first, then use it explicitly in the INSERT
            const addrSeqRows = (await query(
                `SELECT ${seqBase}.ADDRESS_ID_SEQ.NEXTVAL AS ID`
            )) as { ID: number }[];
            addressId = addrSeqRows[0].ID;

            await query(`
                INSERT INTO ${t}.ADDRESS (
                    ADDRESS_ID,
                    ADDRESS1,
                    ADDRESS2,
                    CITY,
                    STATE,
                    ZIP,
                    LONGITUDE_X,
                    LATITUDE_Y,
                    PIMS_ADDRESS_ID,
                    SOURCE_SYSTEM,
                    CREATE_DATE,
                    MODIFIED_DATE,
                    IS_ACTIVE
                ) VALUES (
                    ${addressId},
                    '${safeStr(addr.address1)}',
                    '${safeStr(addr.address2)}',
                    '${safeStr(addr.city)}',
                    '${safeStr(addr.state)}',
                    '${safeStr(addr.zip)}',
                    ${safeFloatOrNull(addr.longitude)},
                    ${safeFloatOrNull(addr.latitude)},
                    NULL,
                    'EPIC',
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP,
                    1
                )
            `);
        }

        // ── Create COMPANY row ──
        const companySeqRows = (await query(
            `SELECT ${seqBase}.COMPANY_ID_SEQ.NEXTVAL AS ID`
        )) as { ID: number }[];
        const companyId = companySeqRows[0].ID;

        await query(`
            INSERT INTO ${t}.COMPANY (
                COMPANY_ID,
                COMPANY_NAME,
                COMPANY_SHORT_NAME,
                COMPANY_EMAIL,
                CREATE_DATE,
                MODIFIED_DATE,
                IS_ACTIVE,
                ADDRESS_ADDRESS_ID,
                PIMS_COMPANY_ID,
                SOURCE_SYSTEM
            ) VALUES (
                ${companyId},
                '${safeStr(body.name)}',
                '${safeStr(body.shortName)}',
                '${safeStr(body.email)}',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                1,
                ${addressId ?? 'NULL'},
                NULL,
                'EPIC'
            )
        `);

        return NextResponse.json({
            success: true,
            company: {
                id: companyId,
                name: body.name.trim(),
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Company POST error:', message);
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }
}