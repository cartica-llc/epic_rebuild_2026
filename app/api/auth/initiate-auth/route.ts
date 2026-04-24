import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
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
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required." },
                { status: 400 },
            )
        }

        const authParams: Record<string, string> = {
            USERNAME: email,
            PASSWORD: password,
        }

        const secretHash = computeSecretHash(email)
        if (secretHash) {
            authParams.SECRET_HASH = secretHash
        }

        const command = new InitiateAuthCommand({
            ClientId: CLIENT_ID,
            AuthFlow: "USER_PASSWORD_AUTH",
            AuthParameters: authParams,
        })

        const response = await client.send(command)

        if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
            return NextResponse.json({
                challenge: "NEW_PASSWORD_REQUIRED",
                session: response.Session,
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Initiate auth error:", error)
        const message =
            error instanceof Error ? error.message : "Authentication failed"
        return NextResponse.json({ error: message }, { status: 401 })
    }
}