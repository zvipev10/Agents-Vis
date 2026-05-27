import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLatestMissionTimelineResponse } from './dashboard-service';

const SOURCE_FILE_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_FILE';
const SOURCE_URL_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_URL';

async function withEnv<T>(updates: Record<string, string | undefined>, run: () => T): Promise<Awaited<T>> {
  const previous: Record<string, string | undefined> = {
    [SOURCE_FILE_ENV]: process.env[SOURCE_FILE_ENV],
    [SOURCE_URL_ENV]: process.env[SOURCE_URL_ENV],
  };

  try {
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    return await run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

afterEach(() => {
  delete process.env[SOURCE_FILE_ENV];
  delete process.env[SOURCE_URL_ENV];
  vi.restoreAllMocks();
});

describe('getLatestMissionTimelineResponse', () => {
  it('selects the most recent mission by updatedAt instead of array position', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agents-vis-dashboard-service-'));
    const sourcePath = join(tempDir, 'source.json');

    try {
      writeFileSync(
        sourcePath,
        JSON.stringify(
          {
            sourceName: 'custom service source',
            records: [
              {
                id: 'mission-older',
                title: 'Older mission',
                status: 'completed',
                updatedAt: '2026-05-26T09:00:00.000Z',
              },
              {
                id: 'mission-latest',
                title: 'Latest mission',
                status: 'running',
                updatedAt: '2026-05-26T10:00:00.000Z',
              },
              {
                id: 'mission-last-but-not-latest',
                title: 'Last mission in array',
                status: 'running',
                updatedAt: '2026-05-26T09:30:00.000Z',
              },
            ],
            eventRecords: [],
          },
          null,
          2,
        ),
      );

      const timeline = await withEnv({ [SOURCE_FILE_ENV]: sourcePath }, () =>
        getLatestMissionTimelineResponse(new Date('2026-05-26T10:05:00.000Z')),
      );

      expect(timeline.mission?.id).toBe('mission-latest');
      expect(timeline.mission?.title).toBe('Latest mission');
      expect(timeline.source.name).toBe('custom service source');
      expect(timeline.eventCount).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('uses the same recency tie-breakers as the dashboard sort', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agents-vis-dashboard-service-tie-'));
    const sourcePath = join(tempDir, 'source.json');

    try {
      writeFileSync(
        sourcePath,
        JSON.stringify(
          {
            sourceName: 'tie-breaker source',
            records: [
              {
                id: 'mission-zeta',
                title: 'Zeta mission',
                status: 'running',
                updatedAt: '2026-05-26T10:00:00.000Z',
              },
              {
                id: 'mission-alpha',
                title: 'Alpha mission',
                status: 'completed',
                updatedAt: '2026-05-26T10:00:00.000Z',
              },
            ],
            eventRecords: [],
          },
          null,
          2,
        ),
      );

      const timeline = await withEnv({ [SOURCE_FILE_ENV]: sourcePath }, () =>
        getLatestMissionTimelineResponse(new Date('2026-05-26T10:05:00.000Z')),
      );

      expect(timeline.mission?.id).toBe('mission-alpha');
      expect(timeline.mission?.title).toBe('Alpha mission');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('keeps parallel event metadata intact when the source comes from a remote feed', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          sourceName: 'remote service source',
          records: [
            {
              id: 'mission-remote',
              title: 'Remote mission',
              status: 'running',
              updatedAt: '2026-05-26T10:10:00.000Z',
            },
          ],
          eventRecords: [
            {
              id: 'mission-remote-event-1',
              missionId: 'mission-remote',
              actorName: 'Ari',
              actorRole: 'Coordinator',
              action: 'published the remote source',
              timestamp: '2026-05-26T10:10:00.000Z',
              sequenceIndex: 1,
              parallelGroupId: 'mission-remote-parallel-01',
              parallelOrder: 0,
              parallelSize: 2,
              sourceLabel: 'remote service source',
            },
            {
              id: 'mission-remote-event-2',
              missionId: 'mission-remote',
              actorName: 'Mira',
              actorRole: 'Backend Developer',
              action: 'validated the remote payload',
              timestamp: '2026-05-26T10:11:00.000Z',
              sequenceIndex: 2,
              sourceLabel: 'remote service source',
            },
          ],
        }),
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    );

    const timeline = await withEnv({ [SOURCE_URL_ENV]: 'https://example.com/live-source.json' }, () =>
      getLatestMissionTimelineResponse(new Date('2026-05-26T10:15:00.000Z')),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(timeline.mission?.id).toBe('mission-remote');
    expect(timeline.source.name).toBe('remote service source');
    expect(timeline.events).toHaveLength(2);
    expect(timeline.events[0]?.parallelGroupId).toBe('mission-remote-parallel-01');
    expect(timeline.events[0]?.parallelOrder).toBe(0);
    expect(timeline.events[0]?.parallelSize).toBe(2);
    expect(timeline.events[1]?.parallelGroupId).toBeNull();
  });
});
