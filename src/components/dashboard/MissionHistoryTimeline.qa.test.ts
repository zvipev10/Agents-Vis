import { describe, expect, it } from 'vitest';
import { buildDashboardResponse } from '../../lib/dashboard-data';

describe('Mission 002 live mission history timeline QA scaffold', () => {
  it('selects the latest mission and preserves the full history payload', () => {
    const dashboard = buildDashboardResponse([
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
    ]);

    expect(dashboard.latestMission?.id).toBe('mission-latest');
    expect(dashboard.latestMission?.isLatest).toBe(true);
    expect(dashboard.missions.map((mission) => mission.id)).toEqual(['mission-latest', 'mission-older']);
    expect(dashboard.summary.total).toBe(2);
  });

  it.todo('renders the last mission as one chronological timeline from earliest event to latest event');
  it.todo('renders parallel actions as visibly concurrent instead of flattening same-timestamp actions');
  it.todo('updates the visible timeline when new events arrive without manual refresh');
  it.todo('shows an explicit stale, delayed, or partial-data state when freshness degrades');
  it.todo('keeps the full history scrollable without introducing a second primary summary view');
});
