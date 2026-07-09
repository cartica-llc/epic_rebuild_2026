// app/(dashboard)/dashboard/program/docs/page.tsx

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Doc_Parent_Container from "@/components/documentation_guides/Doc_Parent_Container";

export default async function ProgramDocsPage() {
    const session = await auth();

    if (!session?.user) redirect("/");

    const groups = session.user.groups ?? [];

    if (!groups.includes("ProgramAdmin")) {
        redirect("/unauthorized");
    }

    return (
        <>
            <Doc_Parent_Container />
        </>
    );
}