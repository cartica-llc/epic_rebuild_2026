'use client';

import ExcelJS from 'exceljs';

import { formatDate } from './helpers';
import type { ComplianceLevel, ConsistencyFlag, EnrichedProject, Flag } from './types';

const LEVEL_FILL: Record<ComplianceLevel, string> = {
    green: 'FFCCFBF1',
    red: 'FFFFE4E6',
};

const LEVEL_FONT: Record<ComplianceLevel, string> = {
    green: 'FF115E59',
    red: 'FF9F1239',
};

const LEVEL_LABEL: Record<ComplianceLevel, string> = {
    green: 'Compliant',
    red: 'Incomplete',
};

interface ColumnDef {
    header: string;
    key: string;
    width: number;
}

const COLUMNS: ColumnDef[] = [
    { header: 'Project Number',      key: 'projectNumber',     width: 16 },
    { header: 'Project Name',        key: 'projectName',       width: 40 },
    { header: 'Status',              key: 'status',            width: 12 },
    { header: 'EPIC Period',         key: 'epicPeriod',        width: 12 },
    { header: 'Program Admin',       key: 'programAdmin',      width: 30 },
    { header: 'Compliance',          key: 'complianceLevel',   width: 16 },
    { header: 'Fields Filled',       key: 'fieldsFilled',      width: 14 },
    { header: 'Fields Required',     key: 'fieldsRequired',    width: 14 },
    { header: 'Compliance %',        key: 'compliancePct',     width: 14 },
    { header: 'End Date',            key: 'endDate',           width: 14 },
    { header: 'Last Update',         key: 'lastUpdate',        width: 14 },
    { header: 'Flag Count',          key: 'flagCount',         width: 12 },
    { header: 'Flags',               key: 'flags',             width: 40 },
    { header: 'Missing Field Count', key: 'missingCount',      width: 18 },
    { header: 'Missing Fields',      key: 'missingFields',     width: 80 },
];

function stampFor(today: Date): string {
    return (
        today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0')
    );
}

function downloadWorkbook(wb: ExcelJS.Workbook, filename: string): Promise<void> {
    return wb.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function styleHeaderRow(row: ExcelJS.Row): void {
    row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    row.alignment = { vertical: 'middle', horizontal: 'left' };
    row.height = 22;
}

function autoFilterFullSheet(ws: ExcelJS.Worksheet, columnCount: number): void {

    const colLetter = (n: number): string => {
        let s = '';
        let x = n;
        while (x > 0) {
            const rem = (x - 1) % 26;
            s = String.fromCharCode('A'.charCodeAt(0) + rem) + s;
            x = Math.floor((x - 1) / 26);
        }
        return s;
    };
    ws.autoFilter = { from: 'A1', to: `${colLetter(columnCount)}${ws.rowCount}` };
}

export async function exportComplianceToExcel(
    projects: EnrichedProject[],
    today: Date,
): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Cartica EPIC';
    wb.created = today;

    const ws = wb.addWorksheet('Compliance', {
        views: [{ state: 'frozen', ySplit: 1 }],
    });

    ws.columns = COLUMNS.map(({ header, key, width }) => ({ header, key, width }));
    styleHeaderRow(ws.getRow(1));

    projects.forEach((p) => {
        const allMissing = p.compliance.stageResults.flatMap((sr) =>
            sr.missing.map((f) => f.label),
        );
        const flagLabels = p.flags.map((f) => f.label);
        const compliancePct =
            p.compliance.requiredTotal > 0
                ? Math.round((p.compliance.filledTotal / p.compliance.requiredTotal) * 1000) / 10
                : 100;

        const row = ws.addRow({
            projectNumber: p.projectNumber,
            projectName: p.projectName,
            status: p.projectStatus,
            epicPeriod: p.epicPeriod,
            programAdmin: p.programAdmin,
            complianceLevel: LEVEL_LABEL[p.compliance.level],
            fieldsFilled: p.compliance.filledTotal,
            fieldsRequired: p.compliance.requiredTotal,
            compliancePct,
            endDate: p.endDate ? formatDate(p.endDate) : '',
            lastUpdate: p.lastUpdate ? formatDate(p.lastUpdate) : '',
            flagCount: p.flags.length,
            flags: flagLabels.join(', '),
            missingCount: allMissing.length,
            missingFields: allMissing.join(', '),
        });

        const levelCell = row.getCell('complianceLevel');
        levelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: LEVEL_FILL[p.compliance.level] },
        };
        levelCell.font = { color: { argb: LEVEL_FONT[p.compliance.level] }, bold: true };
        levelCell.alignment = { horizontal: 'center' };

        row.getCell('compliancePct').numFmt = '0.0"%"';
    });

    autoFilterFullSheet(ws, COLUMNS.length);

    await downloadWorkbook(wb, `compliance-export-${stampFor(today)}.xlsx`);
}

const PROJECT_ID_COLUMNS: ColumnDef[] = [
    { header: 'Project Number', key: 'projectNumber', width: 16 },
    { header: 'Project Name',   key: 'projectName',   width: 40 },
    { header: 'Status',         key: 'status',        width: 12 },
    { header: 'EPIC Period',    key: 'epicPeriod',     width: 12 },
    { header: 'Program Admin',  key: 'programAdmin',  width: 30 },
];

function projectIdRowValues(p: EnrichedProject): Record<string, unknown> {
    return {
        projectNumber: p.projectNumber,
        projectName: p.projectName,
        status: p.projectStatus,
        epicPeriod: p.epicPeriod,
        programAdmin: p.programAdmin,
    };
}

interface FlagLikeRow {
    project: EnrichedProject;
    issueLabel: string;
    detail: string;
}

async function exportFlagLikeToExcel(
    sheetName: string,
    filenamePrefix: string,
    rows: FlagLikeRow[],
    today: Date,
): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Cartica EPIC';
    wb.created = today;

    const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });

    const columns: ColumnDef[] = [
        ...PROJECT_ID_COLUMNS,
        { header: 'Issue', key: 'issueLabel', width: 24 },
        { header: 'Detail', key: 'detail', width: 70 },
    ];
    ws.columns = columns.map(({ header, key, width }) => ({ header, key, width }));
    styleHeaderRow(ws.getRow(1));

    rows.forEach(({ project, issueLabel, detail }) => {
        ws.addRow({ ...projectIdRowValues(project), issueLabel, detail });
    });

    autoFilterFullSheet(ws, columns.length);

    await downloadWorkbook(wb, `${filenamePrefix}-${stampFor(today)}.xlsx`);
}

export function exportOperationalFlagsToExcel(
    rows: { project: EnrichedProject; flag: Flag }[],
    today: Date,
): Promise<void> {
    return exportFlagLikeToExcel(
        'Operational Flags',
        'operational-flags',
        rows.map((r) => ({ project: r.project, issueLabel: r.flag.label, detail: r.flag.detail })),
        today,
    );
}

export function exportDataConsistencyToExcel(
    rows: { project: EnrichedProject; flag: ConsistencyFlag }[],
    today: Date,
): Promise<void> {
    return exportFlagLikeToExcel(
        'Data Consistency',
        'data-consistency',
        rows.map((r) => ({ project: r.project, issueLabel: r.flag.label, detail: r.flag.detail })),
        today,
    );
}

export interface NarrativeFieldIssueRow {
    project: EnrichedProject;
    fieldLabel: string;
    issue: 'Missing' | 'Weak';
    score: number | null;
}

export async function exportNarrativeFieldIssuesToExcel(
    rows: NarrativeFieldIssueRow[],
    today: Date,
): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Cartica EPIC';
    wb.created = today;

    const ws = wb.addWorksheet('Narrative Field Quality', { views: [{ state: 'frozen', ySplit: 1 }] });

    const columns: ColumnDef[] = [
        ...PROJECT_ID_COLUMNS,
        { header: 'Field', key: 'fieldLabel', width: 32 },
        { header: 'Issue', key: 'issue', width: 12 },
        { header: 'Score (0-5)', key: 'score', width: 12 },
    ];
    ws.columns = columns.map(({ header, key, width }) => ({ header, key, width }));
    styleHeaderRow(ws.getRow(1));

    rows.forEach(({ project, fieldLabel, issue, score }) => {
        ws.addRow({ ...projectIdRowValues(project), fieldLabel, issue, score: score ?? '' });
    });

    autoFilterFullSheet(ws, columns.length);

    await downloadWorkbook(wb, `narrative-field-quality-${stampFor(today)}.xlsx`);
}

export interface CompletenessFieldIssueRow {
    project: EnrichedProject;
    fieldLabel: string;
    tier: string;
}

export async function exportCompletenessFieldIssuesToExcel(
    rows: CompletenessFieldIssueRow[],
    today: Date,
): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Cartica EPIC';
    wb.created = today;

    const ws = wb.addWorksheet('Completeness by Field', { views: [{ state: 'frozen', ySplit: 1 }] });

    const columns: ColumnDef[] = [
        ...PROJECT_ID_COLUMNS,
        { header: 'Field', key: 'fieldLabel', width: 36 },
        { header: 'Tier', key: 'tier', width: 12 },
    ];
    ws.columns = columns.map(({ header, key, width }) => ({ header, key, width }));
    styleHeaderRow(ws.getRow(1));

    rows.forEach(({ project, fieldLabel, tier }) => {
        ws.addRow({ ...projectIdRowValues(project), fieldLabel, tier });
    });

    autoFilterFullSheet(ws, columns.length);

    await downloadWorkbook(wb, `completeness-by-field-${stampFor(today)}.xlsx`);
}