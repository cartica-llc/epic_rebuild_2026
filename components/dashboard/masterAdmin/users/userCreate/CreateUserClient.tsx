"use client"

import { UserForm } from "../Userform"
import { createUser } from "@/app/(dashboard)/dashboard/master/users/manageUsers"
import type { UserFormData } from "@/app/(dashboard)/dashboard/master/users/config"

interface CreateUserClientProps {
    roles: string[]
    organizations: string[]
}

export function CreateUserClient({ roles, organizations }: CreateUserClientProps) {
    async function handleSubmit(data: UserFormData) {
        return createUser(data)
    }

    return (
        <UserForm
            mode="create"
            roles={roles}
            organizations={organizations}
            onSubmit={handleSubmit}
        />
    )
}