//app/(dashboard)/dashboard/page.tsx
//this page will redirect users based on user roles and ridrect non-users
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardRouter() {
    const session = await auth()

    if (!session?.user) redirect("/")

    const groups = session.user.groups ?? []

    if (groups.includes("MasterAdmin")) redirect("/dashboard/master")
    if (groups.includes("ProgramAdmin")) redirect("/dashboard/program")

    redirect("/unauthorized")
}