// app/(dashboard)/dashboard/master/users/getUsers.ts

"use server"

import {
    ListUsersCommand,
    AdminListGroupsForUserCommand,
    AdminGetUserCommand,
    ListGroupsCommand,
} from "@aws-sdk/client-cognito-identity-provider"

import {
    cognitoClient,
    USER_POOL_ID,
    HAS_CREDENTIALS,
    getAttribute,
    mapUserStatus,
} from "./config"

import type { CognitoUser } from "./config"

export async function fetchUsers(): Promise<CognitoUser[]> {
    if (!HAS_CREDENTIALS) {
        console.warn("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required to fetch Cognito users")
        return []
    }

    try {
        const users: CognitoUser[] = []
        let paginationToken: string | undefined

        do {
            const response = await cognitoClient.send(
                new ListUsersCommand({
                    UserPoolId: USER_POOL_ID,
                    Limit: 60,
                    PaginationToken: paginationToken,
                }),
            )

            for (const cognitoUser of response.Users ?? []) {
                const attrs = cognitoUser.Attributes

                const groupsResponse = await cognitoClient.send(
                    new AdminListGroupsForUserCommand({
                        UserPoolId: USER_POOL_ID,
                        Username: cognitoUser.Username!,
                    }),
                )
                const groups =
                    groupsResponse.Groups?.map((g) => g.GroupName ?? "") ?? []

                const role = groups.includes("MasterAdmin")
                    ? "Master Admin"
                    : "Program Administrator"

                users.push({
                    id: cognitoUser.Username ?? "",
                    name:
                        (getAttribute(attrs, "name") ||
                            `${getAttribute(attrs, "given_name")} ${getAttribute(attrs, "family_name")}`.trim() ||
                            cognitoUser.Username) ?? "",
                    email: getAttribute(attrs, "email"),
                    role,
                    organization: getAttribute(attrs, "custom:organization"),
                    confirmationStatus: mapUserStatus(cognitoUser.UserStatus),
                    enabled: cognitoUser.Enabled ?? true,
                })
            }

            paginationToken = response.PaginationToken
        } while (paginationToken)

        return users
    } catch (error) {
        console.error("Failed to fetch Cognito users:", error)
        return []
    }
}

export async function fetchUser(userId: string): Promise<CognitoUser | null> {
    try {
        const response = await cognitoClient.send(
            new AdminGetUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId,
            }),
        )
        const attrs = response.UserAttributes

        const groupsResponse = await cognitoClient.send(
            new AdminListGroupsForUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId,
            }),
        )
        const groups =
            groupsResponse.Groups?.map((g) => g.GroupName ?? "") ?? []

        const role = groups.includes("MasterAdmin")
            ? "Master Admin"
            : "Program Administrator"

        return {
            id: response.Username ?? "",
            name:
                (getAttribute(attrs, "name") ||
                    `${getAttribute(attrs, "given_name")} ${getAttribute(attrs, "family_name")}`.trim() ||
                    response.Username) ?? "",
            email: getAttribute(attrs, "email"),
            role,
            organization: getAttribute(attrs, "custom:organization"),
            confirmationStatus: mapUserStatus(response.UserStatus),
            enabled: response.Enabled ?? true,
        }
    } catch (error) {
        console.error("Failed to fetch user:", error)
        return null
    }
}

export async function fetchRoles(): Promise<string[]> {
    return ["Program Administrator", "Master Admin"]
}

export async function fetchOrganizations(): Promise<string[]> {
    return ["EPC", "SCE", "SDGE", "PGE", "Master"]
}

export async function fetchGroups(): Promise<string[]> {
    try {
        const response = await cognitoClient.send(
            new ListGroupsCommand({ UserPoolId: USER_POOL_ID }),
        )
        return response.Groups?.map((g) => g.GroupName ?? "").filter(Boolean) ?? []
    } catch (error) {
        console.error("Failed to fetch Cognito groups:", error)
        return []
    }
}