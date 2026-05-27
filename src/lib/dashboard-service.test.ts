import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getLatestMissionTimelineResponse } from './dashboard-service';

const SOURCE_FILE_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_FILE';

function withEnv<T>(updates: Record<string, string | undefined>, run: () => T): T {
  const previous = process.env[SOURCE_FILE_ENV];

  try {
    if (updates[SOURCE_FILE_ENV] === undefined) {
      delete process.env[SOURCE_FILE_ENV];
    } else {
      process.env[SOURCE_FILE_ENV] = updates[SOURCE_FILE_ENV] as string;
    }

    return run();
  } finally {
    if (previous === undefined) {
      delete process.env[SOURCE_FILE_ENV];
    } else {
      process.env[SOURCE_FILE_ENV] = previous;
    }
  }
}

afterEach(() => {
  delete process.env[SOURCE_FILE_ENV];
});

describe('getLatestMissionTimelineResponse', () => {
  it('selects the most recent mission by updatedAt instead of array position', () => {
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

      const timeline = withEnv({ [SOURCE_FILE_ENV]: sourcePath }, () => getLatestMissionTimelineResponse(new Date('2026-05-26T10:05:00.000Z')));

      expect(timeline.mission?.id).toBe('mission-latest');
      expect(timeline.mission?.title).toBe('Latest mission');
      expect(timeline.source.name).toBe('custom service source');
      expect(timeline.eventCount).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('uses the same recency tie-breakers as the dashboard sort', () => {
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

      const timeline = withEnv({ [SOURCE_FILE_ENV]: sourcePath }, () => getLatestMissionTimelineResponse(new Date('2026-05-26T10:05:00.000Z')));

      expect(timeline.mission?.id).toBe('mission-alpha');
      expect(timeline.mission?.title).toBe('Alpha mission');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
