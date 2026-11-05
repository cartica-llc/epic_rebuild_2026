// components/project_detail_page/print/PrintDocument.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import {
    useAnalyticsContext,
    useFinanceDetails,
    useProjectDetails,
    useProjectFinanceHistory,
    useProjectImages,
} from '../shared/useProjectData';
import type { ProjectCore } from '../types';
import {
    LoadError,
    PrintAnalytics,
    PrintFinance,
    PrintFinanceHistory,
    PrintGallery,
    PrintHero,
    PrintOverview,
    PrintStory,
} from './PrintSections';
import { findPageStarts } from './paginate';
import { PRINT_STYLES } from './printStyles';

const LOGO_SRC = '/logo/cpuc-logo.png';
const LOGO_ALT = 'California Government Logo';
const SITE_NAME = 'EPIC Database';
const SITE_SUBTITLE = 'California Public Utilities Commission';

const PAGE_WIDTH_PX = 816;

const IMAGE_WAIT_MS = 15000;

async function waitForImages(root: HTMLElement) {
    const images = Array.from(root.querySelectorAll('img'));
    const settled = Promise.all(images.map((img) => img.decode().catch(() => undefined)));
    const timeout = new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_MS));
    await Promise.race([settled, timeout]);
}

function clipHeight(pageHeight: number | null, start: number, nextStart: number | undefined) {
    if (pageHeight === null) return undefined;
    return nextStart === undefined ? pageHeight : Math.min(pageHeight, nextStart - start);
}

type Props = {
    project: ProjectCore;
    onReady: () => void;
};

export function PrintDocument({ project, onReady }: Props) {
    const imagesState = useProjectImages(project.id);
    const detailsState = useProjectDetails(project.id);
    const financeState = useFinanceDetails(project.id);
    const historyState = useProjectFinanceHistory(project.id);
    const analyticsState = useAnalyticsContext(project.id);

    const rootRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [pageStarts, setPageStarts] = useState<number[]>([0]);
    const [pageHeight, setPageHeight] = useState<number | null>(null);
    const [logoFailed, setLogoFailed] = useState(false);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const loading = [imagesState, detailsState, financeState, historyState, analyticsState].some(
        (s) => s.status === 'loading'
    );

    useEffect(() => {
        const root = rootRef.current;
        const measure = measureRef.current;
        if (loading || !root || !measure) return;
        let cancelled = false;
        Promise.all([waitForImages(root), root.ownerDocument.fonts.ready]).then(() => {
            if (cancelled) return;
            const available = root.querySelector('.pv-window')?.clientHeight ?? 0;
            const starts = findPageStarts(measure, available);
            if (available !== pageHeight) setPageHeight(available);
            if (starts.join() !== pageStarts.join()) setPageStarts(starts);
            else if (available === pageHeight) onReady();
        });
        return () => {
            cancelled = true;
        };
    }, [loading, failedImages, pageStarts, pageHeight, onReady]);

    useEffect(() => {
        const root = rootRef.current;
        const frameWindow = root?.ownerDocument.defaultView;
        if (!root || !frameWindow) return;
        const fit = () => {
            const available = root.ownerDocument.documentElement.clientWidth - 16;
            root.style.setProperty('--pv-scale', String(Math.min(1, available / PAGE_WIDTH_PX)));
        };
        fit();
        frameWindow.addEventListener('resize', fit);
        return () => frameWindow.removeEventListener('resize', fit);
    }, []);

    const markFailed = (url: string) => setFailedImages((prev) => new Set(prev).add(url));

    const images = imagesState.status === 'ready' ? imagesState.data : null;
    const mainUrl = images?.main ?? project.mainImageUrl ?? null;
    const mainImage = mainUrl && !failedImages.has(mainUrl) ? mainUrl : null;
    const gallery = (images?.gallery ?? []).filter((g) => !failedImages.has(g.url));

    const details = detailsState.status === 'ready' ? detailsState.data : null;
    const finance = financeState.status === 'ready' ? financeState.data : null;
    const analytics = analyticsState.status === 'ready' ? analyticsState.data : null;

    const projectUrl = `${window.location.origin}/projects/${project.id}`;
    const displayUrl = projectUrl.replace(/^https?:\/\//, '');
    const projectNumber = project.projectNumber ?? `Project ${project.id}`;
    const pageCount = pageStarts.length;

    const content = (
        <>
            <PrintHero
                project={project}
                mainImage={mainImage}
                onImageError={() => mainUrl && markFailed(mainUrl)}
            />
            <div className="pv-body">
                {details ? (
                    <PrintOverview project={project} details={details} />
                ) : (
                    detailsState.status === 'error' && <LoadError what="Project details" />
                )}
                {imagesState.status === 'error' && <LoadError what="Project images" />}
                <PrintGallery images={gallery} onImageError={markFailed} />
                {finance ? (
                    <PrintFinance finance={finance} />
                ) : (
                    financeState.status === 'error' && <LoadError what="Finance details" />
                )}
                {historyState.status === 'ready' ? (
                    <PrintFinanceHistory quarters={historyState.data.quarters} />
                ) : (
                    historyState.status === 'error' && <LoadError what="Finance history" />
                )}
                {details && <PrintStory details={details} />}
                {analytics ? (
                    <PrintAnalytics
                        ctx={analytics}
                        areas={details?.investmentAreas ?? []}
                        committed={project.committedFundingAmt ?? 0}
                        contracted={project.contractAmount ?? 0}
                        expended={project.expendedToDate ?? 0}
                    />
                ) : (
                    analyticsState.status === 'error' && <LoadError what="Analytics" />
                )}
            </div>
        </>
    );

    return (
        <div id="project-print-root" ref={rootRef}>
            <style>{PRINT_STYLES}</style>

            <div className="pv-measure" ref={measureRef} aria-hidden="true">
                {content}
            </div>

            <div className="pv-pages">
                {pageStarts.map((start, page) => (
                    <section key={start} className="pv-page">
                        <div className="pv-running pv-running-head">
                            <div className="pv-brand">
                                {!logoFailed && (
                                    <img
                                        className="pv-logo"
                                        src={LOGO_SRC}
                                        alt={LOGO_ALT}
                                        onError={() => setLogoFailed(true)}
                                    />
                                )}
                                <div>
                                    <p className="pv-brand-name">{SITE_NAME}</p>
                                    <p className="pv-brand-sub">{SITE_SUBTITLE}</p>
                                </div>
                            </div>
                            <span className="pv-running-title">{project.projectName}</span>
                            <span className="pv-running-number">{projectNumber}</span>
                        </div>

                        <div className="pv-window">
                            <div
                                className="pv-clip"
                                style={{ height: clipHeight(pageHeight, start, pageStarts[page + 1]) }}
                            >
                                <div
                                    className="pv-flow"
                                    style={{ transform: `translateY(${-start}px)` }}
                                >
                                    {content}
                                </div>
                            </div>
                        </div>

                        <div className="pv-running pv-running-foot">
                            <a className="pv-running-url" href={projectUrl}>
                                {displayUrl}
                            </a>
                            <span className="pv-running-number">{projectNumber}</span>
                            <span className="pv-running-page">
                                Page {page + 1} of {pageCount}
                            </span>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}