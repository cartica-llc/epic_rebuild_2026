import { SignOutButton } from "@/components/auth/SignOutButton"

interface DashboardHeaderProps {
    email: string
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Master Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500">{email}</p>
            </div>
            <SignOutButton />
        </div>
    )
}