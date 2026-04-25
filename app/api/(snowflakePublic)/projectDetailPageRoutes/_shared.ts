// Shared helpers for the project detail page routes.
// Mirrors the patterns in app/api/projectsList/route.ts (safeInt, safeStr)
// since lib/snowflake.ts's query() takes SQL only — values are inlined.

export const DB = process.env.DEV_SNOWFLAKE_DATABASE;
export const SCHEMA = process.env.DEV_SNOWFLAKE_SCHEMA;
export const T = `${DB}.${SCHEMA}`;

export function safeStr(v: string) {
    return v.replace(/'/g, "''");
}

export function safeInt(v: string | number): number | null {
    const n = typeof v === 'number' ? v : parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
}

/**
 * Wraps a query so an individual failure logs a warning and returns a fallback
 * rather than crashing the whole route. Established pattern for junctions.
 */
export async function safeQuery<T>(
    label: string,
    fn: () => Promise<T>,
    fallback: T
): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        console.warn(`[safeQuery:${label}] failed:`, err);
        return fallback;
    }
}

export const toBool = (v: unknown): boolean =>
    v === true || v === 1 || v === '1';

export const toIso = (v: unknown): string | null => {
    if (v == null) return null;
    if (v instanceof Date) return v.toISOString();
    return String(v);
};
