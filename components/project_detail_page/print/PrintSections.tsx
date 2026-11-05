// components/project_detail_page/print/PrintSections.tsx
//
// Print versions of the Overview, Story, Finance and Analytics tabs. The tab
// components can't be reused directly because they clip long text behind
// "show more" and leave placeholders on empty fields. Here every field prints
// in full, and a field with no value is left out to save space.

import type { ReactNode } from 'react';
import { fmtC, fmtD, fmtP, fmtPct2, fmtS, has } from '../shared/format';
import type { PublicFinanceQuarter } from '../shared/useProjectData';
import type {
    AnalyticsContext,
    FinanceDetails,
    GalleryImage,
    ProjectCore,
    ProjectDetails,
} from '../types';
import { PrintFundingChart } from './PrintFundingChart';

// Same value as MIN_DAC in DacPanel.
const MIN_DAC = 25;

const hasText = (v: string | null | undefined): v is string => !!v?.trim();

const qLabel = (q: PublicFinanceQuarter) => `Q${q.reportingQuarter} ${q.reportingYear}`;

// ─── Shared pieces ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="pv-section">
            <h2 className="pv-section-title">{title}</h2>
            {children}
        </section>
    );
}

function TextBlock({ title, text }: { title: string; text: string | null | undefined }) {
    if (!hasText(text)) return null;
    return (
        <div className="pv-block">
            <p className="pv-label">{title}</p>
            <p className="pv-text">{text}</p>
        </div>
    );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="pv-fact">
            <p className="pv-label">{label}</p>
            <p className="pv-fact-value">{value}</p>
        </div>
    );
}

function ChipList({ title, items }: { title: string; items: string[] }) {
    if (!has(items)) return null;
    return (
        <div>
            <p className="pv-label">{title}</p>
            <div className="pv-chips">
                {items.map((item) => (
                    <span key={item} className="pv-chip">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

export function LoadError({ what }: { what: string }) {
    return <p className="pv-note">{what} could not be loaded, so this copy is incomplete.</p>;
}

// ─── Hero ─────────────────────────────────────────────────────────────

export function PrintHero({
                              project,
                              mainImage,
                              onImageError,
                          }: {
    project: ProjectCore;
    mainImage: string | null;
    onImageError: () => void;
}) {
    const status = project.projectStatus?.toLowerCase() ?? '';
    const statusColor = status.includes('complete')
        ? '#34d399'
        : status.includes('active')
            ? '#38bdf8'
            : '#a8a29e';

    const designations = [project.cpucDac && 'DAC', project.cpucLi && 'Low Income']
        .filter(Boolean)
        .join(' · ');

    const stats: [string, number | null | undefined][] = [
        ['Committed', project.committedFundingAmt],
        ['Contracted', project.contractAmount],
        ['Encumbered', project.encumberedFundingAmount],
        ['Expended', project.expendedToDate],
        ['Match', project.matchFunding],
        ['Leveraged', project.leveragedFunds],
    ];

    return (
        <header className="pv-hero">
            <div className="pv-hero-main">
                <div className="pv-tags">
                    {project.projectNumber && (
                        <span className="pv-tag pv-tag-number">{project.projectNumber}</span>
                    )}
                    {project.projectStatus && (
                        <span className="pv-tag">
                            <span className="pv-dot" style={{ backgroundColor: statusColor }} />
                            {project.projectStatus}
                        </span>
                    )}
                    {project.investmentProgramPeriod && <span>{project.investmentProgramPeriod}</span>}
                    {designations && <span className="pv-tag pv-tag-dac">{designations}</span>}
                </div>

                <h1>{project.projectName ?? `Project ${project.id}`}</h1>

                <p className="pv-hero-meta">
                    {project.leadCompany && (
                        <>
                            Led by <strong>{project.leadCompany}</strong>
                        </>
                    )}
                    {(project.projectStartDate || project.projectEndDate) && (
                        <>
                            {project.leadCompany && ' · '}
                            {fmtD(project.projectStartDate)} — {fmtD(project.projectEndDate)}
                        </>
                    )}
                    {project.projectType && ` · ${project.projectType}`}
                    {typeof project.maturityStage === 'string' && ` · ${project.maturityStage}`}
                </p>

                <div className="pv-stats">
                    {stats.map(([label, value]) => (
                        <div key={label}>
                            <p className="pv-stat-label">{label}</p>
                            <p className="pv-stat-value">{fmtS(value ?? 0)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {mainImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="pv-hero-image" src={mainImage} alt="" onError={onImageError} />
            )}
        </header>
    );
}

// ─── Overview ─────────────────────────────────────────────────────────

export function PrintOverview({ project, details }: { project: ProjectCore; details: ProjectDetails }) {
    const websiteUrl = details.projectWebsite?.trim();
    const websiteHref =
        websiteUrl && (/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);

    const districts = [
        details.senateDistrictBefore && `Senate ${details.senateDistrictBefore}`,
        details.assemblyDistrictBefore && `Assembly ${details.assemblyDistrictBefore}`,
    ].filter(Boolean);

    const flags: [string, boolean][] = [
        ['DAC', project.cpucDac],
        ['Low income', project.cpucLi],
        ['Community benefits', details.communityBenefits],
        ['Standards', details.standards],
        ['Cybersecurity considerations', details.cyberSecurityConsiderations],
        ['EE workpaper produced', details.isEnergyEfficiencyWorkpaperProduced],
    ];

    return (
        <Section title="Overview">
            <div className="pv-overview">
                <div className="pv-aside">
                    {(details.contactPersonName || details.contactPersonEmail) && (
                        <div>
                            <p className="pv-label">Project Contact</p>
                            {details.contactPersonName && (
                                <p className="pv-strong">{details.contactPersonName}</p>
                            )}
                            {details.contactPersonTitle && <p>{details.contactPersonTitle}</p>}
                            {details.contactPersonEmail && (
                                <p>
                                    <a href={`mailto:${details.contactPersonEmail}`}>
                                        {details.contactPersonEmail}
                                    </a>
                                </p>
                            )}
                            {project.leadCompany && <p>{project.leadCompany}</p>}
                        </div>
                    )}
                    {websiteHref && (
                        <div>
                            <p className="pv-label">Project Website</p>
                            <p>
                                <a href={websiteHref}>{websiteUrl}</a>
                            </p>
                        </div>
                    )}
                    {details.finalReportUrl && (
                        <div>
                            <p className="pv-label">Final Report</p>
                            <p>Available on the project page</p>
                        </div>
                    )}
                    <ChipList title="Investment Areas" items={details.investmentAreas} />
                    <ChipList title="Development Stages" items={details.developmentStages} />
                    <ChipList title="Partners" items={details.projectPartners} />
                    <ChipList title="Business Classifications" items={details.businessClassifications} />
                    {districts.length > 0 && (
                        <div>
                            <p className="pv-label">Legislative Districts</p>
                            <p>{districts.join(' · ')}</p>
                        </div>
                    )}
                    <ChipList title="Utility Service Areas" items={details.utilityServiceAreas} />
                </div>
                <TextBlock title="Summary" text={details.projectSummary} />
                <p className="pv-label pv-subhead">Project Attributes</p>
                <div className="pv-facts pv-facts-3">
                    {flags.map(([label, on]) => (
                        <Fact key={label} label={label} value={on ? 'Yes' : 'No'} />
                    ))}
                </div>
            </div>
        </Section>
    );
}

// ─── Gallery ──────────────────────────────────────────────────────────

export function PrintGallery({
                                 images,
                                 onImageError,
                             }: {
    images: GalleryImage[];
    onImageError: (url: string) => void;
}) {
    if (images.length === 0) return null;
    return (
        <Section title="Project Images">
            <div className={`pv-gallery ${images.length <= 2 ? `pv-gallery-${images.length}` : ''}`}>
                {images.map((img, i) => (
                    <figure key={img.url}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={`Project image ${i + 2}`} onError={() => onImageError(img.url)} />
                    </figure>
                ))}
            </div>
        </Section>
    );
}

// ─── Story ────────────────────────────────────────────────────────────

export function PrintStory({ details: d }: { details: ProjectDetails }) {
    const groups: { title: string; blocks: [string, string | null | undefined][] }[] = [
        {
            title: 'Narrative',
            blocks: [
                ['Project Detail', d.projectDetailText],
                ['Latest Update', d.projectUpdate],
                ['Deliverables', d.deliverables],
            ],
        },
        {
            title: 'Innovations & Learnings',
            blocks: [
                ['Key Innovations', d.keyInnovations],
                ['Key Learnings', d.keyLearnings],
                ['Scalability', d.scalability],
                ['Getting to Scale', d.gettingToScale],
                ['State Policy Support', d.statePolicySupport],
            ],
        },
        {
            title: 'Challenges & Barriers',
            blocks: [
                ['Technical Barriers', d.technicalBarriers],
                ['Market Barriers', d.marketBarriers],
                ['Policy & Regulatory', d.policyAndRegulatoryBarriers],
                ['Cybersecurity', d.cybersecurityConsiderationsNar],
            ],
        },
        {
            title: 'Project Metrics',
            blocks: [
                ['Projected Benefits', d.projectedProjectBenefits],
                ['Grid Reliability', d.electricitySystemReliabilityImpacts],
                ['Grid Safety', d.electricitySystemSafetyImpacts],
                ['GHG Impacts', d.ghgImpacts],
                ['Other Environmental', d.otherEnvirionmentalImpacts],
                ['Ratepayer Benefits', d.ratepayerImpacts],
                ['Community Benefits', d.communityBenefitsDesc],
                ['Energy Impacts', d.energyImpacts],
                ['Economic Benefits', d.infrastructureCostReductions],
                ['Other Impacts', d.otherImpacts],
                ['Information Dissemination', d.informationDissemination],
            ],
        },
    ];

    return (
        <>
            {groups
                .filter((g) => g.blocks.some(([, text]) => hasText(text)))
                .map((g) => (
                    <Section key={g.title} title={g.title}>
                        {g.blocks.map(([title, text]) => (
                            <TextBlock key={title} title={title} text={text} />
                        ))}
                    </Section>
                ))}
        </>
    );
}

// ─── Finance ──────────────────────────────────────────────────────────

export function PrintFinance({ finance }: { finance: FinanceDetails }) {
    const committed = finance.commitedFundingAmt ?? 0;
    const utilized =
        committed > 0 && finance.expendedToDate != null
            ? `${((finance.expendedToDate / committed) * 100).toFixed(1)}%`
            : '—';

    return (
        <Section title="Finance">
            <div className="pv-facts">
                <Fact label="Committed" value={fmtC(finance.commitedFundingAmt)} />
                <Fact label="Contract amount" value={fmtC(finance.contractAmount)} />
                <Fact label="Encumbered" value={fmtC(finance.encumberedFundingAmount)} />
                <Fact label="Expended to date" value={fmtC(finance.expendedToDate)} />
                <Fact label="Admin & overhead" value={fmtC(finance.adminCost)} />
                <Fact label="Match funding" value={fmtC(finance.matchFunding)} />
                <Fact label="Match split" value={fmtPct2(finance.matchFundingSplit)} />
                <Fact label="Leveraged funds" value={fmtC(finance.leveragedFunds)} />
                <Fact label="Funds utilized" value={utilized} />
            </div>

            {(has(finance.fundingMechanisms) || has(finance.matchFundingPartners)) && (
                <div className="pv-facts pv-subhead" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <ChipList title="Funding Mechanisms" items={finance.fundingMechanisms} />
                    <ChipList title="Match Funding Partners" items={finance.matchFundingPartners} />
                </div>
            )}
            {hasText(finance.leveragedFundsSources) && (
                <TextBlock title="Leveraged Funds Sources" text={finance.leveragedFundsSources} />
            )}

            {has(finance.cpucProceedings) && (
                <>
                    <p className="pv-label pv-subhead">CPUC Proceedings</p>
                    <table className="pv-table">
                        <tbody>
                        {finance.cpucProceedings.map((p) => (
                            <tr key={p.cpucNumber}>
                                <td style={{ width: '1.3in' }}>{p.cpucNumber}</td>
                                <td style={{ textAlign: 'left', whiteSpace: 'normal' }}>
                                    {p.cpucDescription ?? ''}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}
        </Section>
    );
}

export function PrintFinanceHistory({ quarters }: { quarters: PublicFinanceQuarter[] }) {
    if (quarters.length === 0) return null;

    const newestFirst = [...quarters].reverse();
    const bidding = newestFirst.find(
        (q) => q.numOfBidders != null || q.rankOfSelectedBidders != null || q.bidderDescription
    );

    return (
        <Section title="Funding Journey">
            <PrintFundingChart quarters={quarters} />

            <p className="pv-label pv-subhead">Quarterly Records</p>
            <table className="pv-table">
                <thead>
                <tr>
                    {[
                        'Quarter',
                        'Committed',
                        'Encumbered',
                        'Expended',
                        'QoQ change',
                        'Admin',
                        'Contract',
                        'Match',
                        'Leveraged',
                        'Match %',
                    ].map((h) => (
                        <th key={h}>{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {newestFirst.map((q, i) => {
                    const older = newestFirst[i + 1];
                    const diff =
                        q.expendedToDate != null && older?.expendedToDate != null
                            ? q.expendedToDate - older.expendedToDate
                            : null;
                    return (
                        <tr key={`${q.reportingYear}-${q.reportingQuarter}`}>
                            <td>{qLabel(q)}</td>
                            <td>{fmtC(q.committedFunding)}</td>
                            <td>{fmtC(q.encumberedFunding)}</td>
                            <td className="pv-strong">{fmtC(q.expendedToDate)}</td>
                            <td className={diff == null || diff === 0 ? '' : diff > 0 ? 'pv-up' : 'pv-down'}>
                                {diff == null
                                    ? '—'
                                    : diff === 0
                                        ? 'No change'
                                        : `${diff > 0 ? '+' : '−'}${fmtS(Math.abs(diff))}`}
                            </td>
                            <td>{fmtC(q.adminOverhead)}</td>
                            <td>{fmtC(q.contractAmount)}</td>
                            <td>{fmtC(q.matchFunding)}</td>
                            <td>{fmtC(q.leveragedFunds)}</td>
                            <td>{fmtPct2(q.matchFundingSplit)}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {bidding && (
                <div className="pv-subhead">
                    <p className="pv-label">Bidding &amp; Contract</p>
                    <p>
                        {[
                            bidding.numOfBidders != null && `Number of bidders: ${bidding.numOfBidders}`,
                            bidding.rankOfSelectedBidders != null &&
                            `Selected bidder rank: ${bidding.rankOfSelectedBidders}`,
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                    {bidding.bidderDescription && <p className="pv-text">{bidding.bidderDescription}</p>}
                </div>
            )}
        </Section>
    );
}

// ─── Analytics ────────────────────────────────────────────────────────

export function PrintAnalytics({
                                   ctx,
                                   areas,
                                   committed,
                                   contracted,
                                   expended,
                               }: {
    ctx: AnalyticsContext;
    areas: string[];
    committed: number;
    contracted: number;
    expended: number;
}) {
    const { tot, agg, dac } = ctx;
    const count = tot.count;
    const compare: [string, number, number][] = [
        ['Committed', committed, count > 0 ? tot.committed / count : 0],
        ['Contracted', contracted, count > 0 ? tot.contracted / count : 0],
        ['Expended', expended, count > 0 ? tot.expended / count : 0],
    ];

    const areaRows = areas.flatMap((area) => {
        const row = agg[area];
        return row ? [{ area, ...row }] : [];
    });
    const dacRows = Object.entries(dac);

    return (
        <Section title="Portfolio Analytics">
            {count > 0 && (
                <>
                    <p className="pv-label">Compared across {count.toLocaleString()} projects</p>
                    <table className="pv-table">
                        <thead>
                        <tr>
                            <th>Measure</th>
                            <th>This project</th>
                            <th>Portfolio average</th>
                            <th>Difference</th>
                        </tr>
                        </thead>
                        <tbody>
                        {compare.map(([label, value, avg]) => (
                            <tr key={label}>
                                <td>{label}</td>
                                <td>{fmtS(value)}</td>
                                <td>{fmtS(avg)}</td>
                                <td className={value >= avg ? 'pv-up' : 'pv-down'}>
                                    {avg > 0
                                        ? `${fmtP(Math.abs((value / avg - 1) * 100))} ${value >= avg ? 'above' : 'below'}`
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}

            {areaRows.length > 0 && (
                <>
                    <p className="pv-label pv-subhead">Investment Area Position</p>
                    <table className="pv-table">
                        <thead>
                        <tr>
                            <th>Investment area</th>
                            <th>Projects</th>
                            <th>Area committed</th>
                            <th>This project&apos;s share</th>
                        </tr>
                        </thead>
                        <tbody>
                        {areaRows.map((r) => (
                            <tr key={r.area}>
                                <td>{r.area}</td>
                                <td>{r.count.toLocaleString()}</td>
                                <td>{fmtS(r.committed)}</td>
                                <td>{r.committed > 0 ? fmtP((committed / r.committed) * 100) : '—'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}

            {dacRows.length > 0 && (
                <>
                    <p className="pv-label pv-subhead">
                        Community Investment: DAC / Low Income ({MIN_DAC}% portfolio minimum)
                    </p>
                    <table className="pv-table">
                        <thead>
                        <tr>
                            <th>Investment area</th>
                            <th>DAC / LI projects</th>
                            <th>DAC / LI committed</th>
                            <th>Share of committed</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dacRows.map(([area, s]) => {
                            const pct = s.totC > 0 ? (s.dacC / s.totC) * 100 : 0;
                            return (
                                <tr key={area}>
                                    <td>{area}</td>
                                    <td>
                                        {s.dacN} of {s.totN}
                                    </td>
                                    <td>{fmtS(s.dacC)}</td>
                                    <td className={pct >= MIN_DAC ? 'pv-up' : 'pv-down'}>{fmtP(pct)}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    <p className="pv-footnote">Self-reported by administrator, not verified.</p>
                </>
            )}
        </Section>
    );
}