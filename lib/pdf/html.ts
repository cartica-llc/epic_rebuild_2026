import fs from "node:fs";
import path from "node:path";
import type { Guide } from "@/lib/doc_types";


export const BRAND = {
    org: "California Public Utilities Commission",
    product: "EPIC Database Guides",
    appUrl: "main.d3jw16rt1hm0q7.amplifyapp.com",

    footerGuideName: "EPIC Database Guides",
    poweredByLabel: "Powered by",
    poweredBy: "The Accelerate Group",
};

const GRADIENT = ["#0284c7", "#059669", "#e11d48"]; // sky-600 / emerald-600 / rose-600
const GRAD_CSS = `linear-gradient(to right, ${GRADIENT.join(", ")})`;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Brand logo as a data URI (reads /public, with an inline fallback). */
function logoDataUri(): string {
  try {
    const p = path.join(process.cwd(), "public", "logo", "CAgov-logo.svg");
    return `data:image/svg+xml;base64,${fs.readFileSync(p).toString("base64")}`;
  } catch {
    const fallback =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">` +
      `<rect x="4" y="4" width="56" height="56" rx="12" fill="#0f172a"/>` +
      `<text x="32" y="41" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="700" fill="#fff">EP</text></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(fallback).toString("base64")}`;
  }
}

const logo = logoDataUri();

export function bodyHtml(
  guides: Guide[],
  categories: string[],
  guidesByCategory: Record<string, Guide[]>,
): string {
  const toc = categories
    .map(
      (cat) => `
      <div class="toc-group">
        <p class="toc-cat">${esc(cat)}</p>
        <ul>
          ${guidesByCategory[cat]
            .map(
              (g) => `
            <li><a class="toc-row" href="#guide-${esc(g.id)}">
              <span class="toc-title">${esc(g.title)}</span>
              <span class="toc-lead"></span>
              <span class="toc-meta">${g.steps.length} ${g.steps.length === 1 ? "step" : "steps"}</span>
            </a></li>`,
            )
            .join("")}
        </ul>
      </div>`,
    )
    .join("");

  const guidesHtml = guides
    .map((g) => {
      const steps = g.steps
        .map(
          (s) => `
        <li class="step">
          <div class="step-head"><span class="step-n">${s.n}.</span><h3>${esc(s.title)}</h3></div>
          ${s.body ? `<p class="step-body">${esc(s.body)}</p>` : ""}
          ${s.image ? `<div class="step-img"><img src="${esc(s.image)}" alt="${esc(s.alt ?? s.title)}"/></div>` : ""}
        </li>`,
        )
        .join("");
      return `
      <article class="guide" id="guide-${esc(g.id)}">
        <div class="guide-head">
          <div class="rule"></div>
          <h2>${esc(g.title)}</h2>
          <p class="summary">${esc(g.summary)}</p>
        </div>
        <ol class="steps">${steps}</ol>
      </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    font-family: -apple-system, system-ui, "Segoe UI", sans-serif;
    color: #0f172a; font-size: 10.5pt; line-height: 1.45;
  }
  h1 { font-size: 19pt; font-weight: 600; margin: 0; }
  h2 { font-size: 14pt; font-weight: 600; margin: 0; break-after: avoid; }
  h3 { font-size: 11pt; font-weight: 600; margin: 0; break-after: avoid; }
  p  { margin: 0; }
  a  { color: inherit; }

  /* ---------- Page 1: cover + contents (no header/footer) ---------- */
  .cover-page { padding: 14mm 13mm 0; break-after: page; }
  .cover { display: flex; align-items: center; gap: 12px; }
  .cover img { height: 44px; width: auto; }
  .cover .sub { color: #64748b; font-size: 11pt; margin-top: 2px; }
  .cover-rule { height: 4px; border-radius: 999px; margin-top: 14px; background: ${GRAD_CSS}; }
  .contents-h { font-weight: 600; font-size: 14pt; margin: 26px 0 10px; }
  .toc-group { margin-bottom: 18px; }
  .toc-cat { font-size: 9pt; font-weight: 600; text-transform: uppercase;
             letter-spacing: .06em; color: #94a3b8; margin-bottom: 5px; }
  .toc-group ul { list-style: none; margin: 0; padding: 0; }
  .toc-row { display: flex; align-items: baseline; gap: .4rem;
             text-decoration: none; color: #0f172a; padding: 3px 0; }
  .toc-title { font-weight: 500; }
  .toc-lead { flex: 1 1 auto; border-bottom: 1px dotted #cbd5e1; transform: translateY(-3px); }
  .toc-meta { color: #94a3b8; font-size: 9pt; white-space: nowrap; }

  /* ---------- Pages 2+: running table with branded header/footer ---------- */
  .running { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .running td { padding: 0; border: 0; }
  .runhead { display: table-header-group; }
  .runfoot { display: table-footer-group; }

  .bar { height: 3px; background: ${GRAD_CSS}; }
  .runhead-row { display: flex; align-items: center; gap: 7px;
                 padding: 4mm 13mm 4.5mm; text-decoration: none; color: inherit; }
  .runhead-row img { height: 15px; width: auto; }
  .runhead-row .rh-title { font-size: 9pt; font-weight: 600; color: #0f172a; }
  .runhead-row .rh-org { margin-left: auto; font-size: 8pt; color: #94a3b8; white-space: nowrap; }

  .runfoot-row { display: flex; align-items: baseline; justify-content: space-between;
                 padding: 4.5mm 13mm 4mm; text-decoration: none;
                 font-size: 8pt; color: #94a3b8; }
  /* right slot is left empty on purpose; pdf-lib stamps the page number there */

  .running-body { padding: 0 13mm; }

  /* ---------- Guides ---------- */
  .guide + .guide { margin-top: 9mm; padding-top: 7mm; border-top: 1px solid #e2e8f0; }
  .guide-head { margin-bottom: 14px; break-after: avoid; break-inside: avoid; }
  .guide-head .rule { height: 4px; width: 60px; border-radius: 999px; background: ${GRAD_CSS}; margin-bottom: 10px; }
  .guide-head .summary { color: #475569; margin-top: 4px; }
  .steps { list-style: none; margin: 0; padding: 0; }
  .step { break-inside: avoid; page-break-inside: avoid; margin-bottom: 16px; }
  .step-head { display: flex; align-items: baseline; gap: 10px; }
  .step-n { color: #94a3b8; font-weight: 600; }
  .step-body { margin: 5px 0 0 22px; color: #334155; }
  .step-img { margin-top: 8px; }
  .step-img img { width: 100%; max-height: 105mm; object-fit: contain;
                  border: 1px solid #e2e8f0; border-radius: 6px; break-inside: avoid; }
</style></head>
<body>
  <!-- Page 1 -->
  <section class="cover-page">
    <div class="cover">
      <img src="${logo}" alt="${esc(BRAND.org)}"/>
      <div>
        <h1>${esc(BRAND.product)}</h1>
        <div class="sub">${esc(BRAND.org)}</div>
      </div>
    </div>
    <div class="cover-rule"></div>
    <div class="contents-h" id="contents">Contents</div>
    <nav>${toc}</nav>
  </section>

  <!-- Pages 2+ -->
  <table class="running">
    <thead class="runhead"><tr><td>
      <div class="bar"></div>
      <a class="runhead-row" href="#contents">
        <img src="${logo}" alt=""/>
        <span class="rh-title">${esc(BRAND.product)}</span>
<span class="rh-org">${esc(BRAND.appUrl)}</span>
      </a>
    </td></tr></thead>

<tfoot class="runfoot"><tr><td>
  <a class="runfoot-row" href="#contents">
    <span>
      ${esc(BRAND.footerGuideName)} &middot; ${esc(BRAND.poweredByLabel)} ${esc(BRAND.poweredBy)}
    </span>
  </a>
  <div class="bar"></div>
</td></tr></tfoot>

    <tbody><tr><td>
      <div class="running-body">${guidesHtml}</div>
    </td></tr></tbody>
  </table>
</body></html>`;
}
