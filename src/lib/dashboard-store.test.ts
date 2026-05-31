import { describe, expect, it } from 'vitest';
import { createMemoryDashboardStore, normalizeDatabaseInteger, normalizeDatabaseTimestamp } from './dashboard-store';

describe('dashboard store database normalization', () => {
  it('normalizes Neon timestamp values to ISO strings', () => {
    expect(normalizeDatabaseTimestamp(new Date('2026-05-28T14:12:47.000Z'))).toBe(
      '2026-05-28T14:12:47.000Z',
    );
    expect(normalizeDatabaseTimestamp('2026-05-28T17:12:47.000+03:00')).toBe(
      '2026-05-28T14:12:47.000Z',
    );
  });

  it('normalizes Neon bigint values before version arithmetic and event ordering', () => {
    expect(normalizeDatabaseInteger('12')).toBe(12);
    expect(normalizeDatabaseInteger(13n)).toBe(13);
    expect(normalizeDatabaseInteger(null)).toBeNull();
  });

  it('degrades malformed legacy values without crashing dashboard reads', () => {
    expect(normalizeDatabaseInteger('9007199254740993')).toBeNull();
    expect(normalizeDatabaseTimestamp('not-a-date')).toBe('');
  });
});

describe('dashboard store read filters and event validation', () => {
  it('normalizes role filters to canonical stored values and searches action/detail/summary only', async () => {
    const store = createMemoryDashboardStore({
      missions: [
        {
          id: 'mission-007',
          title: 'Mission 007',
          status: 'running',
          updatedAt: '2026-05-28T00:00:00.000Z',
          actorName: 'Ari',
          actorRole: 'Coordinator',
          action: 'updated the mission story',
          detail: 'The role filter should match canonical stored role values.',
          summary: 'Role filter canonicalized',
          version: 1,
        },
      ],
      events: [
        {
          id: 'event-1',
          missionId: 'mission-007',
          taskId: 'task-900',
          eventStatus: 'updated',
          actorName: 'Ari',
          actorRole: 'Coordinator',
          action: 'updated the mission story',
          detail: 'The role filter should match canonical stored role values.',
          summary: 'Role filter canonicalized',
          timestamp: '2026-05-28T00:00:00.000Z',
          sequenceIndex: 1,
          freshness: 'fresh',
        },
        {
          id: 'event-2',
          missionId: 'mission-007',
          taskId: 'task-search-hit',
          eventStatus: 'updated',
          actorName: 'Ari',
          actorRole: 'Coordinator',
          action: 'reconciled the story filter',
          detail: 'The search text appears only in the task identifier and should not match.',
          summary: 'Search should ignore taskId',
          timestamp: '2026-05-28T00:01:00.000Z',
          sequenceIndex: 2,
          freshness: 'fresh',
        },
      ],
    });

    const byCanonicalRole = await store.readAgentEvents({ role: 'coordinator' });
    expect(byCanonicalRole).toHaveLength(2);
    expect(byCanonicalRole.every((event) => event.actorRole === 'Coordinator')).toBe(true);

    const bySearch = await store.readAgentEvents({ search: 'canonical stored role' });
    expect(bySearch.map((event) => event.id)).toEqual(['event-1']);

    const noTaskIdSearchMatch = await store.readAgentEvents({ search: 'task-search-hit' });
    expect(noTaskIdSearchMatch).toHaveLength(0);
  });

  it('rejects resumed writes when the latest task status is not blocked', async () => {
    const store = createMemoryDashboardStore({
      missions: [
        {
          id: 'mission-008',
          title: 'Mission 008',
          status: 'running',
          updatedAt: '2026-05-28T00:00:00.000Z',
          actorName: 'Ari',
          actorRole: 'Coordinator',
          action: 'started the mission',
          detail: 'Baseline mission record for the validation test.',
          summary: 'Validation baseline',
          version: 1,
        },
      ],
      events: [
        {
          id: 'event-1',
          missionId: 'mission-008',
          taskId: 'task-900',
          eventStatus: 'updated',
          actorName: 'Ari',
          actorRole: 'Coordinator',
          action: 'kept working the task',
          detail: 'The task is currently active rather than blocked.',
          summary: 'Task remains active',
          timestamp: '2026-05-28T00:00:00.000Z',
          sequenceIndex: 1,
          freshness: 'fresh',
        },
      ],
    });

    await expect(
      store.appendAgentEvent({
        missionId: 'mission-008',
        taskId: 'task-900',
        eventStatus: 'resumed',
        missionTitle: 'Mission 008',
        missionStatus: 'running',
        actorName: 'Ari',
        actorRole: 'Coordinator',
        action: 'resumed the task after the blocker cleared',
        detail: 'No blocked state exists for this task, so the transition should be rejected.',
        summary: 'Invalid resumed transition',
        eventTimestamp: '2026-05-28T00:02:00.000Z',
        sequenceIndex: 2,
        payloadHash: 'hash-1',
      }),
    ).rejects.toMatchObject({
      statusCode: 422,
      message: 'Resumed events require a prior blocked event for the same missionId and taskId',
    });
  });
});
