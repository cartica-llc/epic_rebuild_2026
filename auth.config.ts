import Cognito from "next-auth/providers/cognito"
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
    providers: [
        Cognito({
            clientId: process.env.AUTH_COGNITO_ID,
            clientSecret: process.env.AUTH_COGNITO_SECRET,
            issuer: process.env.AUTH_COGNITO_ISSUER,
            authorization: {
                params: { scope: "openid email phone" },
            },
        }),
    ],
    session: { strategy: "jwt" },
}