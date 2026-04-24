import { NextResponse } from "next/server"
import {
    CognitoIdentityProviderClient,
    ConfirmForgotPasswordCommand,
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
    const { email, code, newPassword } = await req.json()

    try {
        await client.send(
            new ConfirmForgotPasswordCommand({
                ClientId: process.env.AUTH_COGNITO_ID!,
                Username: email,
                ConfirmationCode: code,
                Password: newPassword,
                SecretHash: computeSecretHash(email),
            })
        )
        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error("ConfirmForgotPassword error:", err.name, err.message)
        return NextResponse.json(
            { error: "Invalid code or password doesn't meet requirements." },
            { status: 400 }
        )
    }
}