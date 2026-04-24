import { FooterBrand } from './FooterBrand';
import { FooterNav } from './FooterNav';
import { FooterResources } from './FooterResources';
import { FooterBottom } from './FooterBottom';

export function Footer() {
    return (
        <footer className="relative bg-slate-50 mt-20">
            <div className="h-[3px] w-full bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-600" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <FooterBrand />
                    <FooterNav />
                    <FooterResources />
                </div>
                <FooterBottom />
            </div>

            <div className="h-1 w-full bg-gradient-to-r from-sky-600/20 via-emerald-600/20 to-rose-600/20" />
        </footer>
    );
}