import Link from 'next/link';

export function ProgramIntro() {
    return (
        <section>
            <div className="mx-auto max-w-5xl">
                <div className="text-start">
                    <h2 className="mb-4 text-4xl font-bold text-slate-900">
                        Powering California&apos;s Energy Future
                    </h2>

                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
                        The{' '}
                        <span className="font-semibold text-slate-900">
              Electric Program Investment Charge (EPIC)
            </span>{' '}
                        is a ratepayer-funded initiative driving breakthrough research,
                        development, and deployment of clean energy solutions across
                        California.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            href="#learn-more"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                        >
                            Learn more
                        </Link>

                        <Link
                            href="/projects"
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                        >
                            View Database
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}