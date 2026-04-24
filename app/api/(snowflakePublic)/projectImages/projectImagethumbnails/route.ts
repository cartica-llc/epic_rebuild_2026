//app/api/projectImages/projectImagethumbnails/route.ts

import { NextResponse } from 'next/server';
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '@/lib/s3';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    try {
        await s3Client.send(new HeadObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
        }));

        const url = await getSignedUrl(
            s3Client,
            new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
            { expiresIn: 3600 }
        );

        return NextResponse.json({ url });
    } catch {
        return NextResponse.json({ url: null });
    }
}