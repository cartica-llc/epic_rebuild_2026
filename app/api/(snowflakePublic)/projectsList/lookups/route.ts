import { NextResponse } from 'next/server';
import { query } from '@/lib/snowflake';

const DB = process.env.DEV_SNOWFLAKE_DATABASE;
const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;

interface LookupRow { ID: number; NAME: string; }

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
            query(`SELECT INVESTMENT_AREA_ID AS ID, INVESTMENT_AREA_NAME AS NAME FROM ${t}.INVESTMENT_AREA ORDER BY NAME`),
            query(`SELECT PROJECT_TYPE_ID AS ID, PROJECT_TYPE_NAME AS NAME FROM ${t}.PROJECT_TYPE ORDER BY NAME`),
            query(`SELECT DEVELOPMENT_STAGE_ID AS ID, DEVELOPMENT_STAGE_NAME AS NAME FROM ${t}.DEVELOPMENT_STAGE ORDER BY NAME`),
            query(`SELECT DISTINCT PROJECT_STATUS AS NAME FROM ${t}.PROJECT WHERE PROJECT_STATUS IS NOT NULL ORDER BY NAME`),
            query(`SELECT PROGRAM_ADMIN_ID AS ID, PROGRAM_ADMIN_NAME AS NAME FROM ${t}.PROGRAM_ADMIN ORDER BY NAME`),
            query(`SELECT BUSINESS_CLASSIFICATION_ID AS ID, BUSINESS_CLASSIFICATION_NAME AS NAME FROM ${t}.BUSINESS_CLASSIFICATION ORDER BY NAME`),
            query(`SELECT PERIOD_ID AS ID, PERIOD_NAME AS NAME FROM ${t}.INVESTMENT_PROGRAM_PERIOD ORDER BY NAME`),
            query(`SELECT CPUC_PROCEEDING_ID AS ID, CONCAT('[', CPUC_PROCEEDING_NUMBER, '] - ', CPUC_PROCEEDING_DESC) AS NAME FROM ${t}.CPUC_PROCEEDING ORDER BY CPUC_PROCEEDING_NUMBER`),
            query(`SELECT UTILITY_SERVICE_AREA_ID AS ID, UTILITY_SERVICE_AREA_NAME AS NAME FROM ${t}.UTILITY_SERVICE_AREA ORDER BY NAME`),
            query(`SELECT ASSEMBLY_DISTRICT_ID AS ID, ASSEMBLY_DISTRICT_ID AS NAME FROM ${t}.ASSEMBLY_DISTRICT ORDER BY ID`),
            query(`SELECT SENATE_DISTRICT_ID AS ID, SENATE_DISTRICT_ID AS NAME FROM ${t}.SENATE_DISTRICT ORDER BY ID`),
        ]) as [
            LookupRow[], LookupRow[], LookupRow[],
            { NAME: string }[],
            LookupRow[], LookupRow[], LookupRow[], LookupRow[],
            LookupRow[], LookupRow[], LookupRow[],
        ];

        const mapIdName = (rows: LookupRow[]) =>
            rows.map((r) => ({ id: r.ID, name: r.NAME }));

        const body = {
            investmentAreas: mapIdName(investmentAreas),
            projectTypes: mapIdName(projectTypes),
            developmentStages: mapIdName(developmentStages),
            projectStatuses: (projectStatuses as { NAME: string }[]).map((r) => r.NAME),
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
        res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Lookups query error:', message);
        return NextResponse.json({ error: 'Failed to load filter options' }, { status: 500 });
    }
}