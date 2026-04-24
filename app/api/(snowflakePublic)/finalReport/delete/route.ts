// app/api/finalReport/delete/route.ts

import { NextResponse } from 'next/server';
import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { query } from '@/lib/snowflake';

const REPORTS_BUCKET = process.env.AWS_S3_BUCKET_FINAL_REPORTS!;

const reportsS3 = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
    },
});

// New-style keys contain "/" e.g. "epc-001/epc-001-final-report.pdf"
// Legacy keys are flat filenames e.g. "SomeOldReport.pdf"
function isNewStyleKey(key: string): boolean {
    return key.includes('/');
}

function escSql(val: string): string {
    return val.replace(/'/g, "''");
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { projectNumber, key } = body as {
            projectNumber: string;
            key: string;
        };

        if (!projectNumber || !key) {
            return NextResponse.json(
                { error: 'projectNumber and key are required' },
                { status: 400 }
            );
        }


        const pn = escSql(projectNumber.toUpperCase());

        const lookupRows = await query(`
            SELECT pd.PROJECT_DETAIL_ID
            FROM PROJECT p
            JOIN PROJECT_DETAIL pd
              ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
            WHERE UPPER(p.PROJECT_NUMBER) = '${pn}'
            LIMIT 1
        `) as { PROJECT_DETAIL_ID: number }[];

        if (!lookupRows.length) {
            return NextResponse.json(
                { error: `No project found for project number: ${projectNumber}` },
                { status: 404 }
            );
        }

        const projectDetailId = lookupRows[0].PROJECT_DETAIL_ID;

        if (isNewStyleKey(key)) {
            try {
                await reportsS3.send(
                    new HeadObjectCommand({ Bucket: REPORTS_BUCKET, Key: key })
                );
                await reportsS3.send(
                    new DeleteObjectCommand({ Bucket: REPORTS_BUCKET, Key: key })
                );
            } catch {
                console.warn(`[finalReport/delete] Object not found in S3, clearing DB only: ${key}`);
            }
        }

        await query(`
            UPDATE PROJECT_DETAIL
            SET FINAL_REPORT_URL              = NULL,
                FINAL_REPORT_URL_LAST_UPDATED = CURRENT_TIMESTAMP,
                MODIFIED_DATE                 = CURRENT_TIMESTAMP
            WHERE PROJECT_DETAIL_ID = ${projectDetailId}
        `);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[finalReport/delete]', err);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}