import Link from "next/link";

/** Brand header. Logo + wordmark on the left, signature gradient underline
 *  beneath the active item. Hidden in print (the PDF has its own title block). */
export default function Header() {
  return (
    <header className="screen-only sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 select-none items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/cpuc-logo.png"
            alt="California Government Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
          />
          <span className="hidden sm:block">
            <span className="block text-base font-semibold leading-tight text-slate-900">
              California Public Utilities Commission
            </span>
            <span className="block text-xs text-slate-500">EPIC Database</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <span className="relative text-sm font-bold text-slate-900">
            Documentation
            <span className="brand-gradient absolute -bottom-2 left-0 right-0 h-0.5 rounded-full" />
          </span>
          <a
            href="https://main.d3jw16rt1hm0q7.amplifyapp.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            Open app
          </a>
        </nav>
      </div>
    </header>
  );
}
