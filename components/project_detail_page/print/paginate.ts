// components/project_detail_page/print/paginate.ts

const WHOLE = 'img, svg, tr, figure, .pv-hero, .pv-aside, .pv-fact, .pv-chip';

const KEEP_WITH_NEXT = '.pv-section-title, .pv-label, thead tr';

type Span = { top: number; bottom: number; keep: boolean };

function collectSpans(root: HTMLElement): Span[] {
    const origin = root.getBoundingClientRect().top;
    const spans: Span[] = [];

    const add = (rect: DOMRect, keep: boolean) => {
        if (rect.height > 0) {
            spans.push({ top: rect.top - origin, bottom: rect.bottom - origin, keep });
        }
    };

    root.querySelectorAll(WHOLE).forEach((el) => {
        add(el.getBoundingClientRect(), el.matches(KEEP_WITH_NEXT));
    });
    root.querySelectorAll(KEEP_WITH_NEXT).forEach((el) => {
        add(el.getBoundingClientRect(), true);
    });

    const text = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const range = root.ownerDocument.createRange();
    while (text.nextNode()) {
        if (!text.currentNode.textContent?.trim()) continue;
        range.selectNodeContents(text.currentNode);
        Array.from(range.getClientRects()).forEach((rect) => add(rect, false));
    }

    return spans.sort((a, b) => a.top - b.top);
}

function toBlocks(spans: Span[]): { top: number; bottom: number }[] {
    for (let i = spans.length - 2; i >= 0; i--) {
        if (!spans[i].keep) continue;
        const next = spans.slice(i + 1).find((s) => s.top >= spans[i].bottom - 1);
        if (next) spans[i].bottom = Math.max(spans[i].bottom, next.bottom);
    }

    const blocks: { top: number; bottom: number }[] = [];
    for (const span of spans) {
        const last = blocks[blocks.length - 1];
        if (last && span.top < last.bottom - 0.5) {
            last.bottom = Math.max(last.bottom, span.bottom);
        } else {
            blocks.push({ top: span.top, bottom: span.bottom });
        }
    }
    return blocks;
}

export function findPageStarts(root: HTMLElement, pageHeight: number): number[] {
    const blocks = toBlocks(collectSpans(root));
    const contentEnd = blocks[blocks.length - 1]?.bottom ?? 0;

    const starts = [0];
    let start = 0;
    while (contentEnd - start > pageHeight) {
        const limit = start + pageHeight;
        const nextIndex = blocks.findIndex((b) => b.bottom > limit);
        const next = blocks[nextIndex];

        start = next.top > start ? next.top : limit;
        starts.push(start);
    }
    return starts;
}