import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadDashboardDataSource } from './dashboard-source';

const SOURCE_FILE_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_FILE';
const SOURCE_NAME_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_NAME';

function withEnv<T>(updates: Record<string, string | undefined>, run: () => T): T {
  const previous: Record<string, string | undefined> = {
    [SOURCE_FILE_ENV]: process.env[SOURCE_FILE_ENV],
    [SOURCE_NAME_ENV]: process.env[SOURCE_NAME_ENV],
  };

  try {
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    return run();
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
  delete process.env[SOURCE_NAME_ENV];
});

describe('loadDashboardDataSource', () => {
  it('loads the default live mission store from the repository file', () => {
    const source = loadDashboardDataSource();

    expect(source.name).toBe('repository-backed live source');
    expect(source.records.map((record) => record.id)).toEqual(['mission-001', 'mission-002', 'mission-003']);
    expect(source.eventRecords).toHaveLength(5);
    expect(source.eventRecords[1]?.parallelGroupId).toBe('mission-003-parallel-01');
    expect(source.eventRecords[4]?.freshness).toBe('partial');
  });

  it('loads a custom source file when AGENTS_VIS_DASHBOARD_SOURCE_FILE is set', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agents-vis-dashboard-source-'));
    const sourcePath = join(tempDir, 'custom-source.json');

    try {
      writeFileSync(
        sourcePath,
        JSON.stringify(
          {
            sourceName: 'custom file source',
            records: [
              null,
              17,
              {
                id: 'mission-custom',
                title: 'Custom mission',
                status: 'running',
                updatedAt: '2026-05-26T11:00:00.000Z',
              },
              {
                title: 'Missing id should be ignored',
              },
            ],
            eventRecords: [
              null,
              {
                id: 'mission-custom-event-ignored',
                missionId: 'mission-custom',
                actorName: 'Ari',
                actorRole: 'Coordinator',
                action: 'ignored because of missing timestamp',
              },
              {
                id: 'mission-custom-event-1',
                missionId: 'mission-custom',
                actorName: 'Ari',
                actorRole: 'Coordinator',
                action: 'loaded the custom source',
                timestamp: '2026-05-26T11:00:00.000Z',
                sequenceIndex: 1,
                sourceLabel: 'custom file source',
              },
            ],
          },
          null,
          2,
        ),
      );

      const source = withEnv(
        {
          [SOURCE_FILE_ENV]: sourcePath,
        },
        () => loadDashboardDataSource(),
      );

      expect(source.name).toBe('custom file source');
      expect(source.records).toHaveLength(1);
      expect(source.records[0]?.id).toBe('mission-custom');
      expect(source.eventRecords).toHaveLength(1);
      expect(source.eventRecords[0]?.sourceLabel).toBe('custom file source');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('applies AGENTS_VIS_DASHBOARD_SOURCE_NAME to the loaded source', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'agents-vis-dashboard-source-name-'));
    const sourcePath = join(tempDir, 'named-source.json');

    try {
      writeFileSync(
        sourcePath,
        JSON.stringify(
          {
            records: [
              {
                id: 'mission-custom',
                title: 'Custom mission',
                status: 'completed',
                updatedAt: '2026-05-26T11:15:00.000Z',
              },
            ],
            eventRecords: [],
          },
          null,
          2,
        ),
      );

      const source = withEnv(
        {
          [SOURCE_FILE_ENV]: sourcePath,
          [SOURCE_NAME_ENV]: 'override source name',
        },
        () => loadDashboardDataSource(),
      );

      expect(source.name).toBe('override source name');
      expect(source.records[0]?.id).toBe('mission-custom');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
