import { describe, expect, it } from 'vitest';
import { GET } from './route';
import { assertMissionTimelineResponse } from '../../../../lib/dashboard-types';

describe('GET /api/missions/latest', () => {
  it('returns the latest mission timeline with ordered events and freshness metadata', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');

    const payload = assertMissionTimelineResponse(await response.json());

    expect(payload.mission?.id).toBe('mission-003');
    expect(payload.eventCount).toBe(payload.events.length);
    expect(payload.events.map((event) => event.timestamp)).toEqual([
      '2026-05-26T07:52:00.000Z',
      '2026-05-26T07:53:00.000Z',
      '2026-05-26T07:53:00.000Z',
      '2026-05-26T07:54:00.000Z',
      '2026-05-26T07:55:00.000Z',
    ]);
    expect(payload.events[1]?.parallelGroupId).toBe('mission-003-parallel-01');
    expect(payload.events[2]?.parallelOrder).toBe(1);
    expect(['fresh', 'delayed', 'stale']).toContain(payload.freshnessState);
    expect(payload.source.name).toBe('canonical production live source');
  });
});
