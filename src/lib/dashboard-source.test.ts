import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadDashboardDataSource } from './dashboard-source';

const SOURCE_FILE_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_FILE';
const SOURCE_NAME_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_NAME';
const SOURCE_URL_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_URL';

async function withEnv<T>(updates: Record<string, string | undefined>, run: () => T): Promise<Awaited<T>> {
  const previous: Record<string, string | undefined> = {
    [SOURCE_FILE_ENV]: process.env[SOURCE_FILE_ENV],
    [SOURCE_NAME_ENV]: process.env[SOURCE_NAME_ENV],
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
  delete process.env[SOURCE_NAME_ENV];
  delete process.env[SOURCE_URL_ENV];
  vi.restoreAllMocks();
});

describe('loadDashboardDataSource', () => {
  it('loads the default live mission store from the verified remote source when no env override is set', async () => {
    const remotePayload = {
      sourceName: 'canonical production live source',
      records: [
        {
          id: 'mission-001',
          title: 'Reconnect the visibility brief',
          status: 'running',
          updatedAt: '2026-05-26T07:40:00.000Z',
        },
      ],
      eventRecords: [
        {
          id: 'mission-004-event-005',
          missionId: 'mission-004',
          actorName: 'Ari',
          actorRole: 'Coordinator',
          action: 'recorded the remaining blocker and the next live-source step',
          timestamp: '2026-05-27T12:22:00.000Z',
          sequenceIndex: 5,
          sourceLabel: 'canonical production live source',
          freshness: 'partial',
        },
      ],
    };

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(remotePayload), {
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const source = await loadDashboardDataSource();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/zvipev10/Agents-Vis/main/src/lib/dashboard-live-source.json',
      expect.objectContaining({
        cache: 'no-store',
        headers: {
          accept: 'application/json',
        },
      }),
    );
    expect(source.name).toBe('canonical production live source');
    expect(source.records.map((record) => record.id)).toEqual(['mission-001']);
    expect(source.eventRecords).toHaveLength(1);
    expect(source.eventRecords[0]?.freshness).toBe('partial');
  });

  it('loads a custom source file when AGENTS_VIS_DASHBOARD_SOURCE_FILE is set', async () => {
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

      const source = await withEnv(
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

  it('polls a remote JSON source when AGENTS_VIS_DASHBOARD_SOURCE_URL is set', async () => {
    const remotePayload = {
      sourceName: 'remote live source',
      records: [
        {
          id: 'mission-remote',
          title: 'Remote mission',
          status: 'completed',
          updatedAt: '2026-05-26T12:00:00.000Z',
        },
      ],
      eventRecords: [
        {
          id: 'mission-remote-event-1',
          missionId: 'mission-remote',
          actorName: 'Ari',
          actorRole: 'Coordinator',
          action: 'published the live remote source',
          timestamp: '2026-05-26T12:00:00.000Z',
          sequenceIndex: 1,
          parallelGroupId: 'mission-remote-parallel-01',
          parallelOrder: 0,
          parallelSize: 2,
          sourceLabel: 'remote live source',
        },
      ],
    };

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(remotePayload), {
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const source = await withEnv(
      {
        [SOURCE_URL_ENV]: 'https://example.com/live-source.json',
      },
      () => loadDashboardDataSource(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/live-source.json',
      expect.objectContaining({
        cache: 'no-store',
        headers: {
          accept: 'application/json',
        },
      }),
    );
    expect(source.name).toBe('remote live source');
    expect(source.records).toHaveLength(1);
    expect(source.eventRecords).toHaveLength(1);
    expect(source.eventRecords[0]?.parallelGroupId).toBe('mission-remote-parallel-01');
    expect(source.eventRecords[0]?.parallelSize).toBe(2);
  });

  it('applies AGENTS_VIS_DASHBOARD_SOURCE_NAME to the loaded source', async () => {
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

      const source = await withEnv(
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
