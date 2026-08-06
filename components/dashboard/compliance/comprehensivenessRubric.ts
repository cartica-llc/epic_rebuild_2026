export type ClusterName =
    | 'Foundation / Status'
    | 'Policy / Barriers'
    | 'Innovation / Scaling'
    | 'Impacts / Metrics';

export type Rating =
    | 'Comprehensive'
    | 'Strong'
    | 'Adequate'
    | 'Limited'
    | 'Minimal'
    | 'Blank or non-responsive';

export const SCORE_SCALE: { score: number; rating: Rating; interpretation: string }[] = [
    {
        score: 5,
        rating: 'Comprehensive',
        interpretation:
            'Fully addresses the field definition, includes clear causal logic, and provides quantitative or otherwise verifiable evidence where applicable.',
    },
    {
        score: 4,
        rating: 'Strong',
        interpretation: 'Addresses most required elements; minor gaps, limited quantification, or reduced specificity.',
    },
    {
        score: 3,
        rating: 'Adequate',
        interpretation: 'Addresses the core intent of the field but lacks depth, clarity, or evidence in one or more important areas.',
    },
    {
        score: 2,
        rating: 'Limited',
        interpretation: 'High-level or generic narrative; limited explanation of how outcomes are achieved or why they matter.',
    },
    {
        score: 1,
        rating: 'Minimal',
        interpretation: 'Contains little substantive information beyond a short statement, label, or generic assertion.',
    },
    {
        score: 0,
        rating: 'Blank or non-responsive',
        interpretation: 'Blank, fragmentary, zero, or otherwise non-responsive entry.',
    },
];

export function ratingForScore(score: number): Rating {
    return SCORE_SCALE.find((s) => s.score === score)?.rating ?? 'Blank or non-responsive';
}

export interface FieldScore {
    key: NarrativeFieldKey;
    label: string;
    cluster: ClusterName;
    score: number;
    rating: Rating;
    coverage: boolean;
    notes: string;
}

type ScoreResult = Omit<FieldScore, 'rating'>;

export type NarrativeFieldKey =
    | 'DETAILED_PROJECT_DESCRIPTION'
    | 'DELIVERABLES'
    | 'PROJECT_GOALS'
    | 'PROJECT_UPDATE'
    | 'STATE_POLICY_SUPPORT_TEXT'
    | 'TECHNICAL_BARRIERS'
    | 'MARKET_BARRIERS'
    | 'POLICY_REGULATORY_BARRIERS'
    | 'GETTING_TO_SCALE'
    | 'KEY_INNOVATIONS'
    | 'KEY_LEARNINGS'
    | 'SCALABILITY'
    | 'PROJECTED_PROJECT_BENEFITS'
    | 'ELEC_RELIABILITY_IMPACTS'
    | 'ELEC_SAFETY_IMPACTS'
    | 'ENVIRONMENTAL_IMPACT_NON_GHG'
    | 'RATEPAYER_BENEFITS'
    | 'COMMUNITY_BENEFITS_DESC'
    | 'ENERGY_IMPACTS'
    | 'INFRASTRUCTURE_COST_REDUCTIONS'
    | 'OTHER_IMPACTS';

export interface FieldMeta {
    key: NarrativeFieldKey;
    label: string;
    cluster: ClusterName;
}

export const FIELD_META: FieldMeta[] = [
    { key: 'DETAILED_PROJECT_DESCRIPTION', label: 'Detailed Project Description', cluster: 'Foundation / Status' },
    { key: 'DELIVERABLES', label: 'Deliverables', cluster: 'Foundation / Status' },
    { key: 'PROJECT_GOALS', label: 'Project Goals', cluster: 'Foundation / Status' },
    { key: 'PROJECT_UPDATE', label: 'Project Update', cluster: 'Foundation / Status' },

    { key: 'STATE_POLICY_SUPPORT_TEXT', label: 'State Policy Support Text', cluster: 'Policy / Barriers' },
    { key: 'TECHNICAL_BARRIERS', label: 'Technical Barriers', cluster: 'Policy / Barriers' },
    { key: 'MARKET_BARRIERS', label: 'Market Barriers', cluster: 'Policy / Barriers' },
    { key: 'POLICY_REGULATORY_BARRIERS', label: 'Policy and Regulatory Barriers', cluster: 'Policy / Barriers' },

    { key: 'GETTING_TO_SCALE', label: 'Getting to Scale', cluster: 'Innovation / Scaling' },
    { key: 'KEY_INNOVATIONS', label: 'Key Innovations', cluster: 'Innovation / Scaling' },
    { key: 'KEY_LEARNINGS', label: 'Key Learnings', cluster: 'Innovation / Scaling' },
    { key: 'SCALABILITY', label: 'Scalability', cluster: 'Innovation / Scaling' },

    { key: 'PROJECTED_PROJECT_BENEFITS', label: 'Projected Project Benefits', cluster: 'Impacts / Metrics' },
    { key: 'ELEC_RELIABILITY_IMPACTS', label: 'Electricity System Reliability Impacts', cluster: 'Impacts / Metrics' },
    { key: 'ELEC_SAFETY_IMPACTS', label: 'Electricity System Safety Impacts', cluster: 'Impacts / Metrics' },
    { key: 'ENVIRONMENTAL_IMPACT_NON_GHG', label: 'Environmental Impacts Non-GHG', cluster: 'Impacts / Metrics' },
    { key: 'RATEPAYER_BENEFITS', label: 'Ratepayer Benefits', cluster: 'Impacts / Metrics' },
    { key: 'COMMUNITY_BENEFITS_DESC', label: 'Community Benefits', cluster: 'Impacts / Metrics' },
    { key: 'ENERGY_IMPACTS', label: 'Energy Impacts', cluster: 'Impacts / Metrics' },
    { key: 'INFRASTRUCTURE_COST_REDUCTIONS', label: 'Infrastructure Cost Benefits', cluster: 'Impacts / Metrics' },
    { key: 'OTHER_IMPACTS', label: 'Other Impacts', cluster: 'Impacts / Metrics' },
];

function isBlank(text: string | null | undefined): boolean {
    if (!text) return true;
    const s = String(text).trim();
    return s.length === 0 || s === '0' || s.toLowerCase() === 'tbd' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'none';
}

const NUMBER_RE = /\d+(\.\d+)?/g;
function countNumbers(text: string): number {
    return (text.match(NUMBER_RE) || []).length;
}

const UNIT_RE = /\b(mw|mwh|kwh|kw|\$|%|percent|tons?|co2e?|ghg|jobs?|hours?|hrs?|ft|feet|gallons?|miles?|years?)\b/gi;
function countUnits(text: string): number {
    return (text.match(UNIT_RE) || []).length;
}

const TECH_EXCLUDE = new Set(['PG', 'SCE', 'SDGE', 'SDG', 'CEC', 'CPUC', 'EPIC', 'IOU', 'LLC', 'INC', 'TBD', 'NA']);
const TECH_RE = /\b[A-Z]{2,6}\b/g;
function countTechRefs(text: string): number {
    const matches = text.match(TECH_RE) || [];
    return matches.filter((m) => !TECH_EXCLUDE.has(m)).length;
}

function lengthBonus(len: number): number {
    let b = 0;
    if (len > 200) b += 0.2;
    if (len > 350) b += 0.4;
    if (len > 600) b += 0.7;
    if (len > 900) b += 1.0;
    return b;
}

function hasMultipleSentences(text: string): boolean {
    return (text.match(/[.!?]/g) || []).length >= 2;
}

const TASK_RE = /\b(install\w*|deploy\w*|implement\w*|develop\w*|design\w*|construct\w*|integrat\w*|test(ed|ing)?|demonstrat\w*|build\w*|pilot\w*|validat\w*|launch\w*|execut\w*|creat\w*|initiat\w*)\b/i;
const CAUSAL_RE = /\b(because|therefore|result(s|ing)? in|so that|in order to|which enables?|allow\w*|lead\w* to|due to|thus|thereby)\b/i;

function clamp(n: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, n));
}

function note(parts: (string | null | undefined)[]): string {
    return parts.filter(Boolean).join(' ');
}

const GOALS_RE = /\b(goal\w*|objective\w*|aim\w*|purpose|intend\w*|seeks? to)\b/i;
const PROBLEM_RE = /\b(problem|gap|challenge\w*|issue\w*|limitation\w*|lack of|need for|risk\w*|obstacle\w*|difficult\w*|constraint\w*|mitigat\w*|address\w*)\b/i;
const BARRIER_RE = /\b(barrier\w*|regulatory|policy|obstacle\w*|hurdle\w*)\b/i;
const RESULTS_RE = /\b(result\w*|outcome\w*|deliverabl\w*|benefit\w*|impact\w*|achiev\w*|produc\w*|enabl\w*|reduc\w*|improv\w*|increas\w*|decreas\w*|enhanc\w*|demonstrat\w*)\b/i;
const PRINCIPLE_RE = /\b(reliab\w*|safety|afford\w*|environmental\w*|equity|sustainab\w*|resilien\w*|decarboniz\w*)\b/i;

export function scoreDetailedProjectDescription(text: string | null | undefined): ScoreResult {
    const base = fieldBase('DETAILED_PROJECT_DESCRIPTION');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'Blank/0 entry.' };
    const t = String(text);
    const len = t.length;

    const components = { goals: GOALS_RE.test(t), problem: PROBLEM_RE.test(t), barriers: BARRIER_RE.test(t), results: RESULTS_RE.test(t), principles: PRINCIPLE_RE.test(t) };
    const componentsPresent = Object.values(components).filter(Boolean).length;
    let score = Math.max(componentsPresent, 1);

    const specificity =
        Math.min(countNumbers(t), 6) * 0.6 +
        Math.min(countUnits(t), 4) * 0.8 +
        Math.min(countTechRefs(t), 8) * 0.3 +
        lengthBonus(len) +
        (hasMultipleSentences(t) ? 0.4 : 0) +
        (TASK_RE.test(t) ? 0.4 : 0) +
        (CAUSAL_RE.test(t) ? 0.3 : 0);

    if (score >= 3 && specificity >= 2.0) score = clamp(score + 1, 0, 5);
    if (componentsPresent === 5 && specificity < 1.2) score = Math.min(score, 4);
    if (len > 300 && components.problem && (components.goals || components.results)) score = Math.max(score, 3);
    if (len <= 20) score = 0;
    else if (len < 350) score = Math.min(score, 2);

    score = clamp(score, 0, 5);
    const missing = Object.entries(components).filter(([, v]) => !v).map(([k]) => k);
    return {
        ...base,
        score,
        coverage: true,
        notes: note([
            `${componentsPresent}/5 components present.`,
            missing.length ? `Missing/weak: ${missing.join(', ')}.` : null,
            `Specificity index ${specificity.toFixed(2)}.`,
        ]),
    };
}

const LIST_RE = /(^|\n)\s*([-•*]|\d+[.)])\s+/m;
const MILESTONE_RE = /\b(milestone\w*|task\w*|phase\w*|quarter\w*|\bq[1-4]\b|year \d)\b/i;
const OUTPUT_RE = /\b(report\w*|tool\w*|model\w*|prototype\w*|dataset\w*|analys[ei]s|software|platform\w*|guideline\w*|manual\w*|plan\w*|specification\w*)\b/i;
const SEQUENCE_RE = /\b(first|then|next|subsequently|following|after|upon completion|prior to|once)\b/i;

export function scoreDeliverables(text: string | null | undefined): ScoreResult {
    const base = fieldBase('DELIVERABLES');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'Blank/0 entry; does not outline deliverables.' };
    const t = String(text);
    const len = t.length;
    if (len < 80) return { ...base, score: 1, coverage: true, notes: 'Very short entry (<80 chars).' };

    const signals = [LIST_RE.test(t), MILESTONE_RE.test(t), OUTPUT_RE.test(t), SEQUENCE_RE.test(t), len > 200];
    const signalCount = signals.filter(Boolean).length;
    const score = signalCount <= 2 ? 2 : signalCount;

    return {
        ...base,
        score: clamp(score, 0, 5),
        coverage: true,
        notes: note([`${signalCount}/5 deliverable signals present (list structure, milestone refs, specific outputs, sequencing, length).`]),
    };
}

const STATUTORY_RE = /\b(statutory|state policy|senate bill|assembly bill|\bsb\s?\d+|\bab\s?\d+|decarboniz\w*|clean energy goal\w*|renewable\w* portfolio|rps)\b/i;
const ADVANCEMENT_RE = /\b(innovat\w*|advanc\w*|breakthrough\w*|novel\w*|state of the art)\b/i;
const OVERCOME_RE = /\b(barrier\w*|gap\w*|challenge\w*|overcom\w*)\b/i;

export function scoreStatePolicySupport(text: string | null | undefined): ScoreResult {
    const base = fieldBase('STATE_POLICY_SUPPORT_TEXT');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'Blank/0 entry; does not connect to state statutory goals.' };
    const t = String(text);
    const len = t.length;
    if (len <= 20) return { ...base, score: 0, coverage: true, notes: 'Fragmentary entry.' };

    const elements = { statutory: STATUTORY_RE.test(t), advancement: ADVANCEMENT_RE.test(t), overcome: OVERCOME_RE.test(t) };
    const elCount = Object.values(elements).filter(Boolean).length;
    let score = elCount === 0 ? 1 : elCount + 1;

    const qualityFactors = [CAUSAL_RE.test(t), countNumbers(t) > 0 || countTechRefs(t) > 0, len >= 350];
    const qCount = qualityFactors.filter(Boolean).length;
    if (score >= 3 && qCount >= 2) score = clamp(score + 1, 0, 5);
    if (elCount === 3 && qCount === 0) score = Math.min(score, 3);

    return {
        ...base,
        score: clamp(score, 0, 5),
        coverage: true,
        notes: note([`${elCount}/3 required elements (statutory linkage, advancement, barriers overcome) present.`]),
    };
}

const BARRIER_THEMES: Record<'TECHNICAL_BARRIERS' | 'MARKET_BARRIERS' | 'POLICY_REGULATORY_BARRIERS', RegExp[]> = {
    TECHNICAL_BARRIERS: [/engineer\w*/i, /integrat\w*/i, /interoperab\w*/i, /performance/i, /validat\w*/i, /test\w*/i, /demonstrat\w*/i, /control\w*/i, /\bdata\b/i, /model\w*/i, /prototype\w*/i],
    MARKET_BARRIERS: [/\bcost\w*/i, /financ\w*/i, /business model\w*/i, /adopt\w*/i, /workforce/i, /training/i, /awareness/i, /supply chain/i, /acceptance/i, /economic/i, /social/i],
    POLICY_REGULATORY_BARRIERS: [/policy|policies/i, /regulat\w*/i, /\bcpuc\b/i, /\bcec\b/i, /\bcarb\b/i, /permit\w*/i, /interconnect\w*/i, /standard\w*/i, /codes?\b/i, /rules?\b/i, /tariff\w*/i],
};

const IMPL_RE = /\b(phase\w*|pilot\w*|demonstrat\w*|deploy\w*)\b/i;

function scoreBarrierField(key: 'TECHNICAL_BARRIERS' | 'MARKET_BARRIERS' | 'POLICY_REGULATORY_BARRIERS', text: string | null | undefined): ScoreResult {
    const base = fieldBase(key);
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'Blank/fragmentary; does not explain barriers.' };
    const t = String(text);
    if (t.trim().length <= 20) return { ...base, score: 1, coverage: true, notes: 'Addresses barriers with 0 relevant thematic elements.' };

    const themeCount = BARRIER_THEMES[key].filter((re) => re.test(t)).length;
    let score = themeCount === 0 ? 1 : themeCount === 1 ? 2 : themeCount === 2 ? 3 : 4;

    const qualityFactors = [CAUSAL_RE.test(t) || TASK_RE.test(t), IMPL_RE.test(t), t.length >= 300];
    const qCount = qualityFactors.filter(Boolean).length;
    if (score >= 3 && qCount >= 2) score = clamp(score + 1, 0, 5);

    return {
        ...base,
        score: clamp(score, 0, 5),
        coverage: true,
        notes: note([`${themeCount} relevant thematic element(s) matched.`]),
    };
}

export const scoreTechnicalBarriers = (text: string | null | undefined) => scoreBarrierField('TECHNICAL_BARRIERS', text);
export const scoreMarketBarriers = (text: string | null | undefined) => scoreBarrierField('MARKET_BARRIERS', text);
export const scorePolicyRegulatoryBarriers = (text: string | null | undefined) => scoreBarrierField('POLICY_REGULATORY_BARRIERS', text);

const SCALING_THEMES: Record<'GETTING_TO_SCALE' | 'KEY_INNOVATIONS' | 'KEY_LEARNINGS' | 'SCALABILITY', RegExp[]> = {
    GETTING_TO_SCALE: [/\bscale\b|scaling/i, /next steps?/i, /deploy\w*/i, /implement\w*/i, /utility adopt\w*/i, /commercializ\w*/i, /roll[- ]?out/i, /transition\w*/i, /pathway\w*/i],
    KEY_INNOVATIONS: [/innovat\w*/i, /novel\w*/i, /first[- ]of[- ]its?[- ]kind/i, /state of the art/i, /advancement\w*/i, /breakthrough\w*/i, /unique capabilit\w*/i],
    KEY_LEARNINGS: [/learn\w*/i, /lesson\w*/i, /finding\w*/i, /demonstrated (outcome|result)\w*/i, /confirmed\w*/i],
    SCALABILITY: [/\bscale\b|scaling|scalab\w*/i, /replicat\w*/i, /adapt\w*/i, /transferab\w*/i, /adopt\w* by other/i, /modular\w*/i, /repeatab\w*/i],
};

const COMPARISON_RE = /\b(than|compared to|compare\w* with|unlike|state of the art|current practice|existing (technology|approach|method)\w*)\b/i;
const REPLICATION_RE = /\b(replicat\w*|adapt\w*|duplicat\w*|transfer\w*)\b/i;
const REFERENCE_OTHERS_RE = /\b(utilit(y|ies)|other\w*|partner\w*)\b/i;

function scoreScalingField(key: 'GETTING_TO_SCALE' | 'KEY_INNOVATIONS' | 'KEY_LEARNINGS' | 'SCALABILITY', text: string | null | undefined): ScoreResult {
    const base = fieldBase(key);
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: `Blank/fragmentary; does not address ${base.label.toLowerCase()}.` };
    const t = String(text);
    if (t.trim().length <= 20) return { ...base, score: 1, coverage: true, notes: `Addresses ${base.label.toLowerCase()} with 0 relevant thematic elements.` };

    const themeCount = SCALING_THEMES[key].filter((re) => re.test(t)).length;
    let score = themeCount === 0 ? 1 : themeCount === 1 ? 2 : themeCount === 2 ? 3 : 4;

    const extraFactor =
        key === 'KEY_INNOVATIONS' ? COMPARISON_RE.test(t) :
            key === 'SCALABILITY' ? REPLICATION_RE.test(t) :
                key === 'GETTING_TO_SCALE' ? REFERENCE_OTHERS_RE.test(t) :
                    /learn\w*|lesson\w*/i.test(t);

    const qualityFactors = [CAUSAL_RE.test(t) || TASK_RE.test(t), REFERENCE_OTHERS_RE.test(t), t.length >= 300, extraFactor];
    const qCount = qualityFactors.filter(Boolean).length;
    if (score >= 3 && qCount >= 2) score = clamp(score + 1, 0, 5);

    if (key === 'KEY_LEARNINGS' && !/learn\w*|lesson\w*|finding\w*/i.test(t)) score = Math.min(score, 2);

    return {
        ...base,
        score: clamp(score, 0, 5),
        coverage: true,
        notes: note([`${themeCount} relevant thematic element(s) matched.`]),
    };
}

export const scoreGettingToScale = (text: string | null | undefined) => scoreScalingField('GETTING_TO_SCALE', text);
export const scoreKeyInnovations = (text: string | null | undefined) => scoreScalingField('KEY_INNOVATIONS', text);
export const scoreKeyLearnings = (text: string | null | undefined) => scoreScalingField('KEY_LEARNINGS', text);
export const scoreScalability = (text: string | null | undefined) => scoreScalingField('SCALABILITY', text);

function evidenceTier(text: string): 1 | 2 | 3 {
    const hasNumberUnit = /\d+(\.\d+)?\s?(mw|mwh|kwh|kw|%|percent|tons?|co2e?|jobs?|hours?|hrs?)\b/i.test(text) || /\$\s?\d/.test(text);
    if (hasNumberUnit) return 3;
    if (countNumbers(text) > 0) return 2;
    return 1;
}

export function scoreProjectedProjectBenefits(text: string | null | undefined): ScoreResult {
    const base = fieldBase('PROJECTED_PROJECT_BENEFITS');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'No substantive entry; cannot evaluate projected benefits.' };
    const t = String(text);
    const themeRe = /\b(benefit\w*|impact\w*|outcome\w*|sav(e|ing)\w*|improv\w*|reduc\w*|avoid\w*)\b/gi;
    const themeHits = (t.match(themeRe) || []).length;
    let score = themeHits === 0 ? 1 : themeHits < 3 ? 2 : themeHits < 5 ? 3 : 4;
    if (evidenceTier(t) === 3) score = clamp(score + 1, 0, 5);
    return { ...base, score: clamp(score, 0, 5), coverage: true, notes: note(['Identifies projected benefits.', evidenceTier(t) === 3 ? 'Includes quantitative evidence (numbers with units/dollars/metrics).' : 'Benefits are largely qualitative; would benefit from quantified projections at scale.']) };
}

function scoreReliabilityOrSafety(key: 'ELEC_RELIABILITY_IMPACTS' | 'ELEC_SAFETY_IMPACTS', text: string | null | undefined): ScoreResult {
    const base = fieldBase(key);
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'No substantive entry; no stated impacts or evidence.' };
    const t = String(text);
    const relevanceRe = key === 'ELEC_RELIABILITY_IMPACTS'
        ? /\b(reliab\w*|outage\w*|saidi|saifi|caidi|resilien\w*|\bload\b|congestion|resource adequacy|planning)\b/i
        : /\b(safety|wildfire|hazard\w*|risk reduction|public safety|incident\w*|injur\w*|electrocution|arc flash)\b/i;
    const relevant = relevanceRe.test(t);
    let score = !relevant ? 1 : t.length >= 200 ? 4 : 3;
    if (evidenceTier(t) === 3) score = clamp(score + 1, 0, 5);
    return { ...base, score: clamp(score, 0, 5), coverage: true, notes: note([relevant ? `Clearly describes ${key === 'ELEC_RELIABILITY_IMPACTS' ? 'reliability' : 'safety'} impacts.` : `Does not clearly describe ${key === 'ELEC_RELIABILITY_IMPACTS' ? 'reliability' : 'safety'} impacts.`, evidenceTier(t) < 3 ? 'Mostly qualitative.' : 'Includes quantified evidence.']) };
}
export const scoreElecReliabilityImpacts = (text: string | null | undefined) => scoreReliabilityOrSafety('ELEC_RELIABILITY_IMPACTS', text);
export const scoreElecSafetyImpacts = (text: string | null | undefined) => scoreReliabilityOrSafety('ELEC_SAFETY_IMPACTS', text);

export function scoreEnvironmentalImpactNonGhg(text: string | null | undefined): ScoreResult {
    const base = fieldBase('ENVIRONMENTAL_IMPACT_NON_GHG');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'No substantive entry; no stated impacts or evidence.' };
    const t = String(text);
    const categoryRe = /\b(pollutant\w*|nox|sox|\bpm\b|voc\w*|water saving\w*|water quality|waste reduction\w*|habitat\w*|wildlife)\b/i;
    const lawRe = /\bceqa\b|\bnepa\b/i;
    const category = categoryRe.test(t);
    let score = !category ? 1 : (lawRe.test(t) || t.length >= 250 ? 4 : (lawRe.test(t) || t.length >= 220 ? 3 : 2));
    if (evidenceTier(t) === 3) score = clamp(score + 1, 0, 5);
    return { ...base, score: clamp(score, 0, 5), coverage: true, notes: note([category ? 'Identifies non-GHG environmental category.' : 'Does not clearly identify non-GHG environmental impacts.']) };
}

const RATEPAYER_RE = /\b(ratepayers?|rate payers?|customer bills?|system costs?|bill impacts?|customer costs?|cost(s)? to (ratepayers|customers))\b/i;
const DOLLAR_RE = /\$\s?\d|\bdollars?\b.{0,15}\d|\d.{0,15}\bdollars?\b/i;

export function scoreRatepayerBenefits(text: string | null | undefined): ScoreResult {
    const base = fieldBase('RATEPAYER_BENEFITS');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'No substantive entry; no stated impacts or evidence.' };
    const t = String(text);
    const relevant = RATEPAYER_RE.test(t);
    const dollar = DOLLAR_RE.test(t);
    const score = !relevant ? 1 : dollar ? (t.length >= 220 ? 5 : 4) : 2;
    return { ...base, score: clamp(score, 0, 5), coverage: true, notes: note([relevant ? 'References ratepayer benefits.' : 'Does not clearly frame benefits in ratepayer terms.', dollar ? 'Includes dollar-denominated benefit estimates.' : 'Missing dollar-denominated benefit estimates (required), ideally projected at scale.']) };
}

export function scoreCommunityBenefits(text: string | null | undefined): ScoreResult {
    const base = fieldBase('COMMUNITY_BENEFITS_DESC');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'No substantive entry; no stated impacts or evidence.' };
    const t = String(text);
    const relevant = /\b(job\w*|workforce|training|education\w*|economic development|disadvantaged communit\w*|hours? worked|california (spend|dollars?)|money spent)\b/i.test(t);
    const measurable = countNumbers(t) > 0 && /\b(job\w*|hours?|\$)\b/i.test(t);
    let score = !relevant ? 1 : measurable ? 4 : t.length >= 220 ? 3 : 2;
    if (score >= 4 && evidenceTier(t) === 3) score = clamp(score + 1, 0, 5);
    return { ...base, score: clamp(score, 0, 5), coverage: true, notes: note([relevant ? 'Describes community benefits.' : 'Does not clearly describe community benefits.', measurable ? 'Includes measurable jobs/hours/spend.' : 'Largely qualitative.']) };
}

export function scoreEnergyImpacts(text: string | null | undefined): ScoreResult {
    const base = fieldBase('ENERGY_IMPACTS');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'No substantive entry; no stated impacts or evidence.' };
    const t = String(text);
    const relevant = /\b(avoided energy|\bmw\b|\bmwh\b|\bkwh\b|peak load|summer program\w*|winter program\w*|avoided procurement|generation cost\w*)\b/i.test(t);
    const tier = evidenceTier(t);
    const powerUnitAndDollar = /\b(mw|mwh|kwh)\b/i.test(t) && DOLLAR_RE.test(t);
    let score = !relevant ? 1 : tier >= 2 ? (tier === 3 && t.length >= 220 ? 4 : 3) : 2;
    if (powerUnitAndDollar) score = Math.max(score, 4);
    if (score >= 4 && tier === 3) score = clamp(score + 1, 0, 5);
    return { ...base, score: clamp(score, 0, 5), coverage: true, notes: note([relevant ? 'Describes energy impacts.' : 'Does not clearly describe energy impacts.', tier < 3 ? 'Mostly qualitative.' : 'Includes quantified energy evidence.']) };
}

export function scoreInfrastructureCostBenefits(text: string | null | undefined): ScoreResult {
    const base = fieldBase('INFRASTRUCTURE_COST_REDUCTIONS');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'No substantive entry; no stated impacts or evidence.' };
    const t = String(text);
    const relevant = /\b(o&m|operations? (and|&) maintenance|capital cost\w*|transmission|distribution|losses|deferral\w*|upgrade\w*|economic benefit\w*)\b/i.test(t);
    const dollarOrLoss = DOLLAR_RE.test(t) || /\d+(\.\d+)?\s?%/.test(t);
    let score = !relevant ? 1 : dollarOrLoss ? 4 : t.length >= 220 ? 3 : 2;
    if (score >= 4 && evidenceTier(t) === 3) score = clamp(score + 1, 0, 5);
    return { ...base, score: clamp(score, 0, 5), coverage: true, notes: note([relevant ? 'Describes infrastructure cost benefits.' : 'Does not clearly describe infrastructure cost benefits.']) };
}

export function scoreOtherImpacts(text: string | null | undefined): ScoreResult {
    const base = fieldBase('OTHER_IMPACTS');
    if (isBlank(text)) return { ...base, score: 0, coverage: false, notes: 'No substantive entry; no stated impacts or evidence.' };
    const t = String(text);
    const relevant = /\b(metric\w*|kpi\w*|indicator\w*|measurement\w*|tracked outcome\w*|custom)\b/i.test(t);
    const tier = evidenceTier(t);
    let score = !relevant ? 1 : tier >= 2 ? (tier === 3 && t.length >= 220 ? 4 : 3) : 2;
    if (score >= 4 && tier === 3) score = clamp(score + 1, 0, 5);
    return { ...base, score: clamp(score, 0, 5), coverage: true, notes: note([relevant ? 'Provides project-specific impact metrics.' : 'Does not provide clear project-specific impact metrics.']) };
}

const STOPWORDS = new Set(['the', 'and', 'for', 'that', 'with', 'this', 'from', 'will', 'have', 'has', 'are', 'was', 'were', 'been', 'being', 'their', 'which', 'these', 'those', 'into', 'onto', 'about', 'also', 'such', 'each', 'more', 'most', 'some', 'other', 'than', 'then']);

function substantiveWords(text: string): Set<string> {
    const words = (text.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !STOPWORDS.has(w));
    return new Set(words);
}

function overlap(a: string, b: string): number {
    if (!a || !b) return 0;
    const setA = substantiveWords(a);
    const setB = substantiveWords(b);
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const w of setA) if (setB.has(w)) intersection++;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
}

const ACTION_ORIENTED_RE = TASK_RE;
const MEASURABLE_RE = /\d|\btarget\w*|\bby 20\d\d\b|percent|kwh|mwh|\bmw\b/i;
const PROGRESS_RE = /\b(progress|updat\w*|status|completed?|ongoing|milestone\w* achieved|on track|delayed|underway)\b/i;
const LEARNING_LANG_RE = /\b(learn\w*|finding\w*|lesson\w*|evolv\w*)\b/i;

export function scoreProjectGoals(goalsText: string | null | undefined, detailedDescription: string | null | undefined, projectedBenefits: string | null | undefined): ScoreResult {
    const base = fieldBase('PROJECT_GOALS');
    if (isBlank(goalsText)) return { ...base, score: 0, coverage: false, notes: 'Blank; no stated goals to cross-reference.' };
    const t = String(goalsText);
    const overlapDPD = overlap(t, String(detailedDescription ?? ''));
    const overlapPB = overlap(t, String(projectedBenefits ?? ''));

    let score = 2;
    if (overlapDPD >= 0.15) score = 3;
    if (overlapDPD >= 0.25 && overlapPB >= 0.15) score = 4;
    if (score >= 4 && ACTION_ORIENTED_RE.test(t) && MEASURABLE_RE.test(t)) score = 5;

    return {
        ...base,
        score: clamp(score, 0, 5),
        coverage: true,
        notes: note([`Overlap with Detailed Project Description: ${(overlapDPD * 100).toFixed(0)}%.`, `Overlap with Projected Benefits: ${(overlapPB * 100).toFixed(0)}%.`]),
    };
}

export function scoreProjectUpdate(updateText: string | null | undefined, detailedDescription: string | null | undefined, keyLearnings: string | null | undefined): ScoreResult {
    const base = fieldBase('PROJECT_UPDATE');
    if (isBlank(updateText)) return { ...base, score: 0, coverage: false, notes: 'Project Update field is blank or fragmentary.' };
    const t = String(updateText);
    const overlapDPD = overlap(t, String(detailedDescription ?? ''));
    const overlapKL = overlap(t, String(keyLearnings ?? ''));
    const progress = PROGRESS_RE.test(t);

    let score = 2;
    if (overlapDPD >= 0.15 && progress) score = 3;
    if (overlapDPD >= 0.25 && overlapKL >= 0.15) score = 4;
    if (score >= 4 && progress && LEARNING_LANG_RE.test(t)) score = 5;

    return {
        ...base,
        score: clamp(score, 0, 5),
        coverage: true,
        notes: note([`Overlap with Detailed Project Description: ${(overlapDPD * 100).toFixed(0)}%.`, progress ? 'Contains progress language.' : 'Reads as static status rather than progress narrative.']),
    };
}

function fieldBase(key: NarrativeFieldKey): { key: NarrativeFieldKey; label: string; cluster: ClusterName } {
    const meta = FIELD_META.find((f) => f.key === key)!;
    return meta;
}

function finalize(partial: ScoreResult): FieldScore {
    return { ...partial, rating: ratingForScore(partial.score) };
}

export interface NarrativeInput {
    DETAILED_PROJECT_DESCRIPTION: string | null | undefined;
    DELIVERABLES: string | null | undefined;
    PROJECT_GOALS: string | null | undefined;
    PROJECT_UPDATE: string | null | undefined;
    STATE_POLICY_SUPPORT_TEXT: string | null | undefined;
    TECHNICAL_BARRIERS: string | null | undefined;
    MARKET_BARRIERS: string | null | undefined;
    POLICY_REGULATORY_BARRIERS: string | null | undefined;
    GETTING_TO_SCALE: string | null | undefined;
    KEY_INNOVATIONS: string | null | undefined;
    KEY_LEARNINGS: string | null | undefined;
    SCALABILITY: string | null | undefined;
    PROJECTED_PROJECT_BENEFITS: string | null | undefined;
    ELEC_RELIABILITY_IMPACTS: string | null | undefined;
    ELEC_SAFETY_IMPACTS: string | null | undefined;
    ENVIRONMENTAL_IMPACT_NON_GHG: string | null | undefined;
    RATEPAYER_BENEFITS: string | null | undefined;
    COMMUNITY_BENEFITS_DESC: string | null | undefined;
    ENERGY_IMPACTS: string | null | undefined;
    INFRASTRUCTURE_COST_REDUCTIONS: string | null | undefined;
    OTHER_IMPACTS: string | null | undefined;
}

export function scoreProjectNarratives(n: NarrativeInput): FieldScore[] {
    return [
        finalize(scoreDetailedProjectDescription(n.DETAILED_PROJECT_DESCRIPTION)),
        finalize(scoreDeliverables(n.DELIVERABLES)),
        finalize(scoreProjectGoals(n.PROJECT_GOALS, n.DETAILED_PROJECT_DESCRIPTION, n.PROJECTED_PROJECT_BENEFITS)),
        finalize(scoreProjectUpdate(n.PROJECT_UPDATE, n.DETAILED_PROJECT_DESCRIPTION, n.KEY_LEARNINGS)),

        finalize(scoreStatePolicySupport(n.STATE_POLICY_SUPPORT_TEXT)),
        finalize(scoreTechnicalBarriers(n.TECHNICAL_BARRIERS)),
        finalize(scoreMarketBarriers(n.MARKET_BARRIERS)),
        finalize(scorePolicyRegulatoryBarriers(n.POLICY_REGULATORY_BARRIERS)),

        finalize(scoreGettingToScale(n.GETTING_TO_SCALE)),
        finalize(scoreKeyInnovations(n.KEY_INNOVATIONS)),
        finalize(scoreKeyLearnings(n.KEY_LEARNINGS)),
        finalize(scoreScalability(n.SCALABILITY)),

        finalize(scoreProjectedProjectBenefits(n.PROJECTED_PROJECT_BENEFITS)),
        finalize(scoreElecReliabilityImpacts(n.ELEC_RELIABILITY_IMPACTS)),
        finalize(scoreElecSafetyImpacts(n.ELEC_SAFETY_IMPACTS)),
        finalize(scoreEnvironmentalImpactNonGhg(n.ENVIRONMENTAL_IMPACT_NON_GHG)),
        finalize(scoreRatepayerBenefits(n.RATEPAYER_BENEFITS)),
        finalize(scoreCommunityBenefits(n.COMMUNITY_BENEFITS_DESC)),
        finalize(scoreEnergyImpacts(n.ENERGY_IMPACTS)),
        finalize(scoreInfrastructureCostBenefits(n.INFRASTRUCTURE_COST_REDUCTIONS)),
        finalize(scoreOtherImpacts(n.OTHER_IMPACTS)),
    ];
}

export interface ClusterSummary {
    cluster: ClusterName;
    fieldCount: number;
    scoredCount: number;
    avgScore: number;
    lowPct: number;
    highPct: number;
}

export function summarizeByCluster(allScores: FieldScore[]): ClusterSummary[] {
    const clusters: ClusterName[] = ['Foundation / Status', 'Policy / Barriers', 'Innovation / Scaling', 'Impacts / Metrics'];
    return clusters.map((cluster) => {
        const inCluster = allScores.filter((s) => s.cluster === cluster);
        const scored = inCluster.filter((s) => s.coverage);
        const avgScore = scored.length ? scored.reduce((sum, s) => sum + s.score, 0) / scored.length : 0;
        const low = scored.filter((s) => s.score <= 2).length;
        const high = scored.filter((s) => s.score >= 4).length;
        return {
            cluster,
            fieldCount: new Set(inCluster.map((s) => s.key)).size,
            scoredCount: scored.length,
            avgScore: Math.round(avgScore * 100) / 100,
            lowPct: scored.length ? Math.round((low / scored.length) * 1000) / 10 : 0,
            highPct: scored.length ? Math.round((high / scored.length) * 1000) / 10 : 0,
        };
    });
}

export interface FieldSummary {
    key: NarrativeFieldKey;
    label: string;
    cluster: ClusterName;
    scoredCount: number;
    avgScore: number;
    distribution: number[];
}

export function summarizeByField(allScores: FieldScore[]): FieldSummary[] {
    return FIELD_META.map((meta) => {
        const forField = allScores.filter((s) => s.key === meta.key);
        const scored = forField.filter((s) => s.coverage);
        const distribution = [0, 0, 0, 0, 0, 0];
        for (const s of scored) distribution[s.score]++;
        const avgScore = scored.length ? scored.reduce((sum, s) => sum + s.score, 0) / scored.length : 0;
        return {
            key: meta.key,
            label: meta.label,
            cluster: meta.cluster,
            scoredCount: scored.length,
            avgScore: Math.round(avgScore * 100) / 100,
            distribution,
        };
    });
}

export function scoreDistribution(allScores: FieldScore[]): { score: number; count: number; pct: number }[] {
    const scored = allScores.filter((s) => s.coverage);
    const buckets = [0, 1, 2, 3, 4, 5].map((score) => ({
        score,
        count: scored.filter((s) => s.score === score).length,
        pct: 0,
    }));
    const total = scored.length;
    for (const b of buckets) b.pct = total ? Math.round((b.count / total) * 1000) / 10 : 0;
    return buckets;
}