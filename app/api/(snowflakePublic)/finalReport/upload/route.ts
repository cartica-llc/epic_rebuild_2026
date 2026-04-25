// app/api/finalReport/upload/route.ts

import { NextResponse } from 'next/server';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';
import { query } from '@/lib/snowflake';

const REPORTS_BUCKET = process.env.AW_S_S3_BUCKET_FINAL_REPORTS!;

const reportsS3 = new S3Client({
    region: process.env.AW_S_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AW_S_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AW_S_S3_SECRET_KEY!,
    },
});

// New-style key: "epc-001/epc-001-final-report.pdf"
function buildReportKey(projectNumber: string): string {
    const pn = projectNumber.toLowerCase();
    return `${pn}/${pn}-final-report.pdf`;
}

function escSql(val: string): string {
    return val.replace(/'/g, "''");
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectNumber, fileData } = body as {
            projectNumber: string;
            fileData: string; // data-URL: "data:application/pdf;base64,..."
        };

        if (!projectNumber || !fileData) {
            return NextResponse.json(
                { error: 'projectNumber and fileData are required' },
                { status: 400 }
            );
        }

        // Look up PROJECT_DETAIL_ID via projectNumber
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

        // Upload PDF to S3
        const base64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        const buffer = Buffer.from(base64, 'base64');
        const key = buildReportKey(projectNumber);

        await reportsS3.send(
            new PutObjectCommand({
                Bucket: REPORTS_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: 'application/pdf',
            })
        );

        // Update PROJECT_DETAIL
        const escapedKey = escSql(key);

        await query(`
            UPDATE PROJECT_DETAIL
            SET FINAL_REPORT_URL              = '${escapedKey}',
                FINAL_REPORT_URL_LAST_UPDATED = CURRENT_TIMESTAMP,
                MODIFIED_DATE                 = CURRENT_TIMESTAMP
            WHERE PROJECT_DETAIL_ID = ${projectDetailId}
        `);

        const signedUrl = await getSignedUrl(
            reportsS3,
            new GetObjectCommand({ Bucket: REPORTS_BUCKET, Key: key }),
            { expiresIn: 3600 }
        );

        return NextResponse.json({ key, url: signedUrl });
    } catch (err) {
        console.error('[finalReport/upload]', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}