import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
    region: process.env.AW_S_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AW_S_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AW_S_S3_SECRET_KEY!,
    },
});

export const S3_BUCKET = process.env.AW_S_S3_BUCKET!;