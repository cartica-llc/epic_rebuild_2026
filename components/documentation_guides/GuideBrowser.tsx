"use client";

import { useState } from "react";
import type { Guide } from "@/lib/doc_types";
import GuideTemplate from "./GuideTemplate";

/** Tabs of categories -> buttons per doc -> the selected guide. */
export default function GuideBrowser({
  categories,
  guidesByCategory,
}: {
  categories: string[];
  guidesByCategory: Record<string, Guide[]>;
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [activeGuideId, setActiveGuideId] = useState(
    guidesByCategory[categories[0]][0]?.id,
  );

  const visibleGuides = guidesByCategory[activeCategory] ?? [];
  const activeGuide =
    visibleGuides.find((g) => g.id === activeGuideId) ?? visibleGuides[0];

  return (
    <div className="screen-only">
      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Documentation categories"
        className="flex flex-wrap gap-1 border-b border-slate-200"
      >
        {categories.map((cat) => {
          const selected = cat === activeCategory;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setActiveCategory(cat);
                setActiveGuideId(guidesByCategory[cat][0]?.id);
              }}
              className={`relative -mb-px px-4 py-2.5 text-sm font-semibold transition-colors ${
                selected
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {cat}
              {selected && (
                <span className="brand-gradient absolute bottom-0 left-2 right-2 h-0.5 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Doc buttons for the active category */}
      <div className="mt-5 flex flex-wrap gap-2">
        {visibleGuides.map((g) => {
          const selected = g.id === activeGuide?.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGuideId(g.id)}
              aria-pressed={selected}
              className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "border-transparent bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {g.title}
            </button>
          );
        })}
      </div>

      {/* The selected guide */}
      <div className="mt-10">
        {activeGuide && <GuideTemplate guide={activeGuide} />}
      </div>
    </div>
  );
}
