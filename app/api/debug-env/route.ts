// app/api/debug-env/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    return NextResponse.json({
        AUTH_URL: process.env.AUTH_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasCognitoId: !!process.env.AUTH_COGNITO_ID,
        hasCognitoSecret: !!process.env.AUTH_COGNITO_SECRET,
        AUTH_COGNITO_ISSUER: process.env.AUTH_COGNITO_ISSUER,
        AUTH_COGNITO_REGION: process.env.AUTH_COGNITO_REGION,
    });
}