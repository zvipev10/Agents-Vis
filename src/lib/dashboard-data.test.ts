import { describe, expect, it } from 'vitest';
import { buildDashboardResponse } from './dashboard-data';

const records = [
  {
    id: 'mission-older',
    title: 'Stabilize the dashboard contract',
    status: 'completed',
    updatedAt: '2026-05-26T09:55:00.000Z',
    actorName: 'Mira',
    actorRole: 'Backend Developer',
    action: 'validated the typed response contract',
    detail: 'Added runtime checks and graceful fallbacks for partial source data.',
  },
  {
    id: 'mission-latest',
    title: 'Reconnect the visibility brief',
    status: 'running',
    updatedAt: '2026-05-26T10:05:00.000Z',
    actorName: 'Ari',
    actorRole: 'Coordinator',
    action: 'reframed the delivery gates',
    detail: 'Clarified the privacy, read-only, and preview-first expectations for the visibility application.',
  },
  {
    id: 'mission-partial',
    title: 'Finalize visibility polish',
    status: 'completed',
    updatedAt: 'not-a-date',
    actorName: null,
    actorRole: null,
    action: null,
    detail: null,
    summary: 'The latest pass is still being reconciled after hardening.',
  },
] as const;

describe('buildDashboardResponse', () => {
  it('prefers the most recent valid timestamp and keeps invalid timestamps at the end', () => {
    const dashboard = buildDashboardResponse(records);

    expect(dashboard.latestMission?.id).toBe('mission-latest');
    expect(dashboard.missions.map((mission) => mission.id)).toEqual([
      'mission-latest',
      'mission-older',
      'mission-partial',
    ]);
    expect(dashboard.missions[0]?.isLatest).toBe(true);
    expect(dashboard.missions[1]?.isLatest).toBe(false);
    expect(dashboard.missions[2]?.isLatest).toBe(false);
    expect(dashboard.source.updatedAt).toBe('2026-05-26T10:05:00.000Z');
  });

  it('applies fallback text and partial-source markers when fields are missing', () => {
    const dashboard = buildDashboardResponse([records[2]]);

    expect(dashboard.latestMission?.actorName).toBe('Unknown agent');
    expect(dashboard.latestMission?.actorRole).toBeNull();
    expect(dashboard.latestMission?.action).toBe('The latest pass is still being reconciled after hardening.');
    expect(dashboard.latestMission?.detail).toBe('The latest pass is still being reconciled after hardening.');
    expect(dashboard.latestMission?.isPartial).toBe(true);
    expect(dashboard.source.freshness).toBe('partial');
    expect(dashboard.summary.partial).toBe(1);
  });

  it('returns an empty payload when there are no missions', () => {
    const dashboard = buildDashboardResponse([]);

    expect(dashboard.latestMission).toBeNull();
    expect(dashboard.missions).toEqual([]);
    expect(dashboard.summary).toEqual({ total: 0, running: 0, completed: 0, partial: 0 });
    expect(dashboard.source.freshness).toBe('empty');
    expect(dashboard.source.updatedAt).toBeNull();
  });
});
