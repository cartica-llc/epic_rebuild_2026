"use client"

import { UserForm } from "../Userform"
import { updateUser, deleteUser, resendTemporaryPassword, resetUserPassword } from "@/app/(dashboard)/dashboard/master/users/manageUsers"
import type { CognitoUser, UserFormData } from "@/app/(dashboard)/dashboard/master/users/config"

interface EditUserClientProps {
    user: CognitoUser
    roles: string[]
    organizations: string[]
}

export function EditUserClient({ user, roles, organizations }: EditUserClientProps) {
    return (
        <UserForm
            mode="edit"
            roles={roles}
            organizations={organizations}
            initialData={user}
            onSubmit={(data: UserFormData) => updateUser(user.id, data, user.role)}
            onDelete={() => deleteUser(user.id)}
            onResend={() => resendTemporaryPassword(user.id)}
            onResetPassword={() => resetUserPassword(user.id)}
        />
    )
}