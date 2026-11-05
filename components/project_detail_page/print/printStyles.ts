// components/project_detail_page/print/printStyles.ts

export const PRINT_STYLES = `
html, body { margin: 0; padding: 0; background: #e2e8f0; overflow-x: hidden; }

#project-print-root {
    --pv-ink: #0f172a;
    --pv-text: #334155;
    --pv-muted: #64748b;
    --pv-faint: #94a3b8;
    --pv-line: #e2e8f0;
    --pv-wash: #f8fafc;
    --pv-side: 0.45in;
    --pv-head: 0.62in;
    --pv-foot: 0.32in;
    --pv-gap: 7pt;
    color: var(--pv-text);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.38;
    text-rendering: geometricPrecision;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
#project-print-root *, #project-print-root *::before, #project-print-root *::after { box-sizing: border-box; }
:where(#project-print-root) :where(h1, h2, h3, p) { margin: 0; }
#project-print-root a { color: inherit; text-decoration: none; }

/* Pages */
.pv-pages { padding: 12px 0; }
.pv-page {
    position: relative; width: 8.5in; height: 11in; overflow: hidden;
    margin: 0 0 calc(12px + (var(--pv-scale, 1) - 1) * 11in) calc((100% - 8.5in) / 2);
    transform: scale(var(--pv-scale, 1)); transform-origin: top center;
    background: #fff; box-shadow: 0 1px 8px rgba(15,23,42,.18);
}
.pv-window {
    position: absolute; left: 0; right: 0;
    top: calc(var(--pv-head) + var(--pv-gap));
    bottom: calc(var(--pv-foot) + var(--pv-gap));
}
.pv-clip { overflow: hidden; }
.pv-flow, .pv-measure { width: 8.5in; }
.pv-measure { position: absolute; top: 0; left: -200vw; visibility: hidden; }

/* Page header and footer */
.pv-running {
    position: absolute; left: 0; right: 0; display: flex; align-items: center; gap: 12pt;
    padding: 0 var(--pv-side); background: #fff;
    font-size: 7.5pt; color: var(--pv-muted);
}
.pv-running-head { top: 0; height: var(--pv-head); border-bottom: 1pt solid var(--pv-ink); }
.pv-running-foot { bottom: 0; height: var(--pv-foot); border-top: 0.75pt solid var(--pv-line); }
.pv-brand { display: flex; align-items: center; gap: 7pt; flex: none; }
.pv-logo { display: block; height: 28pt; width: auto; object-fit: contain; }
.pv-brand-name { font-size: 11pt; font-weight: 600; line-height: 1.2; white-space: nowrap; color: var(--pv-ink); }
.pv-brand-sub { font-size: 7pt; line-height: 1.2; white-space: nowrap; color: var(--pv-muted); }
.pv-running-title {
    flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; text-align: right;
}
.pv-running-number { flex: none; font-weight: 700; letter-spacing: .06em; color: var(--pv-ink); text-transform: uppercase; }
.pv-running-url { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.pv-running-page { flex: none; font-variant-numeric: tabular-nums; }

/* Hero band */
.pv-hero {
    display: flex; gap: 14pt; align-items: stretch;
    padding: 12pt var(--pv-side); background: var(--pv-ink); color: #fff;
    break-inside: avoid;
}
.pv-hero-main { flex: 1; min-width: 0; }
.pv-hero-image { flex: none; width: 2.5in; min-height: 1.4in; object-fit: cover; border-radius: 3pt; }
.pv-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 4pt 6pt; font-size: 7.5pt; color: rgba(255,255,255,.7); }
.pv-tag { border: 0.75pt solid rgba(255,255,255,.28); border-radius: 2pt; padding: 0 5pt; font-weight: 600; }
.pv-tag-number { font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.pv-tag-dac { border-color: rgba(52,211,153,.45); color: #6ee7b7; }
.pv-dot { display: inline-block; width: 5pt; height: 5pt; margin-right: 4pt; border-radius: 50%; vertical-align: .5pt; }
.pv-hero h1 { margin-top: 6pt; font-size: 17pt; font-weight: 700; line-height: 1.14; letter-spacing: -.015em; color: #fff; }
.pv-hero-meta { margin-top: 4pt; font-size: 8pt; color: rgba(255,255,255,.72); }
.pv-hero-meta strong { color: #fff; font-weight: 600; }
.pv-stats { display: grid; grid-template-columns: repeat(6, auto); justify-content: space-between; gap: 6pt; margin-top: 8pt; padding-top: 7pt; border-top: 0.75pt solid rgba(255,255,255,.18); }
.pv-stat-label { font-size: 5.5pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.55); }
.pv-stat-value { font-size: 10pt; font-weight: 700; font-variant-numeric: tabular-nums; color: #fff; }

/* Body */
.pv-body { padding: 0 var(--pv-side); }
.pv-section { padding-top: 11pt; }
.pv-section-title {
    margin-bottom: 5pt; padding-bottom: 2pt; border-bottom: 0.75pt solid var(--pv-line);
    font-size: 11pt; font-weight: 700; letter-spacing: -.01em; color: var(--pv-ink);
    break-after: avoid;
}
.pv-label {
    font-size: 6.5pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
    color: var(--pv-faint); break-after: avoid;
}
.pv-text { white-space: pre-line; overflow-wrap: anywhere; orphans: 2; widows: 2; }
.pv-block { padding-bottom: 6pt; }
.pv-block .pv-label { margin-bottom: 1pt; }
.pv-overview { display: flow-root; }
.pv-aside { float: right; width: 2.25in; margin-left: 14pt; padding-left: 12pt; border-left: 0.75pt solid var(--pv-line); }
.pv-aside > div { padding-bottom: 5pt; }
.pv-aside p:not(.pv-label) { font-size: 8pt; overflow-wrap: anywhere; }
.pv-chips { display: flex; flex-wrap: wrap; gap: 2pt 3pt; margin-top: 1pt; }
.pv-chip { border-radius: 2pt; background: #f1f5f9; padding: 0 4pt; font-size: 7.5pt; color: var(--pv-text); }
.pv-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5pt 12pt; }
.pv-facts-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.pv-fact { break-inside: avoid; }
.pv-fact-value { font-size: 9pt; font-weight: 600; color: var(--pv-ink); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.pv-subhead { margin: 6pt 0 2pt; }
.pv-note { padding-top: 6pt; font-size: 8pt; font-style: italic; color: #b45309; }
.pv-footnote { padding-top: 3pt; font-size: 7pt; font-style: italic; color: var(--pv-faint); }

/* Tables */
.pv-table { width: 100%; border-collapse: collapse; font-size: 7.5pt; font-variant-numeric: tabular-nums; }
.pv-table th {
    padding: 2.5pt 4pt; background: var(--pv-wash); border-bottom: 0.75pt solid var(--pv-line);
    font-size: 6pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    text-align: right; color: var(--pv-muted); white-space: nowrap;
}
.pv-table td { padding: 2pt 4pt; border-bottom: 0.5pt solid var(--pv-line); text-align: right; white-space: nowrap; }
.pv-table th:first-child, .pv-table td:first-child { padding-left: 0; text-align: left; color: var(--pv-ink); font-weight: 600; white-space: normal; }
.pv-table th:last-child, .pv-table td:last-child { padding-right: 0; }
.pv-table tr { break-inside: avoid; }
.pv-strong { font-weight: 700; color: var(--pv-ink); }
.pv-up { color: #047857; font-weight: 600; }
.pv-down { color: #b45309; font-weight: 600; }

/* Chart */
.pv-chart { display: block; width: 100%; height: auto; margin-top: 6pt; break-inside: avoid; }

/* Gallery */
.pv-gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5pt; }
.pv-gallery-1 { grid-template-columns: minmax(0, 1fr); }
.pv-gallery-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.pv-gallery-1 img { aspect-ratio: 21 / 9; }
.pv-gallery figure { margin: 0; break-inside: avoid; }
.pv-gallery img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 2pt; }
.pv-end { height: 8pt; }

@media print {
    html, body { background: #fff; }
    .pv-pages { padding: 0; }
    .pv-measure { display: none; }
    .pv-page { margin: 0; transform: none; box-shadow: none; break-after: page; }
    .pv-page:last-child { break-after: auto; }
}

@page { size: letter; margin: 0; }
`;