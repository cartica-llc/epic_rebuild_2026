// app/api/(snowflakePublic)/projectDetailPageRoutes/[id]/details/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';
import { T, safeInt, safeQuery, toBool } from '../../_shared';
import type { ProjectDetails } from '@/components/project_detail_page/types';

interface DetailRow {
    PROJECT_DETAIL_ID: number | null;
    SUMMARY_PROJECT_DESCRIPTION: string | null;
    DETAILED_PROJECT_DESCRIPTION: string | null;
    PROJECT_UPDATE: string | null;
    DELIVERABLES: string | null;
    KEY_INNOVATIONS: string | null;
    KEY_LEARNINGS: string | null;
    SCALABILITY: string | null;
    GETTING_TO_SCALE: string | null;
    STATE_POLICY_SUPPORT_TEXT: string | null;
    TECHNICAL_BARRIERS: string | null;
    MARKET_BARRIERS: string | null;
    POLICY_AND_REGULATORY_BARRIERS: string | null;
    CYBER_SECURITY_NARRATIVE: string | null;
    FINAL_REPORT_URL: string | null;

    PERSON_CONTACT_FIRST_NAME: string | null;
    PERSON_CONTACT_LAST_NAME: string | null;
    PERSON_CONTACT_TITLE: string | null;
    PERSON_CONTACT_EMAIL: string | null;
    PROJECT_WEBSITE_ADDRESS_URL: string | null;

    SENATE_DISTRICT_NAME: string | null;
    ASSEMBLY_DISTRICT_NAME: string | null;

    STANDARDS: boolean | number | null;
    CYBER_SECURITY_CONSIDERATIONS: boolean | number | null;
    IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED: boolean | number | null;
    COMMUNITY_BENEFITS: boolean | number | null;
}

interface NameRow {
    NAME: string | null;
}

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
    const { id: idParam } = await params;
    const id = safeInt(idParam);
    if (id === null) {
        return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
    }

    try {
        // NOTE on districts: the schema has both BEFORE_REDISTRICTED and
        // AFTER_REDISTRICTED FKs. We currently surface the BEFORE columns
        // (as named in the mockup). Switch to the *_AFTER_* columns once
        // that's the preferred display mode.
        //
        // NOTE on district table names: the schema has a top-level
        // SENATE_DISTRICT and ASSEMBLY_DISTRICT table. Column name for the
        // display value is unknown — assuming *_NAME convention matching
        // PROJECT_TYPE_NAME, INVESTMENT_AREA_NAME, etc. If these alias names
        // come back NULL, DESC TABLE each and update the aliases.
        const rows = (await query(`
            SELECT
                pd.PROJECT_DETAIL_ID,
                pd.SUMMARY_PROJECT_DESCRIPTION,
                pd.DETAILED_PROJECT_DESCRIPTION,
                pd.PROJECT_UPDATE,
                pd.DELIVERABLES,
                pd.KEY_INNOVATIONS,
                pd.KEY_LEARNINGS,
                pd.SCALABILITY,
                pd.GETTING_TO_SCALE,
                pd.STATE_POLICY_SUPPORT_TEXT,
                pd.TECHNICAL_BARRIERS,
                pd.MARKET_BARRIERS,
                pd.POLICY_AND_REGULATORY_BARRIERS,
                pd.CYBER_SECURITY_NARRATIVE,
                pd.FINAL_REPORT_URL,

                p.PERSON_CONTACT_FIRST_NAME,
                p.PERSON_CONTACT_LAST_NAME,
                p.PERSON_CONTACT_TITLE,
                p.PERSON_CONTACT_EMAIL,
                p.PROJECT_WEBSITE_ADDRESS_URL,

                sd.SENATE_DISTRICT_NAME,
                ad.ASSEMBLY_DISTRICT_NAME,

                p.STANDARDS,
                p.CYBER_SECURITY_CONSIDERATIONS,
                p.IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED,
                p.COMMUNITY_BENEFITS
            FROM ${T}.PROJECT p
            LEFT JOIN ${T}.PROJECT_DETAIL pd
                ON p.PROJECT_DETAIL_PROJECT_DETAIL_ID = pd.PROJECT_DETAIL_ID
            LEFT JOIN ${T}.SENATE_DISTRICT sd
                ON p.LEGISLATIVE_DISTRICT_SENATE_DISTRICT_BEFORE_REDISTRICTED_ID = sd.SENATE_DISTRICT_ID
            LEFT JOIN ${T}.ASSEMBLY_DISTRICT ad
                ON p.LEGISLATIVE_DISTRICT_ASSEMBLY_DISTRICT_BEFORE_REDISTRICTED_ID = ad.ASSEMBLY_DISTRICT_ID
            WHERE p.PROJECT_ID = ${id}
            LIMIT 1
        `)) as DetailRow[];

        if (!rows.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const r = rows[0];
        const detailId = r.PROJECT_DETAIL_ID;

        const [
            investmentAreas,
            developmentStages,
            projectPartners,
            utilityServiceAreas,
            businessClassifications,
        ] = await Promise.all([
            safeQuery(
                'details:investmentAreas',
                async () => {
                    const j = (await query(`
                        SELECT ia.INVESTMENT_AREA_NAME AS NAME
                        FROM ${T}.PROJECT_HAS_INVESTMENT_AREA pia
                        JOIN ${T}.INVESTMENT_AREA ia
                            ON ia.INVESTMENT_AREA_ID = pia.INVESTMENT_AREA_INVESTMENT_AREA_ID
                        WHERE pia.PROJECT_PROJECT_ID = ${id}
                    `)) as NameRow[];
                    return j.map((x) => x.NAME).filter((x): x is string => !!x);
                },
                [] as string[]
            ),
            safeQuery(
                'details:developmentStages',
                async () => {
                    const j = (await query(`
                        SELECT ds.DEVELOPMENT_STAGE_NAME AS NAME
                        FROM ${T}.PROJECT_HAS_DEVELOPMENT_STAGE phds
                        JOIN ${T}.DEVELOPMENT_STAGE ds
                            ON ds.DEVELOPMENT_STAGE_ID = phds.DEVELOPMENT_STAGE_DEVELOPMENT_STAGE_ID
                        WHERE phds.PROJECT_PROJECT_ID = ${id}
                    `)) as NameRow[];
                    return j.map((x) => x.NAME).filter((x): x is string => !!x);
                },
                [] as string[]
            ),
            safeQuery(
                'details:projectPartners',
                async () => {
                    if (detailId === null) return [] as string[];
                    // Partners live on PROJECT_DETAIL (not PROJECT directly).
                    const j = (await query(`
                        SELECT c.COMPANY_NAME AS NAME
                        FROM ${T}.PROJECT_DETAIL_HAS_PARTNER pdhp
                        JOIN ${T}.COMPANY c ON c.COMPANY_ID = pdhp.COMPANY_COMPANY_ID
                        WHERE pdhp.PROJECT_DETAIL_PROJECT_DETAIL_ID = ${detailId}
                    `)) as NameRow[];
                    return j.map((x) => x.NAME).filter((x): x is string => !!x);
                },
                [] as string[]
            ),
            safeQuery(
                'details:utilityServiceAreas',
                async () => {
                    if (detailId === null) return [] as string[];
                    const j = (await query(`
                        SELECT usa.UTILITY_SERVICE_AREA_NAME AS NAME
                        FROM ${T}.PROJECT_DETAIL_HAS_UTILITY_SERVICE_AREA pdusa
                        JOIN ${T}.UTILITY_SERVICE_AREA usa
                            ON usa.UTILITY_SERVICE_AREA_ID = pdusa.UTILITY_SERVICE_AREA_UTILITY_SERVICE_AREA_ID
                        WHERE pdusa.PROJECT_DETAIL_PROJECT_DETAIL_ID = ${detailId}
                    `)) as NameRow[];
                    return j.map((x) => x.NAME).filter((x): x is string => !!x);
                },
                [] as string[]
            ),
            safeQuery(
                'details:businessClassifications',
                async () => {
                    if (detailId === null) return [] as string[];
                    const j = (await query(`
                        SELECT bc.BUSINESS_CLASSIFICATION_NAME AS NAME
                        FROM ${T}.PROJECT_DETAIL_HAS_BUSINESS_CLASSIFICATION pdbc
                        JOIN ${T}.BUSINESS_CLASSIFICATION bc
                            ON bc.BUSINESS_CLASSIFICATION_ID = pdbc.BUSINESS_CLASSIFICATION_BUSINESS_CLASSIFICATION_ID
                        WHERE pdbc.PROJECT_DETAIL_PROJECT_DETAIL_ID = ${detailId}
                    `)) as NameRow[];
                    return j.map((x) => x.NAME).filter((x): x is string => !!x);
                },
                [] as string[]
            ),
        ]);

        const firstName = r.PERSON_CONTACT_FIRST_NAME?.trim() ?? '';
        const lastName = r.PERSON_CONTACT_LAST_NAME?.trim() ?? '';
        const fullName = `${firstName} ${lastName}`.trim();

        const details: ProjectDetails = {
            projectSummary: r.SUMMARY_PROJECT_DESCRIPTION,
            projectDetailText: r.DETAILED_PROJECT_DESCRIPTION,
            projectUpdate: r.PROJECT_UPDATE,
            deliverables: r.DELIVERABLES,
            keyInnovations: r.KEY_INNOVATIONS,
            keyLearnings: r.KEY_LEARNINGS,
            scalability: r.SCALABILITY,
            gettingToScale: r.GETTING_TO_SCALE,
            statePolicySupport: r.STATE_POLICY_SUPPORT_TEXT,
            technicalBarriers: r.TECHNICAL_BARRIERS,
            marketBarriers: r.MARKET_BARRIERS,
            policyAndRegulatoryBarriers: r.POLICY_AND_REGULATORY_BARRIERS,
            cybersecurityConsiderationsNar: r.CYBER_SECURITY_NARRATIVE,
            // No IS_FINAL_REPORT_EXISTS_AT_SERVER column — presence of URL is the flag
            isFinalReportExistsAtServer: !!r.FINAL_REPORT_URL,
            finalReportUrl: r.FINAL_REPORT_URL,

            contactPersonName: fullName || null,
            contactPersonTitle: r.PERSON_CONTACT_TITLE,
            contactPersonEmail: r.PERSON_CONTACT_EMAIL,
            projectWebsite: r.PROJECT_WEBSITE_ADDRESS_URL,

            senateDistrictBefore: r.SENATE_DISTRICT_NAME,
            assemblyDistrictBefore: r.ASSEMBLY_DISTRICT_NAME,

            standards: toBool(r.STANDARDS),
            cyberSecurityConsiderations: toBool(r.CYBER_SECURITY_CONSIDERATIONS),
            isEnergyEfficiencyWorkpaperProduced: toBool(r.IS_ENERGY_EFFICIENCY_WORKPAPER_PRODUCED),
            communityBenefits: toBool(r.COMMUNITY_BENEFITS),

            // PROJECT_METRIC fields — table exists but columns not yet mapped.
            // Leave as null until DESC TABLE PROJECT_METRIC is run. The Story
            // tab's Project Metrics section will show "No data available." placeholders.
            projectedProjectBenefits: null,
            electricitySystemReliabilityImpacts: null,
            electricitySystemSafetyImpacts: null,
            ghgImpacts: null,
            otherEnvirionmentalImpacts: null,
            ratepayerImpacts: null,
            communityBenefitsDesc: null,
            energyImpacts: null,
            infrastructureCostReductions: null,
            otherImpacts: null,
            informationDissemination: null,

            investmentAreas,
            developmentStages,
            projectPartners,
            utilityServiceAreas,
            businessClassifications,
        };

        return NextResponse.json(details);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[projectDetailPageRoutes/details] failed:', message);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}
