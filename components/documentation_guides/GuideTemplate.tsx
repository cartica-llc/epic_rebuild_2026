import type { Guide } from "@/lib/doc_types";

/**
 * Renders a single guide for the on-screen browser. The PDF is generated
 * separately and server-side (see lib/pdf/html.ts + app/api/pdf/route.ts),
 * so this component is screen-only.
 */
export default function GuideTemplate({ guide }: { guide: Guide }) {
  return (
    <article>
      <div className="mb-8">
        <div className="brand-gradient mb-4 h-1 w-16 rounded-full" />
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {guide.title}
        </h2>
        <p className="mt-2 text-base text-slate-600">{guide.summary}</p>
        {/*{guide.appUrl && (*/}
        {/*  <a*/}
        {/*    href={guide.appUrl}*/}
        {/*    target="_blank"*/}
        {/*    rel="noreferrer"*/}
        {/*    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-800"*/}
        {/*  >*/}
        {/*    Open this in the app*/}
        {/*    <span aria-hidden>&rarr;</span>*/}
        {/*  </a>*/}
        {/*)}*/}
      </div>

      <ol className="space-y-5">
        {guide.steps.map((step) => (
          <li
            key={step.n}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-baseline gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {step.n}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
              </div>
              {step.body && (
                <p className="mt-2 pl-10 text-slate-600">{step.body}</p>
              )}
            </div>
            {step.image && (
              <div className="border-t border-slate-100 bg-slate-50 p-3 sm:p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.image}
                  alt={step.alt ?? step.title}
                  loading="lazy"
                  className=" select-none w-full rounded-lg border border-slate-200"
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </article>
  );
}
