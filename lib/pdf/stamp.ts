import {
    PDFDocument,
    PDFName,
    PDFNull,
    PDFDict,
    PDFArray,
    PDFRef,
    PDFNumber,
    PDFHexString,
    StandardFonts,
    rgb,
} from "pdf-lib";

const MM = 2.834645669; // 1mm in PDF points

interface OutlineGuide {
    id: string; // "guide-<id>", matches the TOC anchor / named destination
    title: string;
}

interface OutlineCategory {
    title: string;
    guides: OutlineGuide[];
}

type PDFTextLike = {
    asString?: () => string;
    decodeText?: () => string;
    toString: () => string;
};

function pdfObjectToString(obj: unknown): string | undefined {
    if (!obj || typeof obj !== "object") return undefined;

    const textObj = obj as PDFTextLike;

    return textObj.asString?.() ?? textObj.decodeText?.() ?? textObj.toString();
}

/**
 * Stamps "Page X of Y" into the footer of every page except the cover, makes
 * each stamp a link back to the contents, AND builds a real PDF outline
 * (bookmarks / chapters) shown in a reader's sidebar.
 *
 * How the bookmarks find their pages:
 * Chrome turns each TOC anchor (href="#guide-...") into a NAMED destination
 * stored in the catalog's /Names /Dests name tree, keyed by the anchor id
 * (e.g. "guide-abc"), with the value being a real [pageRef /XYZ left top zoom]
 * array. We read that whole name->dest table, then look each guide up BY NAME.
 *
 * This is more robust than harvesting the cover's link annotations: those can
 * end up associated with a different page object after pagination (which is
 * why an annotation-harvest approach returned 0 here even though 12 named
 * dests existed). Matching by name doesn't care where the link annotation
 * physically landed.
 */
export async function stampPageNumbers(
    input: Buffer,
    outline: OutlineCategory[],
): Promise<Uint8Array> {
    const doc = await PDFDocument.load(input);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const total = pages.length;
    const coverRef = pages[0].ref; // contents lives on page 1

    // ---- 1. Page numbers (unchanged behaviour) -----------------------------
    for (let i = 1; i < total; i++) {
        const p = pages[i];
        const { width } = p.getSize();
        const label = `Page ${i + 1} of ${total}`;
        const size = 7.5;
        const tw = font.widthOfTextAtSize(label, size);
        const x = width - 13 * MM - tw; // align with the 13mm side padding
        const y = 4 * MM + 3; // just above the bottom gradient bar

        p.drawText(label, { x, y, size, font, color: rgb(0.58, 0.64, 0.7) });

        const annot = doc.context.obj({
            Type: "Annot",
            Subtype: "Link",
            Rect: [x - 2, y - 2, x + tw + 2, y + size + 2],
            Border: [0, 0, 0],
            Dest: [coverRef, PDFName.of("Fit")],
        });

        const existing = p.node.Annots();

        if (existing) {
            existing.push(doc.context.register(annot));
        } else {
            p.node.set(
                PDFName.of("Annots"),
                doc.context.obj([doc.context.register(annot)]),
            );
        }
    }

    // ---- 2. Read the named-destination table -------------------------------
    const pageIndexByTag = new Map<string, number>();
    pages.forEach((pg, i) => pageIndexByTag.set(pg.ref.tag, i));

    // name (e.g. "guide-abc") -> dest array (e.g. [pageRef /XYZ left top zoom])
    const namedDests = new Map<string, PDFArray>();

    // Recursively walk a /Names name-tree node (has /Names and/or /Kids).
    const readNameTreeNode = (node: PDFDict | undefined) => {
        if (!node) return;

        const names = node.get(PDFName.of("Names"));

        if (names instanceof PDFArray) {
            // /Names is a flat [key1 val1 key2 val2 ...] array.
            for (let i = 0; i + 1 < names.size(); i += 2) {
                const key = names.get(i);
                const val = doc.context.lookup(names.get(i + 1));
                const keyStr = pdfObjectToString(key);

                // The value may be the dest array directly, or a dict with /D.
                let arr: unknown = val;

                if (val instanceof PDFDict) {
                    arr = val.get(PDFName.of("D"));
                }

                if (keyStr && arr instanceof PDFArray) {
                    namedDests.set(keyStr, arr);
                }
            }
        }

        const kids = node.get(PDFName.of("Kids"));

        if (kids instanceof PDFArray) {
            for (let i = 0; i < kids.size(); i++) {
                readNameTreeNode(doc.context.lookup(kids.get(i), PDFDict));
            }
        }
    };

    // Modern location: /Catalog /Names /Dests  (a name tree).
    const namesRoot = doc.catalog.get(PDFName.of("Names"));

    if (namesRoot) {
        const namesDict = doc.context.lookup(namesRoot, PDFDict);
        const destsTree = namesDict?.get(PDFName.of("Dests"));

        if (destsTree) {
            readNameTreeNode(doc.context.lookup(destsTree, PDFDict));
        }
    }

    // Legacy location: /Catalog /Dests  (a plain name -> dest dict).
    const legacyDests = doc.catalog.get(PDFName.of("Dests"));

    if (legacyDests) {
        const ld = doc.context.lookup(legacyDests, PDFDict);

        if (ld) {
            for (const [key, ref] of ld.entries()) {
                const val = doc.context.lookup(ref);
                let arr: unknown = val;

                if (val instanceof PDFDict) {
                    arr = val.get(PDFName.of("D"));
                }

                if (arr instanceof PDFArray) {
                    namedDests.set(key.decodeText(), arr);
                }
            }
        }
    }

    // Converts a dest array to { pageIndex, top }. `top` is the PDF-point y for
    // an /XYZ jump (so the bookmark lands on the guide heading); null -> /Fit.
    const destFromArray = (
        dest: PDFArray,
    ): { pageIndex: number; top: number | null } | null => {
        const first = dest.get(0);

        if (!(first instanceof PDFRef)) return null;

        const pageIndex = pageIndexByTag.get(first.tag);

        if (pageIndex === undefined) return null;

        let top: number | null = null;
        const mode = dest.get(1);
        const modeName = mode instanceof PDFName ? mode.decodeText() : "";

        if (modeName === "XYZ") {
            const t = dest.get(3);

            if (t instanceof PDFNumber) {
                top = t.asNumber();
            }
        } else if (modeName === "FitH" || modeName === "FitBH") {
            const t = dest.get(2);

            if (t instanceof PDFNumber) {
                top = t.asNumber();
            }
        }

        return { pageIndex, top };
    };

    // ---- 3. Match each guide to its destination BY NAME --------------------
    const lookupById = (
        id: string,
    ): { pageIndex: number; top: number | null } | null => {
        const candidates = [id, id.replace(/^guide-/, ""), `guide-${id}`];

        for (const c of candidates) {
            const arr = namedDests.get(c);

            if (arr) {
                const r = destFromArray(arr);

                if (r) return r;
            }
        }

        return null;
    };

    const flatGuides = outline.flatMap((c) => c.guides);
    let matched = 0;
    const destById = new Map<string, { pageIndex: number; top: number | null }>();

    flatGuides.forEach((g) => {
        const r = lookupById(g.id);

        if (r) matched++;

        // Fall back to page 2 so a bookmark is never silently dropped.
        destById.set(g.id, r ?? { pageIndex: 1, top: null });
    });

    // Diagnostic — remove once you've confirmed bookmarks render.
    console.log(
        "[bookmarks] dest keys:",
        namedDests.size,
        "| matched:",
        matched,
        "/",
        flatGuides.length,
    );

    // ---- 4. Assemble the outline tree --------------------------------------
    const ctx = doc.context;
    const pageRefAt = (i: number) =>
        pages[Math.min(Math.max(i, 0), total - 1)].ref;

    const destArrayFor = (d: { pageIndex: number; top: number | null }) =>
        d.top != null
            ? ctx.obj([
                pageRefAt(d.pageIndex),
                PDFName.of("XYZ"),
                PDFNull, // left = unchanged (proper PDF null, NOT the name /null)
                PDFNumber.of(d.top),
                PDFNull, // zoom = unchanged
            ])
            : ctx.obj([pageRefAt(d.pageIndex), PDFName.of("Fit")]);

    const rootRef = ctx.nextRef();

    const topRefs: PDFRef[] = [];

    for (const cat of outline) {

        const catDict = ctx.obj({ Parent: rootRef });
        catDict.set(PDFName.of("Title"), PDFHexString.fromText(cat.title));
        const catRef = ctx.register(catDict);

        const childRefs: PDFRef[] = cat.guides.map((g) => {
            const d = destById.get(g.id) ?? { pageIndex: 1, top: null };
            const guideDict = ctx.obj({
                Parent: catRef,
                Dest: destArrayFor(d),
            });

            guideDict.set(PDFName.of("Title"), PDFHexString.fromText(g.title));

            return ctx.register(guideDict);
        });

        // Sibling Prev/Next chain among guides.
        childRefs.forEach((ref, i) => {
            const node = ctx.lookup(ref, PDFDict);

            if (i > 0) {
                node.set(PDFName.of("Prev"), childRefs[i - 1]);
            }

            if (i < childRefs.length - 1) {
                node.set(PDFName.of("Next"), childRefs[i + 1]);
            }
        });

        if (childRefs.length) {
            catDict.set(PDFName.of("First"), childRefs[0]);
            catDict.set(PDFName.of("Last"), childRefs[childRefs.length - 1]);

            // Positive count = expanded by default; negate to collapse.
            catDict.set(PDFName.of("Count"), PDFNumber.of(childRefs.length));

            // Point the category itself at its first guide's destination.
            const firstDest =
                destById.get(cat.guides[0].id) ?? { pageIndex: 1, top: null };

            catDict.set(PDFName.of("Dest"), destArrayFor(firstDest));
        }

        topRefs.push(catRef);
    }

    // Sibling chain among categories.
    topRefs.forEach((ref, i) => {
        const node = ctx.lookup(ref, PDFDict);

        if (i > 0) {
            node.set(PDFName.of("Prev"), topRefs[i - 1]);
        }

        if (i < topRefs.length - 1) {
            node.set(PDFName.of("Next"), topRefs[i + 1]);
        }
    });

    const root = ctx.obj({ Type: "Outlines" });

    if (topRefs.length) {
        root.set(PDFName.of("First"), topRefs[0]);
        root.set(PDFName.of("Last"), topRefs[topRefs.length - 1]);

        // Total visible rows = categories + all guides (everything expanded).
        const visible =
            topRefs.length + outline.reduce((n, c) => n + c.guides.length, 0);

        root.set(PDFName.of("Count"), PDFNumber.of(visible));
    }

    ctx.assign(rootRef, root);

    doc.catalog.set(PDFName.of("Outlines"), rootRef);

    // Tell the reader to display the bookmark/outline panel. Without this, some
    // viewers (including Adobe Acrobat) leave the Bookmarks panel empty even
    // when a valid outline tree is present in the file.
    doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));

    return doc.save();
}