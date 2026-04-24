// auth.ts

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import crypto from "crypto"
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { authConfig } from "./auth.config"

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AUTH_COGNITO_REGION ?? "us-west-1",
})

function computeSecretHash(username: string): string {
    return crypto
        .createHmac("sha256", process.env.AUTH_COGNITO_SECRET!)
        .update(username + process.env.AUTH_COGNITO_ID!)
        .digest("base64")
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            id: "cognito-credentials",
            name: "Cognito",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const { email, password } = credentials as {
                    email: string
                    password: string
                }

                try {
                    const authResp = await cognitoClient.send(
                        new InitiateAuthCommand({
                            AuthFlow: "USER_PASSWORD_AUTH",
                            ClientId: process.env.AUTH_COGNITO_ID!,
                            AuthParameters: {
                                USERNAME: email,
                                PASSWORD: password,
                                SECRET_HASH: computeSecretHash(email),
                            },
                        })
                    )

                    if (!authResp.AuthenticationResult?.AccessToken) return null

                    const idToken = authResp.AuthenticationResult.IdToken
                    const payload = JSON.parse(
                        Buffer.from(idToken!.split(".")[1], "base64url").toString()
                    )
                    const groups = payload["cognito:groups"] ?? []

                    const userResp = await cognitoClient.send(
                        new GetUserCommand({
                            AccessToken: authResp.AuthenticationResult.AccessToken,
                        })
                    )

                    const attrs = Object.fromEntries(
                        userResp.UserAttributes?.map((a) => [a.Name, a.Value]) ?? []
                    )

                    return {
                        id: attrs["sub"],
                        email: attrs["email"],
                        name: attrs["name"] ?? attrs["email"],
                        groups,
                        organization: attrs["custom:organization"] ?? null,
                    }
                } catch (err: unknown) {
                    const error = err instanceof Error ? err : new Error(String(err))
                    console.error("Cognito auth error:", error.name, error.message)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, profile }) {
            if (user && "groups" in user) {
                const u = user as typeof user & { groups: string[]; organization: string | null }
                token.groups = u.groups ?? []
                token.organization = u.organization ?? null
            }
            if (profile) {
                token.groups = profile["cognito:groups"] ?? []
                token.organization = profile["custom:organization"] ?? null
            }
            return token
        },
        async session({ session, token }) {
            session.user.groups = (token.groups as string[]) ?? []
            session.user.organization = (token.organization as string | null) ?? null
            return session
        },
    },
})