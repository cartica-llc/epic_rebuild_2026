// app/(dashboard)/dashboard/master/users/config.ts

import {
    CognitoIdentityProviderClient,
    type AttributeType,
} from "@aws-sdk/client-cognito-identity-provider"

const COGNITO_REGION =
    process.env.AUTH_COGNITO_REGION ??
    process.env.COGNITO_REGION ??
    process.env.AW_S_REGION

const AW_S_ACCESS_KEY = process.env.AW_S_ACCESS_KEY_ID
const AW_S_SECRET_KEY = process.env.AW_S_SECRET_ACCESS_KEY

if (!COGNITO_REGION) {
    throw new Error(
        "Missing AUTH_COGNITO_REGION, COGNITO_REGION, or AW_S_REGION environment variable",
    )
}

if (!process.env.COGNITO_USER_POOL_ID) {
    throw new Error("Missing COGNITO_USER_POOL_ID environment variable")
}

export const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID

export const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
    ...(AW_S_ACCESS_KEY && AW_S_SECRET_KEY
        ? { credentials: { accessKeyId: AW_S_ACCESS_KEY, secretAccessKey: AW_S_SECRET_KEY } }
        : {}),
})

export const HAS_CREDENTIALS = Boolean(AW_S_ACCESS_KEY && AW_S_SECRET_KEY)

// ── Types ──

export type ConfirmationStatus =
    | "Confirmed"
    | "Pending Confirmation"
    | "Force Change Password"
    | "Reset Required"
    | "Unknown"

export interface CognitoUser {
    id: string
    name: string
    email: string
    role: string
    organization: string
    confirmationStatus: ConfirmationStatus
    enabled: boolean
}

export interface UserFormData {
    name: string
    email: string
    role: string
    organization: string
}

export interface ActionResult {
    success: boolean
    error?: string
}

// ── Helpers ──

export function getAttribute(
    attributes: AttributeType[] | undefined,
    name: string,
): string {
    return attributes?.find((attr) => attr.Name === name)?.Value ?? ""
}

export function mapUserStatus(status: string | undefined): ConfirmationStatus {
    switch (status) {
        case "CONFIRMED":
            return "Confirmed"
        case "UNCONFIRMED":
            return "Pending Confirmation"
        case "FORCE_CHANGE_PASSWORD":
            return "Force Change Password"
        case "RESET_REQUIRED":
            return "Reset Required"
        default:
            return "Unknown"
    }
}

export const ROLE_TO_GROUP: Record<string, string> = {
    "Master Admin": "MasterAdmin",
    "Program Administrator": "ProgramAdmin",
}