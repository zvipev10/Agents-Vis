import { NextResponse } from 'next/server';
import { getDashboardResponse } from '../../../lib/dashboard-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await getDashboardResponse(), {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
