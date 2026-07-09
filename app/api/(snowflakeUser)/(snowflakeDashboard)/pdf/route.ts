import type { Browser } from "puppeteer-core";
import { launchBrowser } from "@/lib/pdf/launch";
import { bodyHtml } from "@/lib/pdf/html";
import { stampPageNumbers } from "@/lib/pdf/stamp";
import { guides, getCategories, getGuidesByCategory } from "@/data/guides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
    const categories = getCategories();
    const guidesByCategory = Object.fromEntries(
        categories.map((c) => [c, getGuidesByCategory(c)]),
    );

    // Outline tree for the PDF sidebar: categories -> guides, in the SAME order
    // the TOC links are emitted in bodyHtml(). stampPageNumbers harvests the
    // GoTo Link annotations Chrome generates from the TOC's href="#guide-..."
    // anchors and zips them positionally against this list, so the order here
    // MUST match the TOC render order exactly.
    const outline = categories.map((cat) => ({
        title: cat,
        guides: guidesByCategory[cat].map((g) => ({
            id: `guide-${g.id}`,
            title: g.title,
        })),
    }));

    let browser: Browser | undefined;
    try {
        browser = await launchBrowser();
        const page = await browser.newPage();

        await page.setContent(bodyHtml(guides, categories, guidesByCategory), {
            waitUntil: "load",
            timeout: 45_000,
        });
        // Make sure every screenshot has finished loading before printing.
        await page.evaluate(async () => {
            await Promise.all(
                Array.from(document.images).map((img) =>
                    img.complete
                        ? Promise.resolve()
                        : new Promise<void>((res) => {
                            img.addEventListener("load", () => res());
                            img.addEventListener("error", () => res());
                        }),
                ),
            );
        });

        // No Chrome header/footer templates — the branded header/footer are the
        // table's thead/tfoot in the body (so their links stay clickable), and
        // margin:0 lets the gradient bars bleed to the page edges.
        const raw = await page.pdf({
            format: "A4",
            printBackground: true,
            displayHeaderFooter: false,
            margin: { top: "0", bottom: "0", left: "0", right: "0" },
        });

        const pdf = await stampPageNumbers(Buffer.from(raw), outline);

        return new Response(Buffer.from(pdf), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="EPIC-Database-Guides.pdf"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        console.error("PDF generation failed:", err);
        return new Response(JSON.stringify({ error: "Could not generate the PDF." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    } finally {
        await browser?.close();
    }
}