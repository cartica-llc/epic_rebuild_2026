// app/api/home/lookups/awardbands.ts


import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

interface LookupRow {
    ID: number;
    NAME: string;
}

/**
 * Drop rows with null ids and any duplicate ids. React crashes with
 * "two children with the same key" when a <select>'s options contain
 * a repeated id, so we defend at the source.
 */
function dedupeById(rows: LookupRow[]): LookupRow[] {
    const seen = new Set<number>();
    const out: LookupRow[] = [];
    for (const r of rows) {
        if (r.ID == null || seen.has(r.ID)) continue;
        seen.add(r.ID);
        out.push(r);
    }
    return out;
}

export async function GET() {
    try {
        const t = `${DB}.${SCHEMA}`;

        const [
            investmentAreas,
            projectTypes,
            developmentStages,
            projectStatuses,
            programAdmins,
            businessClassifications,
            investmentProgramPeriods,
            cpucProceedings,
            utilityServiceAreas,
            assemblyDistricts,
            senateDistricts,
        ] = await Promise.all([
            query(
                `SELECT INVESTMENT_AREA_ID AS ID, INVESTMENT_AREA_NAME AS NAME
                 FROM ${t}.INVESTMENT_AREA
                 WHERE INVESTMENT_AREA_ID IS NOT NULL
                 ORDER BY NAME`,
            ),
            query(
                `SELECT PROJECT_TYPE_ID AS ID, PROJECT_TYPE_NAME AS NAME
                 FROM ${t}.PROJECT_TYPE
                 WHERE PROJECT_TYPE_ID IS NOT NULL
                 ORDER BY NAME`,
            ),
            query(
                `SELECT DEVELOPMENT_STAGE_ID AS ID, DEVELOPMENT_STAGE_NAME AS NAME
                 FROM ${t}.DEVELOPMENT_STAGE
                 WHERE DEVELOPMENT_STAGE_ID IS NOT NULL
                 ORDER BY NAME`,
            ),
            query(
                `SELECT DISTINCT PROJECT_STATUS AS NAME
                 FROM ${t}.PROJECT
                 WHERE PROJECT_STATUS IS NOT NULL
                 ORDER BY NAME`,
            ),
            query(
                `SELECT PROGRAM_ADMIN_ID AS ID, PROGRAM_ADMIN_NAME AS NAME
                 FROM ${t}.PROGRAM_ADMIN
                 WHERE PROGRAM_ADMIN_ID IS NOT NULL
                 ORDER BY NAME`,
            ),
            query(
                `SELECT BUSINESS_CLASSIFICATION_ID AS ID, BUSINESS_CLASSIFICATION_NAME AS NAME
                 FROM ${t}.BUSINESS_CLASSIFICATION
                 WHERE BUSINESS_CLASSIFICATION_ID IS NOT NULL
                 ORDER BY NAME`,
            ),
            query(
                `SELECT PERIOD_ID AS ID, PERIOD_NAME AS NAME
                 FROM ${t}.INVESTMENT_PROGRAM_PERIOD
                 WHERE PERIOD_ID IS NOT NULL
                 ORDER BY NAME`,
            ),
            query(
                `SELECT CPUC_PROCEEDING_ID AS ID,
                        CONCAT('[', CPUC_PROCEEDING_NUMBER, '] - ', CPUC_PROCEEDING_DESC) AS NAME
                 FROM ${t}.CPUC_PROCEEDING
                 WHERE CPUC_PROCEEDING_ID IS NOT NULL
                 ORDER BY CPUC_PROCEEDING_NUMBER`,
            ),
            query(
                `SELECT UTILITY_SERVICE_AREA_ID AS ID, UTILITY_SERVICE_AREA_NAME AS NAME
                 FROM ${t}.UTILITY_SERVICE_AREA
                 WHERE UTILITY_SERVICE_AREA_ID IS NOT NULL
                 ORDER BY NAME`,
            ),
            // DISTINCT guards against duplicate district rows in the source
            query(
                `SELECT DISTINCT ASSEMBLY_DISTRICT_ID AS ID, ASSEMBLY_DISTRICT_ID AS NAME
                 FROM ${t}.ASSEMBLY_DISTRICT
                 WHERE ASSEMBLY_DISTRICT_ID IS NOT NULL
                 ORDER BY ID`,
            ),
            query(
                `SELECT DISTINCT SENATE_DISTRICT_ID AS ID, SENATE_DISTRICT_ID AS NAME
                 FROM ${t}.SENATE_DISTRICT
                 WHERE SENATE_DISTRICT_ID IS NOT NULL
                 ORDER BY ID`,
            ),
        ]) as [
            LookupRow[],
            LookupRow[],
            LookupRow[],
            { NAME: string }[],
            LookupRow[],
            LookupRow[],
            LookupRow[],
            LookupRow[],
            LookupRow[],
            LookupRow[],
            LookupRow[],
        ];

        const mapIdName = (rows: LookupRow[]) =>
            dedupeById(rows).map((r) => ({ id: r.ID, name: r.NAME }));

        // Status is a string list — dedupe by string value, drop empties
        const statusNames = Array.from(
            new Set(
                (projectStatuses as { NAME: string }[])
                    .map((r) => r.NAME)
                    .filter((s): s is string => typeof s === 'string' && s.length > 0),
            ),
        );

        const body = {
            investmentAreas: mapIdName(investmentAreas),
            projectTypes: mapIdName(projectTypes),
            developmentStages: mapIdName(developmentStages),
            projectStatuses: statusNames,
            programAdmins: mapIdName(programAdmins),
            businessClassifications: mapIdName(businessClassifications),
            investmentProgramPeriods: mapIdName(investmentProgramPeriods),
            cpucProceedings: mapIdName(cpucProceedings),
            utilityServiceAreas: mapIdName(utilityServiceAreas),
            assemblyDistricts: mapIdName(assemblyDistricts),
            senateDistricts: mapIdName(senateDistricts),
        };

        const res = NextResponse.json(body);

        // Cache for 5 minutes on CDN, serve stale while revalidating
        res.headers.set(
            'Cache-Control',
            'public, s-maxage=300, stale-while-revalidate=600',
        );

        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Home lookups query error:', message);
        return NextResponse.json(
            { error: 'Failed to load filter options' },
            { status: 500 },
        );
    }
}