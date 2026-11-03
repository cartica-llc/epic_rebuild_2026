// components/dashboard/compliance/exportExcel.ts

'use client';

import ExcelJS from 'exceljs';

import { STAGE_REQUIREMENTS } from './fieldRequirements';
import { applicableStages, formatDate, isCompletedStatus, isRequiredField, stageCompliance } from './helpers';
import type { ComplianceLevel, ConsistencyFlag, EnrichedProject, Flag, StageName } from './types';

// ── Palette ──────────────────────────────────────────────────────────

const HEADER_FILL = 'FF0F172A';
const HEADER_FONT = 'FFFFFFFF';

const OK_FILL = 'FFDCFCE7';
const OK_FONT = 'FF166534';
const BAD_FILL = 'FFFEE2E2';
const BAD_FONT = 'FF991B1B';
const WARN_FILL = 'FFFEF3C7';
const WARN_FONT = 'FF92400E';
const NA_FILL = 'FFF8FAFC';
const NA_FONT = 'FF94A3B8';
const PENDING_FILL = 'FFFEF9C3';
const PENDING_FONT = 'FF854D0E';
const ZEBRA_FILL = 'FFF8FAFC';
const STAGE_BAND_FILL = 'FFE2E8F0';
const MUTED_FONT = 'FF94A3B8';

const LEVEL_LABEL: Record<ComplianceLevel, string> = {
    green: 'Yes',
    red: 'No',
};

interface ColumnDef {
    header: string;
    key: string;
    width: number;
}

// ── Small utilities ──────────────────────────────────────────────────

function stageKey(stage: StageName): string {
    return stage
        .replace(/[^A-Za-z0-9]+/g, ' ')
        .trim()
        .split(' ')
        .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
}

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
    row.font = { bold: true, color: { argb: HEADER_FONT }, size: 11 };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    row.height = 32;
}

function colLetter(n: number): string {
    let s = '';
    let x = n;
    while (x > 0) {
        const rem = (x - 1) % 26;
        s = String.fromCharCode('A'.charCodeAt(0) + rem) + s;
        x = Math.floor((x - 1) / 26);
    }
    return s;
}

function autoFilterFullSheet(ws: ExcelJS.Worksheet, columnCount: number): void {
    ws.autoFilter = { from: 'A1', to: `${colLetter(columnCount)}${ws.rowCount}` };
}

function paint(cell: ExcelJS.Cell, fill: string, font: string, bold = false): void {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    cell.font = { color: { argb: font }, bold };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
}

function zebra(row: ExcelJS.Row, keys: string[]): void {
    if (row.number % 2 === 0) return;
    for (const k of keys) {
        const cell = row.getCell(k);
        if (!cell.fill || (cell.fill as ExcelJS.FillPattern).fgColor === undefined) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_FILL } };
        }
    }
}

// ── Per-project derivations ──────────────────────────────────────────

type StageState =
    | { kind: 'ok'; total: number }
    | { kind: 'missing'; missing: number; total: number; labels: string[] }
    | { kind: 'na' };

function stageStates(p: EnrichedProject, today: Date): Record<StageName, StageState> {
    const stages = applicableStages(p.projectStatus, p.projectStartDate, today);
    const out = {} as Record<StageName, StageState>;
    for (const def of STAGE_REQUIREMENTS) {
        if (!stages.includes(def.stage)) {
            out[def.stage] = { kind: 'na' };
            continue;
        }
        const { missing, total } = stageCompliance(p, def);
        out[def.stage] =
            missing.length === 0
                ? { kind: 'ok', total }
                : { kind: 'missing', missing: missing.length, total, labels: missing.map((f) => f.label) };
    }
    return out;
}

function stageCellText(s: StageState): string {
    if (s.kind === 'ok') return '✓';
    if (s.kind === 'missing') return `${s.missing} missing`;
    return '—';
}

type FirstAnnualState = 'due' | 'completed' | 'pending' | 'unknown';

function firstAnnualState(p: EnrichedProject, today: Date): FirstAnnualState {
    if (isCompletedStatus(p.projectStatus)) return 'completed';
    const stages = applicableStages(p.projectStatus, p.projectStartDate, today);
    if (stages.includes('After 1st Annual')) return 'due';
    return p.compliance.firstAnnualDueDate ? 'pending' : 'unknown';
}

function firstAnnualText(p: EnrichedProject, state: FirstAnnualState): string {
    switch (state) {
        case 'due':
            return 'Due';
        case 'completed':
            return 'Completed';
        case 'pending':
            return `Due ${formatDate(p.compliance.firstAnnualDueDate!)}`;
        case 'unknown':
            return 'No start date';
    }
}

// ── Sheet 1: Overview ────────────────────────────────────────────────

function buildOverviewSheet(wb: ExcelJS.Workbook, projects: EnrichedProject[], today: Date): void {
    const ws = wb.addWorksheet('Overview');
    ws.columns = [
        { key: 'label', width: 46 },
        { key: 'value', width: 14 },
        { key: 'note', width: 60 },
    ];

    const title = ws.addRow(['EPIC Compliance Export', '', `Generated ${formatDate(today)}`]);
    title.font = { bold: true, size: 14 };
    ws.addRow([]);

    const compliant = projects.filter((p) => p.compliance.level === 'green').length;
    const flagged = projects.filter((p) => p.flags.length > 0).length;

    const faStates = projects.map((p) => firstAnnualState(p, today));
    const faDue = faStates.filter((s) => s === 'due').length;
    const faCompleted = faStates.filter((s) => s === 'completed').length;
    const faPending = faStates.filter((s) => s === 'pending').length;
    const faUnknown = faStates.filter((s) => s === 'unknown').length;

    const section = (text: string) => {
        const r = ws.addRow([text]);
        r.font = { bold: true, color: { argb: HEADER_FONT } };
        for (let c = 1; c <= 3; c++) {
            r.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
        }
    };
    const line = (label: string, value: number | string, note = '') => {
        const r = ws.addRow([label, value, note]);
        r.getCell(2).alignment = { horizontal: 'right' };
        r.getCell(3).font = { color: { argb: 'FF64748B' }, italic: true };
    };

    section('Portfolio');
    line('Projects in export', projects.length);
    line('Compliant', compliant, 'Every required field filled for the stages that currently apply');
    line('Incomplete', projects.length - compliant);
    line('With operational flags', flagged, 'Past end date, stale, closed incomplete, etc.');
    ws.addRow([]);

    section('First annual report');
    line('Past first annual — fields required', faDue, 'Started in a prior year and today is on/after June 1 of the following year');
    line('Not yet due', faPending, 'Fields are tracked but do not count against compliance yet');
    line('Completed projects', faCompleted, 'All stages required');
    if (faUnknown > 0) line('No start date on record', faUnknown, 'Cannot compute the due date');
    ws.addRow([]);

    section('Projects with gaps, by stage');
    for (const def of STAGE_REQUIREMENTS) {
        let applicable = 0;
        let withGaps = 0;
        for (const p of projects) {
            const s = stageStates(p, today)[def.stage];
            if (s.kind === 'na') continue;
            applicable++;
            if (s.kind === 'missing') withGaps++;
        }
        const requiredCount = def.fields.filter(isRequiredField).length;
        line(def.stage, withGaps, `of ${applicable} projects where this stage applies · ${requiredCount} required fields`);
    }
    ws.addRow([]);

    const foot = ws.addRow([
        'Tabs: Projects (one row per project) · Missing Fields (field-level list) · Required Fields (what is checked, whether it is required, and how each field is doing)',
    ]);
    foot.font = { italic: true, color: { argb: 'FF64748B' } };
}

// ── Sheet 2: Projects ────────────────────────────────────────────────

const PROJECT_COLUMNS: ColumnDef[] = [
    { header: 'Project #',      key: 'projectNumber', width: 15 },
    { header: 'Project Name',   key: 'projectName',   width: 44 },
    { header: 'Status',         key: 'status',        width: 11 },
    { header: 'Program Admin',  key: 'programAdmin',  width: 28 },
    { header: 'Period',         key: 'epicPeriod',    width: 9 },
    { header: 'Compliant?',     key: 'compliant',     width: 11 },
    { header: 'Fields',         key: 'fields',        width: 16 },
    { header: '1st Annual',     key: 'firstAnnual',   width: 17 },
    ...STAGE_REQUIREMENTS.map((s) => ({ header: s.stage, key: stageKey(s.stage), width: 14 })),
    { header: 'Flags',          key: 'flags',         width: 34 },
    { header: 'Last Update',    key: 'lastUpdate',    width: 13 },
];

function buildProjectsSheet(wb: ExcelJS.Workbook, projects: EnrichedProject[], today: Date): void {
    const ws = wb.addWorksheet('Projects', {
        views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }],
    });
    ws.columns = PROJECT_COLUMNS.map(({ header, key, width }) => ({ header, key, width }));
    styleHeaderRow(ws.getRow(1));

    const plainKeys = PROJECT_COLUMNS.map((c) => c.key).filter(
        (k) => k !== 'compliant' && k !== 'firstAnnual' && !STAGE_REQUIREMENTS.some((s) => stageKey(s.stage) === k),
    );

    for (const p of projects) {
        const states = stageStates(p, today);
        const fa = firstAnnualState(p, today);
        const pct =
            p.compliance.requiredTotal > 0
                ? Math.round((p.compliance.filledTotal / p.compliance.requiredTotal) * 100)
                : 100;

        const values: Record<string, unknown> = {
            projectNumber: p.projectNumber,
            projectName: p.projectName,
            status: p.projectStatus,
            programAdmin: p.programAdmin,
            epicPeriod: p.epicPeriod,
            compliant: LEVEL_LABEL[p.compliance.level],
            fields: `${p.compliance.filledTotal} / ${p.compliance.requiredTotal}  (${pct}%)`,
            firstAnnual: firstAnnualText(p, fa),
            flags: p.flags.map((f) => f.label).join(', '),
            lastUpdate: p.lastUpdate ? formatDate(p.lastUpdate) : '',
        };
        for (const def of STAGE_REQUIREMENTS) {
            values[stageKey(def.stage)] = stageCellText(states[def.stage]);
        }

        const row = ws.addRow(values);
        row.height = 18;
        row.getCell('fields').alignment = { horizontal: 'center' };

        const compliantCell = row.getCell('compliant');
        if (p.compliance.level === 'green') paint(compliantCell, OK_FILL, OK_FONT, true);
        else paint(compliantCell, BAD_FILL, BAD_FONT, true);

        const faCell = row.getCell('firstAnnual');
        if (fa === 'due' || fa === 'completed') paint(faCell, OK_FILL, OK_FONT);
        else if (fa === 'pending') paint(faCell, PENDING_FILL, PENDING_FONT);
        else paint(faCell, NA_FILL, NA_FONT);

        for (const def of STAGE_REQUIREMENTS) {
            const cell = row.getCell(stageKey(def.stage));
            const s = states[def.stage];
            if (s.kind === 'ok') paint(cell, OK_FILL, OK_FONT, true);
            else if (s.kind === 'missing') {
                paint(cell, BAD_FILL, BAD_FONT, true);
                cell.note = s.labels.join('\n');
            } else paint(cell, NA_FILL, NA_FONT);
        }

        zebra(row, plainKeys);
    }

    autoFilterFullSheet(ws, PROJECT_COLUMNS.length);
}

// ── Sheet 3: Missing Fields ──────────────────────────────────────────

const MISSING_COLUMNS: ColumnDef[] = [
    { header: 'Project #',     key: 'projectNumber', width: 15 },
    { header: 'Project Name',  key: 'projectName',   width: 44 },
    { header: 'Program Admin', key: 'programAdmin',  width: 28 },
    { header: 'Stage',         key: 'stage',         width: 17 },
    { header: 'Missing Field', key: 'fieldLabel',    width: 34 },
    { header: 'Required',      key: 'required',      width: 10 },
    { header: 'Cadence',       key: 'cadence',       width: 11 },
];

function buildMissingSheet(wb: ExcelJS.Workbook, projects: EnrichedProject[], today: Date): void {
    const ws = wb.addWorksheet('Missing Fields', {
        views: [{ state: 'frozen', ySplit: 1 }],
    });
    ws.columns = MISSING_COLUMNS.map(({ header, key, width }) => ({ header, key, width }));
    styleHeaderRow(ws.getRow(1));
    ws.getRow(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    for (const p of projects) {
        const stages = applicableStages(p.projectStatus, p.projectStartDate, today);
        let firstRowForProject = true;
        for (const def of STAGE_REQUIREMENTS) {
            if (!stages.includes(def.stage)) continue;
            const { missing, optionalMissing } = stageCompliance(p, def);

            // Required gaps first, then optional ones (greyed) so they're visible but clearly not failures.
            const entries = [
                ...missing.map((f) => ({ f, required: true })),
                ...optionalMissing.map((f) => ({ f, required: false })),
            ];

            for (const { f, required } of entries) {
                const row = ws.addRow({
                    projectNumber: p.projectNumber,
                    projectName: p.projectName,
                    programAdmin: p.programAdmin,
                    stage: def.stage,
                    fieldLabel: f.label,
                    required: required ? 'Yes' : 'No',
                    cadence: f.cadence,
                });

                const reqCell = row.getCell('required');
                if (required) paint(reqCell, BAD_FILL, BAD_FONT, true);
                else {
                    paint(reqCell, NA_FILL, NA_FONT);
                    row.getCell('fieldLabel').font = { color: { argb: MUTED_FONT } };
                }

                if (firstRowForProject) {
                    row.getCell('projectNumber').font = { bold: true };
                    row.getCell('projectName').font = { bold: true };
                    firstRowForProject = false;
                } else {
                    row.getCell('projectName').font = { color: { argb: MUTED_FONT } };
                }
            }
        }
    }

    autoFilterFullSheet(ws, MISSING_COLUMNS.length);
}

// ── Sheet 4: Required Fields (the checklist — source of truth) ───────

const REQUIRED_COLUMNS: ColumnDef[] = [
    { header: '#',                       key: 'n',           width: 5 },
    { header: 'Stage',                   key: 'stage',       width: 17 },
    { header: 'Field',                   key: 'label',       width: 34 },
    { header: 'Required',                key: 'required',    width: 10 },
    { header: 'What counts as complete', key: 'description', width: 52 },
    { header: 'Cadence',                 key: 'cadence',     width: 11 },
    { header: 'Applies to',              key: 'applicable',  width: 11 },
    { header: 'Filled',                  key: 'filled',      width: 9 },
    { header: 'Missing',                 key: 'missing',     width: 9 },
    { header: '% Complete',              key: 'pct',         width: 11 },
];

const STAGE_WHEN: Record<StageName, string> = {
    Entry: 'Always — as soon as the project is in the database',
    Active: 'Always — as soon as the project is in the database',
    'After 1st Annual': 'From June 1 of the year after the start year, or once Completed',
    Closeout: 'Once the project is Completed',
};

function buildRequiredFieldsSheet(wb: ExcelJS.Workbook, projects: EnrichedProject[], today: Date): void {
    const ws = wb.addWorksheet('Required Fields', {
        views: [{ state: 'frozen', ySplit: 1 }],
    });
    ws.columns = REQUIRED_COLUMNS.map(({ header, key, width }) => ({ header, key, width }));
    styleHeaderRow(ws.getRow(1));

    const applicableByProject = projects.map((p) => ({
        p,
        stages: new Set(applicableStages(p.projectStatus, p.projectStartDate, today)),
    }));

    let n = 0;
    for (const def of STAGE_REQUIREMENTS) {
        const requiredCount = def.fields.filter(isRequiredField).length;
        const optionalCount = def.fields.length - requiredCount;

        const band = ws.addRow({
            stage: def.stage,
            label: optionalCount > 0 ? `${requiredCount} required · ${optionalCount} optional` : `${requiredCount} required`,
            description: STAGE_WHEN[def.stage],
        });
        band.font = { bold: true, color: { argb: 'FF0F172A' } };
        for (let c = 1; c <= REQUIRED_COLUMNS.length; c++) {
            band.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STAGE_BAND_FILL } };
        }
        band.height = 20;

        for (const f of def.fields) {
            n++;
            const required = isRequiredField(f);
            const inScope = applicableByProject.filter(({ stages }) => stages.has(def.stage));
            const filled = inScope.filter(({ p }) => p.fieldStatus[f.key]).length;
            const applicable = inScope.length;
            const missing = applicable - filled;
            const pct = applicable > 0 ? Math.round((filled / applicable) * 100) : 100;

            const row = ws.addRow({
                n,
                stage: def.stage,
                label: f.label,
                required: required ? 'Yes' : 'No',
                description: f.description,
                cadence: f.cadence,
                applicable,
                filled,
                missing,
                pct: pct / 100,
            });

            row.getCell('description').alignment = { wrapText: true, vertical: 'top' };
            for (const k of ['n', 'applicable', 'filled', 'missing'] as const) {
                row.getCell(k).alignment = { horizontal: 'center' };
            }

            const reqCell = row.getCell('required');
            if (required) paint(reqCell, OK_FILL, OK_FONT, true);
            else {
                paint(reqCell, NA_FILL, NA_FONT);
                row.getCell('label').font = { color: { argb: MUTED_FONT } };
            }

            const pctCell = row.getCell('pct');
            if (!required) paint(pctCell, NA_FILL, NA_FONT);
            else if (pct >= 90) paint(pctCell, OK_FILL, OK_FONT, true);
            else if (pct >= 70) paint(pctCell, WARN_FILL, WARN_FONT, true);
            else paint(pctCell, BAD_FILL, BAD_FONT, true);
            pctCell.numFmt = '0%';
        }
    }

    autoFilterFullSheet(ws, REQUIRED_COLUMNS.length);
}

// ── Main export ──────────────────────────────────────────────────────

export async function exportComplianceToExcel(
    projects: EnrichedProject[],
    today: Date,
): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Cartica EPIC';
    wb.created = today;

    buildOverviewSheet(wb, projects, today);
    buildProjectsSheet(wb, projects, today);
    buildMissingSheet(wb, projects, today);
    buildRequiredFieldsSheet(wb, projects, today);

    await downloadWorkbook(wb, `compliance-export-${stampFor(today)}.xlsx`);
}

// ── Section-level exports (unchanged) ────────────────────────────────

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