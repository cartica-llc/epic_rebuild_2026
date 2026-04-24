import { auth } from "@/auth"
import { redirect } from "next/navigation"
import {
    fetchUsers,
    fetchRoles,
    fetchOrganizations,
} from "./getUsers"
import { UsersPageClient } from "@/components/dashboard/masterAdmin/users/userTable/UsersPageClient"

export default async function MasterUsersPage() {
    const session = await auth()
    if (!session?.user) redirect("/")

    const groups = session.user.groups ?? []
    if (!groups.includes("MasterAdmin")) redirect("/unauthorized")

    const [users, roles, organizations] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
        fetchOrganizations(),
    ])

    return (
        <UsersPageClient
            users={users}
            roles={roles}
            organizations={organizations}
        />
    )
}