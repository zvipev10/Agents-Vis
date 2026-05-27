import { describe, expect, it } from 'vitest';
import { buildDashboardResponse, buildMissionTimelineResponse } from './dashboard-data';

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

const missionLatestEvents = [
  {
    id: 'latest-event-1',
    missionId: 'mission-latest',
    actorName: 'Ari',
    actorRole: 'Coordinator',
    action: 'published the live replay contract',
    timestamp: '2026-05-26T10:04:00.000Z',
    sequenceIndex: 1,
    sourceLabel: 'repository-backed live source',
  },
  {
    id: 'latest-event-2',
    missionId: 'mission-latest',
    actorName: 'Mira',
    actorRole: 'Backend Developer',
    action: 'wired the ordered event stream',
    timestamp: '2026-05-26T10:05:00.000Z',
    sequenceIndex: 2,
    parallelGroupId: 'latest-parallel-01',
    parallelOrder: 0,
    parallelSize: 2,
    sourceLabel: 'repository-backed live source',
  },
  {
    id: 'latest-event-3',
    missionId: 'mission-latest',
    actorName: 'Theo',
    actorRole: 'Frontend Developer',
    action: 'prepared the concurrent branch markers',
    timestamp: '2026-05-26T10:05:00.000Z',
    sequenceIndex: 3,
    parallelGroupId: 'latest-parallel-01',
    parallelOrder: 1,
    parallelSize: 2,
    sourceLabel: 'repository-backed live source',
  },
] as const;

const missionPartialEvents = [
  {
    id: 'partial-event-1',
    missionId: 'mission-partial',
    actorName: 'Mira',
    actorRole: 'Backend Developer',
    action: 'seeded the event stream',
    timestamp: '2026-05-26T10:05:00.000Z',
    sequenceIndex: 1,
    sourceLabel: 'repository-backed live source',
  },
  {
    id: 'partial-event-2',
    missionId: 'mission-partial',
    actorName: 'Theo',
    actorRole: 'Frontend Developer',
    action: 'rendered the concurrent branch',
    timestamp: '2026-05-26T10:06:00.000Z',
    sequenceIndex: 2,
    parallelGroupId: 'partial-parallel-01',
    parallelOrder: 1,
    parallelSize: 2,
    sourceLabel: 'repository-backed live source',
    freshness: 'partial',
  },
] as const;

describe('buildMissionTimelineResponse', () => {
  it('orders events chronologically and preserves parallel metadata', () => {
    const timeline = buildMissionTimelineResponse(
      records[2],
      [
        {
          id: 'event-2',
          missionId: 'mission-partial',
          actorName: 'Theo',
          actorRole: 'Frontend Developer',
          action: 'rendered the parallel branches',
          timestamp: '2026-05-26T10:06:00.000Z',
          sequenceIndex: 2,
          parallelGroupId: 'branch-a',
          parallelOrder: 1,
          parallelSize: 2,
          sourceLabel: 'repository-backed live source',
        },
        {
          id: 'event-1',
          missionId: 'mission-partial',
          actorName: 'Mira',
          actorRole: 'Backend Developer',
          action: 'seeded the event feed',
          timestamp: '2026-05-26T10:05:00.000Z',
          sequenceIndex: 1,
          sourceLabel: 'repository-backed live source',
        },
        {
          id: 'event-3',
          missionId: 'mission-partial',
          actorName: null,
          actorRole: null,
          action: null,
          timestamp: '2026-05-26T10:07:00.000Z',
          sequenceIndex: 3,
          sourceLabel: 'repository-backed live source',
          freshness: 'partial',
        },
      ],
      new Date('2026-05-26T10:07:00.000Z'),
    );

    expect(timeline.mission?.id).toBe('mission-partial');
    expect(timeline.eventCount).toBe(3);
    expect(timeline.events.map((event) => event.id)).toEqual(['event-1', 'event-2', 'event-3']);
    expect(timeline.events[1]?.isParallel).toBe(true);
    expect(timeline.events[1]?.parallelGroupId).toBe('branch-a');
    expect(timeline.freshnessState).toBe('partial');
  });
});

describe('buildDashboardResponse', () => {
  it('prefers the most recent valid timestamp and keeps invalid timestamps at the end', () => {
    const dashboard = buildDashboardResponse(records, new Date('2026-05-26T10:05:30.000Z'), missionLatestEvents);

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
    expect(dashboard.timeline.mission?.id).toBe('mission-latest');
    expect(dashboard.timeline.eventCount).toBe(3);
    expect(dashboard.timeline.events[1]?.parallelGroupId).toBe('latest-parallel-01');
  });

  it('applies fallback text and partial-source markers when fields are missing', () => {
    const dashboard = buildDashboardResponse([records[2]], new Date('2026-05-26T10:06:00.000Z'), missionPartialEvents);

    expect(dashboard.latestMission?.actorName).toBe('Unknown agent');
    expect(dashboard.latestMission?.actorRole).toBeNull();
    expect(dashboard.latestMission?.action).toBe('The latest pass is still being reconciled after hardening.');
    expect(dashboard.latestMission?.detail).toBe('The latest pass is still being reconciled after hardening.');
    expect(dashboard.latestMission?.isPartial).toBe(true);
    expect(dashboard.source.freshness).toBe('partial');
    expect(dashboard.summary.partial).toBe(1);
    expect(dashboard.timeline.mission?.id).toBe('mission-partial');
    expect(dashboard.timeline.events).toHaveLength(2);
    expect(dashboard.timeline.freshnessState).toBe('partial');
  });

  it('keeps timeline events scoped to the selected mission', () => {
    const dashboard = buildDashboardResponse(records, new Date('2026-05-26T10:05:30.000Z'), [
      {
        id: 'latest-event-1',
        missionId: 'mission-latest',
        actorName: 'Ari',
        actorRole: 'Coordinator',
        action: 'published the live replay contract',
        timestamp: '2026-05-26T10:04:00.000Z',
        sequenceIndex: 1,
        sourceLabel: 'repository-backed live source',
      },
      {
        id: 'older-event-1',
        missionId: 'mission-older',
        actorName: 'Mira',
        actorRole: 'Backend Developer',
        action: 'worked an unrelated mission',
        timestamp: '2026-05-26T09:56:00.000Z',
        sequenceIndex: 1,
        sourceLabel: 'repository-backed live source',
      },
    ]);

    expect(dashboard.latestMission?.id).toBe('mission-latest');
    expect(dashboard.timeline.mission?.id).toBe('mission-latest');
    expect(dashboard.timeline.events.map((event) => event.id)).toEqual(['latest-event-1']);
  });
  it('returns an empty payload when there are no missions', () => {
    const dashboard = buildDashboardResponse([]);

    expect(dashboard.latestMission).toBeNull();
    expect(dashboard.missions).toEqual([]);
    expect(dashboard.summary).toEqual({ total: 0, running: 0, completed: 0, partial: 0 });
    expect(dashboard.source.freshness).toBe('empty');
    expect(dashboard.source.updatedAt).toBeNull();
    expect(dashboard.timeline.mission).toBeNull();
    expect(dashboard.timeline.events).toEqual([]);
    expect(dashboard.timeline.freshnessState).toBe('empty');
  });
});
