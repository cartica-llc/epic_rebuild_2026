import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import {
    CognitoIdentityProviderClient,
    RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider"

const client = new CognitoIdentityProviderClient({
    region: process.env.AUTH_COGNITO_REGION,
})

const CLIENT_ID = process.env.AUTH_COGNITO_ID!
const CLIENT_SECRET = process.env.AUTH_COGNITO_SECRET

function computeSecretHash(username: string): string | undefined {
    if (!CLIENT_SECRET) return undefined
    return createHmac("sha256", CLIENT_SECRET)
        .update(username + CLIENT_ID)
        .digest("base64")
}

export async function POST(request: Request) {
    try {
        const { email, newPassword, session } = await request.json()

        if (!email || !newPassword || !session) {
            return NextResponse.json(
                { error: "Email, new password, and session are required." },
                { status: 400 },
            )
        }

        const challengeResponses: Record<string, string> = {
            USERNAME: email,
            NEW_PASSWORD: newPassword,
        }

        const secretHash = computeSecretHash(email)
        if (secretHash) {
            challengeResponses.SECRET_HASH = secretHash
        }

        const command = new RespondToAuthChallengeCommand({
            ClientId: CLIENT_ID,
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            ChallengeResponses: challengeResponses,
            Session: session,
        })

        await client.send(command)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Change password error:", error)
        const message =
            error instanceof Error ? error.message : "Failed to change password"
        return NextResponse.json({ error: message }, { status: 400 })
    }
}