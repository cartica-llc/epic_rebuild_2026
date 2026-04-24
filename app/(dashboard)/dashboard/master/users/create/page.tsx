//app/(dashboard)/dashboard/master/users/create/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { fetchRoles, fetchOrganizations } from "../getUsers"
import { CreateUserClient } from "@/components//dashboard/masterAdmin/users/userCreate/CreateUserClient"

export default async function CreateUserPage() {
    const session = await auth()
    if (!session?.user) redirect("/")

    const groups = session.user.groups ?? []
    if (!groups.includes("MasterAdmin")) redirect("/unauthorized")

    const [roles, organizations] = await Promise.all([
        fetchRoles(),
        fetchOrganizations(),
    ])

    return <CreateUserClient roles={roles} organizations={organizations} />
}