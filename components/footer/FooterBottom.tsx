export function FooterBottom() {
    return (
        <div className="pt-8 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-sm text-slate-500 pb-6">
                    © 2026 California Public Utilities Commission. All rights reserved.
                </p>

                <div className="flex items-center gap-1 md:gap-6 text-xs text-slate-500">
                    <span>EPIC Program</span>
                    <span>•</span>
                    <a href="#" className="hover:text-slate-900 transition-colors">
                        Terms of Use
                    </a>
                </div>
            </div>

            <div className="mt-4 text-center">
                <p className="text-xs text-slate-400">
                    Powered by{" "}
                    <a
                        href="https://www.theaccelerategroup.com/index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                        The Accelerate Group
                    </a>
                </p>
            </div>
        </div>
    );
}