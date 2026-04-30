// components/dashboard/compliance/exportExcel.ts
'use client';

import ExcelJS from 'exceljs';

import { formatDate } from './helpers';
import type { ComplianceLevel, EnrichedProject } from './types';

const LEVEL_FILL: Record<ComplianceLevel, string> = {
    green: 'FFCCFBF1',  // teal-100
    red: 'FFFFE4E6',    // rose-100
};

const LEVEL_FONT: Record<ComplianceLevel, string> = {
    green: 'FF115E59',  // teal-800
    red: 'FF9F1239',    // rose-800
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

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
    headerRow.height = 22;

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

    const lastCol = String.fromCharCode('A'.charCodeAt(0) + COLUMNS.length - 1);
    ws.autoFilter = {
        from: 'A1',
        to: `${lastCol}${ws.rowCount}`,
    };

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const stamp =
        today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0');
    const filename = `compliance-export-${stamp}.xlsx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}