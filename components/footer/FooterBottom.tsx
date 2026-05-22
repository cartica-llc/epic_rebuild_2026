import Link from "next/link";

export function FooterBottom() {
    return (
        <div className="mt-12 border-t border-slate-200 pt-8">
            <div className="flex flex-col items-start text-left">
                <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                    © 2026 California Public Utilities Commission. All rights reserved.
                </p>

                <nav
                    aria-label="Footer secondary navigation"
                    className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500"
                >
                    <span className="font-medium text-slate-600">
                        EPIC Program
                    </span>

                    <span className="text-slate-300" aria-hidden="true">
                        •
                    </span>

                    <Link
                        href="/conditions-of-use"
                        className="font-medium transition-colors hover:text-slate-900"
                    >
                        Terms of Use
                    </Link>
                </nav>
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm leading-relaxed text-slate-400">
                    Powered by{" "}
                    <a
                        href="https://www.theaccelerategroup.com/index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-600 transition-colors hover:text-slate-900"
                    >
                        The Accelerate Group
                    </a>
                </p>
            </div>
        </div>
    );
}