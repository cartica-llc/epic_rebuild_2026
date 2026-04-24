import Link from 'next/link';
import Image from 'next/image';

export function BrandLogo() {
    return (
        <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
                src="/logo/CAgov-logo.svg"
                alt="California Government Logo"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
                priority
            />
            <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-slate-900 whitespace-nowrap">
                    California Public Utilities Commission
                </h1>
                <p className="text-xs text-slate-500">EPIC Database</p>
            </div>
        </Link>
    );
}