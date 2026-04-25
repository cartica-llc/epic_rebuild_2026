// app/api/(snowflakePublic)/finalReport/url/route.ts


import { NextResponse } from 'next/server';
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';

const REPORTS_BUCKET = process.env.AW_S_S3_BUCKET_FINAL_REPORTS!;

const reportsS3 = new S3Client({
    region: process.env.AW_S_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AW_S_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AW_S_S3_SECRET_KEY!,
    },
});

function normalizeKey(key: string): string {
    return key.toLowerCase().endsWith('.pdf') ? key : `${key}.pdf`;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawKey = searchParams.get('key');

    if (!rawKey) {
        return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const key = normalizeKey(rawKey);

    try {
        await reportsS3.send(
            new HeadObjectCommand({ Bucket: REPORTS_BUCKET, Key: key })
        );

        const url = await getSignedUrl(
            reportsS3,
            new GetObjectCommand({ Bucket: REPORTS_BUCKET, Key: key }),
            { expiresIn: 3600 }
        );

        return NextResponse.json({ url, key });
    } catch {
        return NextResponse.json({ url: null, key });
    }
}