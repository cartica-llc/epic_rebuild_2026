import Link from 'next/link';
import Image from 'next/image';

export function BrandLogo() {
    return (
        <Link href="/" className=" select-none flex items-center gap-3 shrink-0">
            <Image
                src="/logo/cpuc-logo.png"
                alt="California Government Logo"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
                priority
            />
            <div className=" ">
                <h1 className="text-lg font-semibold text-slate-900 whitespace-nowrap">
                    EPIC Database
                </h1>
                <p className="text-xs text-slate-500">California Public Utilities Commission</p>
            </div>
        </Link>
    );
}