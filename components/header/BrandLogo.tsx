import Link from 'next/link';
import logoImage from 'figma:asset/cd7bbceefbc74ac58784570fb273af12d547691e.png';

export function BrandLogo() {
    return (
        <Link href="/" className="flex items-center gap-3">
            <img
                src={logoImage}
                alt="California Government Logo"
                className="h-10 w-auto object-contain"
            />
            <div>
                <h1 className="hidden text-lg font-semibold text-slate-900 md:block">
                    California Public Utilities Commission
                </h1>
                <p className="hidden text-xs text-slate-500 md:block">EPIC Database</p>
            </div>
        </Link>
    );
}