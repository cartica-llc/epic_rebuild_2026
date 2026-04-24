import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            name?: string | null
            email?: string | null
            image?: string | null
            groups: string[]
            organization: string | null
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        groups?: string[]
        organization?: string | null
    }
}