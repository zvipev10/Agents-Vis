import { describe, expect, it } from 'vitest';
import { GET } from './route';
import { assertDashboardResponse } from '../../../lib/dashboard-types';

describe('GET /api/dashboard', () => {
  it('returns a typed read-only dashboard payload', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');

    const payload = assertDashboardResponse(await response.json());

    expect(payload.latestMission?.isLatest).toBe(true);
    expect(payload.missions[0]?.id).toBe(payload.latestMission?.id);
    expect(payload.summary.total).toBeGreaterThan(0);
    expect(payload.source.name).toBe('fixture mission feed');
  });
});
