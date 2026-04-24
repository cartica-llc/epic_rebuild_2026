'use client';

import { fmtD } from '../shared/format';
import { useProjectImages } from '../shared/useProjectData';
import type { ProjectCore } from '../types';
import { HeroFunding } from './HeroFunding';
import { HeroGallery } from './HeroGallery';
import { HeroNav } from './HeroNav';

type Props = {
    project: ProjectCore;
};

export function HeroSection({ project }: Props) {
    const imagesState = useProjectImages(project.id);

    const mainImg =
        imagesState.status === 'ready' ? imagesState.data.main : null;
    const mainThumb =
        imagesState.status === 'ready' ? imagesState.data.mainThumbnail : null;
    const galleryImages =
        imagesState.status === 'ready' ? imagesState.data.gallery : [];
    const loadingImages = imagesState.status === 'loading';

    const heroBg = mainImg ?? project.mainImageUrl;

    const statusColor = project.projectStatus?.toLowerCase().includes('complete')
        ? 'bg-emerald-400'
        : project.projectStatus?.toLowerCase().includes('active')
            ? 'bg-sky-400'
            : 'bg-stone-400';

    const committed = project.committedFundingAmt ?? 0;
    const contracted = project.contractAmount ?? 0;
    const expended = project.expendedToDate ?? 0;
    const encumbered = project.encumberedFundingAmount ?? 0;
    const matchFunding = project.matchFunding ?? 0;
    const leveraged = project.leveragedFunds ?? 0;

    const showDacLabel = project.cpucDac || project.cpucLi;

    const noiseStyle =
        'url(data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E)';

    return (
        <header
            className="relative overflow-hidden pb-12 mt-10"
            style={
                heroBg
                    ? {
                        backgroundImage: `linear-gradient(188deg, rgba(15, 23, 42, 0.35) 28.57%, rgba(15, 23, 42, 0.95) 79.83%),url(${heroBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }
                    : { backgroundColor: '#020617' }
            }
        >
            <div
                className="pointer-events-none absolute inset-0 backdrop-blur-2xl"
                style={{ backgroundImage: noiseStyle }}
            />

            <HeroNav
                projectId={project.id}
                programAdminId={project.programAdminId}
            />

            <div className="relative mx-auto max-w-5xl px-6 pt-6 sm:px-8">
                <div className="flex flex-wrap items-center gap-2.5">
                    {project.projectNumber && (
                        <span className="rounded border border-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                            {project.projectNumber}
                        </span>
                    )}
                    {project.projectStatus && (
                        <span className="flex items-center gap-1.5 rounded border border-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/80">
                            <span
                                className={[
                                    'h-1.5 w-1.5 rounded-full',
                                    statusColor,
                                ].join(' ')}
                            />
                            {project.projectStatus}
                        </span>
                    )}
                    {project.investmentProgramPeriod && (
                        <span className="text-[11px] text-white/50">
                            {project.investmentProgramPeriod}
                        </span>
                    )}
                    {showDacLabel && (
                        <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/25">
                            {[project.cpucDac && 'DAC', project.cpucLi && 'Low Income']
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                    )}
                </div>

                <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                    {project.projectName ?? `Project ${project.id}`}
                </h1>
                {project.leadCompany && (
                    <p className="mt-3 text-sm font-medium text-white/80">
                        Led by{' '}
                        <span className="font-semibold text-white">
                            {project.leadCompany}
                        </span>
                    </p>
                )}

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-white/50">
                    {(project.projectStartDate || project.projectEndDate) && (
                        <span>
                            {fmtD(project.projectStartDate)} —{' '}
                            {fmtD(project.projectEndDate)}
                        </span>
                    )}
                    {project.projectType && <span>{project.projectType}</span>}
                </div>

                <HeroGallery
                    main={mainImg}
                    thumb={mainThumb}
                    gallery={galleryImages}
                    loading={loadingImages}
                />

                <HeroFunding
                    committed={committed}
                    contracted={contracted}
                    expended={expended}
                    encumbered={encumbered}
                    matchFunding={matchFunding}
                    leveraged={leveraged}
                    maturityStage={project.maturityStage}
                />
            </div>
        </header>
    );
}