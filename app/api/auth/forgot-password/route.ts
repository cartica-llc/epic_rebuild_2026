import { NextResponse } from "next/server"
import {
    CognitoIdentityProviderClient,
    ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import crypto from "crypto"

const client = new CognitoIdentityProviderClient({
    region: process.env.AUTH_COGNITO_REGION ?? "us-west-1",
})

function computeSecretHash(username: string): string {
    return crypto
        .createHmac("sha256", process.env.AUTH_COGNITO_SECRET!)
        .update(username + process.env.AUTH_COGNITO_ID!)
        .digest("base64")
}

export async function POST(req: Request) {
    const { email } = await req.json()

    try {
        await client.send(
            new ForgotPasswordCommand({
                ClientId: process.env.AUTH_COGNITO_ID!,
                Username: email,
                SecretHash: computeSecretHash(email),
            })
        )
        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error("ForgotPassword error:", err.name, err.message)
        return NextResponse.json(
            { error: "Unable to process request. Please try again." },
            { status: 400 }
        )
    }
}