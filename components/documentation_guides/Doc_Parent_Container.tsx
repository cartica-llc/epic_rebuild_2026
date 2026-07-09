import GuideBrowser from "@/components/documentation_guides/GuideBrowser";
import DownloadPdfButton from "@/components/documentation_guides/DownloadPdfButton";
import { getCategories, getGuidesByCategory } from "@/data/guides";

const MOST_RECENT_UPDATE_DATE = "July 9, 2026";

export default function Doc_Parent_Container() {
    const categories = getCategories();

    const guidesByCategory = Object.fromEntries(
        categories.map((c) => [c, getGuidesByCategory(c)]),
    );

    return (
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            {/* Intro */}
            <section className="mb-12">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                            EPIC Database Guides
                        </h1>

                        <p className="mt-3 max-w-2xl text-base text-slate-600">
                            Short, visual walkthroughs of the EPIC Database. Pick a category,
                            choose a guide, and follow the steps &mdash; or download the whole
                            set as a PDF.
                        </p>

                        <p className="mt-3 text-sm text-slate-500">
                            Most recent update:{" "}
                            <span className="font-medium text-slate-700">
                                {MOST_RECENT_UPDATE_DATE}
                            </span>
                        </p>
                    </div>

                    <DownloadPdfButton label="Download PDF" />
                </div>
            </section>

            {/* Tabs + doc buttons + selected guide */}
            <GuideBrowser
                categories={categories}
                guidesByCategory={guidesByCategory}
            />
        </main>
    );
}