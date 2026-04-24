//app/(dashboard)/dashboard/master/users/[id]/page.tsx
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { fetchUser, fetchRoles, fetchOrganizations } from "../getUsers"
import { EditUserClient } from "@/components/dashboard/masterAdmin/users/userEdit/EditUserClient"

interface EditUserPageProps {
    params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
    const session = await auth()
    if (!session?.user) redirect("/")

    const groups = session.user.groups ?? []
    if (!groups.includes("MasterAdmin")) redirect("/unauthorized")

    const { id } = await params

    const [user, roles, organizations] = await Promise.all([
        fetchUser(id),
        fetchRoles(),
        fetchOrganizations(),
    ])

    if (!user) notFound()

    return (
        <EditUserClient user={user} roles={roles} organizations={organizations} />
    )
}