// app/api/home/lookups/route.ts

import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { query } from '@/lib/snowflake';

const DB     = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

const CACHE_TTL_SECONDS      = 3600;
const S_MAX_AGE              = CACHE_TTL_SECONDS;
const STALE_WHILE_REVALIDATE = 600;

interface LookupRow {
    ID: number;
    NAME: string;
}

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

const getLookupsData = unstable_cache(
    async () => {
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
        ] = (await Promise.all([
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
        ])) as [
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

        const statusNames = Array.from(
            new Set(
                projectStatuses
                    .map((r) => r.NAME)
                    .filter((s): s is string => typeof s === 'string' && s.length > 0),
            ),
        );

        return {
            investmentAreas:          mapIdName(investmentAreas),
            projectTypes:             mapIdName(projectTypes),
            developmentStages:        mapIdName(developmentStages),
            projectStatuses:          statusNames,
            programAdmins:            mapIdName(programAdmins),
            businessClassifications:  mapIdName(businessClassifications),
            investmentProgramPeriods: mapIdName(investmentProgramPeriods),
            cpucProceedings:          mapIdName(cpucProceedings),
            utilityServiceAreas:      mapIdName(utilityServiceAreas),
            assemblyDistricts:        mapIdName(assemblyDistricts),
            senateDistricts:          mapIdName(senateDistricts),
        };
    },
    ['home:lookups'],
    {
        revalidate: CACHE_TTL_SECONDS,
        // Note: 'lookups' (not 'home-data') because these are shared with
        // filter UIs across the app and shouldn't be invalidated by every
        // project mutation.
        tags: ['lookups'],
    },
);

export async function GET() {
    try {
        const body = await getLookupsData();

        const res = NextResponse.json(body);
        res.headers.set(
            'Cache-Control',
            `public, s-maxage=${S_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
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