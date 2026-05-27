import { NextResponse } from 'next/server';
import { getLatestMissionTimelineResponse } from '../../../../lib/dashboard-service';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(getLatestMissionTimelineResponse(), {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
