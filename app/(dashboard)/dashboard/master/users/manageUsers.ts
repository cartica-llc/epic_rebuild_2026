// app/(dashboard)/dashboard/master/users/manageUsers.ts

"use server"

import {
    AdminCreateUserCommand,
    AdminUpdateUserAttributesCommand,
    AdminDeleteUserCommand,
    AdminAddUserToGroupCommand,
    AdminRemoveUserFromGroupCommand,
    ForgotPasswordCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"

import { revalidatePath } from "next/cache"

import {
    cognitoClient,
    USER_POOL_ID,
    ROLE_TO_GROUP,
} from "./config"

import type { UserFormData, ActionResult } from "./config"

export async function createUser(data: UserFormData): Promise<ActionResult> {
    try {
        await cognitoClient.send(
            new AdminCreateUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: data.email,
                UserAttributes: [
                    { Name: "email", Value: data.email },
                    { Name: "email_verified", Value: "true" },
                    { Name: "name", Value: data.name },
                    { Name: "custom:organization", Value: data.organization },
                ],
                DesiredDeliveryMediums: ["EMAIL"],
            }),
        )

        const groupName = ROLE_TO_GROUP[data.role]
        if (groupName) {
            await cognitoClient.send(
                new AdminAddUserToGroupCommand({
                    UserPoolId: USER_POOL_ID,
                    Username: data.email,
                    GroupName: groupName,
                }),
            )
        }

        revalidatePath("/dashboard/master/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to create user:", error)
        const message =
            error instanceof Error ? error.message : "Failed to create user"
        return { success: false, error: message }
    }
}

export async function updateUser(
    userId: string,
    data: UserFormData,
    previousRole: string,
): Promise<ActionResult> {
    try {
        await cognitoClient.send(
            new AdminUpdateUserAttributesCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId,
                UserAttributes: [
                    { Name: "name", Value: data.name },
                    { Name: "custom:organization", Value: data.organization },
                ],
            }),
        )

        if (data.role !== previousRole) {
            const oldGroup = ROLE_TO_GROUP[previousRole]
            if (oldGroup) {
                await cognitoClient.send(
                    new AdminRemoveUserFromGroupCommand({
                        UserPoolId: USER_POOL_ID,
                        Username: userId,
                        GroupName: oldGroup,
                    }),
                )
            }

            const newGroup = ROLE_TO_GROUP[data.role]
            if (newGroup) {
                await cognitoClient.send(
                    new AdminAddUserToGroupCommand({
                        UserPoolId: USER_POOL_ID,
                        Username: userId,
                        GroupName: newGroup,
                    }),
                )
            }
        }

        revalidatePath("/dashboard/master/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to update user:", error)
        const message =
            error instanceof Error ? error.message : "Failed to update user"
        return { success: false, error: message }
    }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
    try {
        await cognitoClient.send(
            new AdminDeleteUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId,
            }),
        )

        revalidatePath("/dashboard/master/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete user:", error)
        const message =
            error instanceof Error ? error.message : "Failed to delete user"
        return { success: false, error: message }
    }
}

export async function resendTemporaryPassword(
    userId: string,
): Promise<ActionResult> {
    try {
        await cognitoClient.send(
            new AdminCreateUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId,
                MessageAction: "RESEND",
                DesiredDeliveryMediums: ["EMAIL"],
            }),
        )

        revalidatePath("/dashboard/master/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to resend temporary password:", error)
        const message =
            error instanceof Error ? error.message : "Failed to resend temporary password"
        return { success: false, error: message }
    }
}
export async function resetUserPassword(
    userId: string,
): Promise<ActionResult> {
    try {
        const clientId = process.env.AUTH_COGNITO_ID!
        const clientSecret = process.env.AUTH_COGNITO_SECRET

        const authClient = new CognitoIdentityProviderClient({
            region: process.env.AUTH_COGNITO_REGION,
        })

        const params: { ClientId: string; Username: string; SecretHash?: string } = {
            ClientId: clientId,
            Username: userId,
        }

        if (clientSecret) {
            const { createHmac } = await import("crypto")
            params.SecretHash = createHmac("sha256", clientSecret)
                .update(userId + clientId)
                .digest("base64")
        }

        await authClient.send(new ForgotPasswordCommand(params))

        revalidatePath("/dashboard/master/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to reset user password:", error)
        const message =
            error instanceof Error ? error.message : "Failed to reset password"
        return { success: false, error: message }
    }
}