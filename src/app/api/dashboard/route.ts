import { NextResponse } from 'next/server';
import { getDashboardResponse } from '../../../lib/dashboard-service';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(getDashboardResponse(), {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}