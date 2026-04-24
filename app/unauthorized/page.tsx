// app/unauthorized/page.tsx

import Link from 'next/link';
import Image from 'next/image';
// import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6">
            <div className="w-full max-w-md text-center">

                {/* Logo */}
                <div className=" flex justify-center">
                    <Image
                        src="/logo/CAgov-logo.svg"
                        alt="California Government Logo"
                        width={48}
                        height={48}
                        className="h-12 w-auto object-contain"
                        priority
                    />
                </div>

                {/* Icon */}
                {/* Gradient accent bar */}
                <div className="mx-auto mb-8 h-[3px] w-16 rounded-full bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600" />

                <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    You don&apos;t have permission to view this page. If you believe this is a mistake,
                    contact your administrator.
                </p>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/projects"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300"
                    >
                        Browse Projects
                    </Link>
                </div>

            </div>
        </main>
    );
}