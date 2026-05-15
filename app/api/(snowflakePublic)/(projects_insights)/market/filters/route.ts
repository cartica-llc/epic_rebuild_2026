// app/api/(snowflakePublic)/(projects_insights)/market/filters/awardbands.ts

import { NextResponse } from 'next/server';
import { MATURITY_ORDER, SIGNAL_BANDS } from '../_marketShared';

export async function GET() {
    const body = {
        maturityStages: [...MATURITY_ORDER],
        signalBands: [...SIGNAL_BANDS],
    };

    const res = NextResponse.json(body);
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
}