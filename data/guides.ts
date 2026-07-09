import type { Guide } from "@/lib/doc_types";

import signIn from "./guides/sign-in.json";
import createProject from "./guides/create-project.json";
import editProject from "./guides/edit-project.json";
import exportProjects from "./guides/export-projects.json";
import quickInsightsProjectMap from "./guides/insights/map.json";
import quickInsightsMarket from "./guides/insights/market.json";
import quickInsightsSpending_Overview from "./guides/insights/spending/overview.json";
import quickInsightsSpending_Leverage from "./guides/insights/spending/leverage.json";
import quickInsightsSpending_Award from "./guides/insights/spending/award.json";
import quickInsightsSpending_dacli from "./guides/insights/spending/dacli.json";
import compliance_project from "./guides/compliance/project.json";

/**
 * Guide registry. To add a new doc:
 *   1. Drop a JSON file in data/guides/ matching the Guide type.
 *   2. Import it and add it to this array.
 * Order here is the order shown in the tabs and the PDF.
 */
export const guides: Guide[] = [
  signIn as Guide,
  createProject as Guide,
  editProject as Guide,
  exportProjects as Guide,
    quickInsightsProjectMap as Guide,
    quickInsightsMarket as Guide,
    quickInsightsSpending_Overview as Guide,
    quickInsightsSpending_Leverage as Guide,
    quickInsightsSpending_Award as Guide,
    quickInsightsSpending_dacli as Guide,
    compliance_project as Guide,
];

/** Category tab order. Categories not listed here are appended alphabetically. */
const CATEGORY_ORDER = ["Getting Started", "Projects", "Insights", "Compliance"];

export function getCategories(): string[] {
  const found = Array.from(new Set(guides.map((g) => g.category)));
  return found.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export function getGuidesByCategory(category: string): Guide[] {
  return guides.filter((g) => g.category === category);
}
