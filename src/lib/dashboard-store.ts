import { randomUUID } from 'node:crypto';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { buildDashboardResponse, buildMissionTimelineResponse, cleanText } from './dashboard-data';
import type {
  DashboardResponse,
  MissionRecord,
  MissionStatusLabel,
  MissionTimelineEventRecord,
  MissionTimelineResponse,
} from './dashboard-types';

neonConfig.fetchConnectionCache = true;

export interface AgentEventWriteInput {
  missionId: string;
  missionTitle?: string | null;
  missionStatus?: MissionStatusLabel | null;
  actorName: string;
  actorRole?: string | null;
  action: string;
  detail?: string | null;
  summary?: string | null;
  eventTimestamp: string;
  sequenceIndex: number;
  parallelGroupId?: string | null;
  parallelOrder?: number | null;
  parallelSize?: number | null;
  sourceLabel?: string | null;
  eventType?: string | null;
  payloadHash: string;
}

export interface AgentEventWriteResult {
  ok: true;
  replayed: boolean;
  requestId: string;
  mission: {
    id: string;
    title: string;
    status: MissionStatusLabel;
    updatedAt: string;
    version: number;
  };
  event: {
    id: string;
    sequenceIndex: number;
  };
  source: {
    name: string;
    updatedAt: string;
  };
}

export interface DashboardStore {
  readDashboard(generatedAt?: Date): Promise<DashboardResponse>;
  readLatestMissionTimeline(generatedAt?: Date): Promise<MissionTimelineResponse>;
  appendAgentEvent(input: AgentEventWriteInput): Promise<AgentEventWriteResult>;
}

interface MissionVersionedRecord {
  id: string;
  title: string;
  status: MissionStatusLabel;
  updatedAt: string;
  actorName: string | null;
  actorRole: string | null;
  action: string | null;
  detail: string | null;
  summary: string | null;
  version: number;
}

interface NeonMissionRow {
  id: string;
  title: string;
  status: MissionStatusLabel;
  updated_at: string;
  actor_name: string | null;
  actor_role: string | null;
  action: string | null;
  detail: string | null;
  summary: string | null;
  version: number;
}

interface NeonEventRow {
  id: string;
  mission_id: string;
  actor_name: string;
  actor_role: string | null;
  action: string;
  event_timestamp: string;
  sequence_index: number;
  parallel_group_id: string | null;
  parallel_order: number | null;
  parallel_size: number | null;
  source_label: string | null;
  freshness: string | null;
}


const DEFAULT_SOURCE_NAME = 'neon-canonical-db';
const DATABASE_URL_ENV = 'DATABASE_URL';
const NEON_DATABASE_URL_ENV = 'NEON_DATABASE_URL';

let testDashboardStore: DashboardStore | null = null;
let defaultDashboardStore: DashboardStore | null = null;

function getDatabaseUrl(): string | null {
  return process.env[NEON_DATABASE_URL_ENV]?.trim() || process.env[DATABASE_URL_ENV]?.trim() || null;
}

function toMissionRecord(row: NeonMissionRow): MissionVersionedRecord {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    updatedAt: row.updated_at,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    detail: row.detail,
    summary: row.summary,
    version: row.version,
  };
}

function toEventRecord(row: NeonEventRow): MissionTimelineEventRecord {
  return {
    id: row.id,
    missionId: row.mission_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    timestamp: row.event_timestamp,
    sequenceIndex: row.sequence_index,
    parallelGroupId: row.parallel_group_id,
    parallelOrder: row.parallel_order,
    parallelSize: row.parallel_size,
    sourceLabel: row.source_label,
    freshness: row.freshness as MissionTimelineEventRecord['freshness'],
  };
}

function buildMissionSnapshot(input: AgentEventWriteInput, previous: MissionVersionedRecord | null, version: number): MissionVersionedRecord {
  return {
    id: input.missionId,
    title: cleanText(input.missionTitle) ?? previous?.title ?? input.missionId,
    status: input.missionStatus ?? previous?.status ?? 'running',
    updatedAt: input.eventTimestamp,
    actorName: cleanText(input.actorName) ?? previous?.actorName ?? 'Unknown agent',
    actorRole: cleanText(input.actorRole) ?? previous?.actorRole ?? null,
    action: cleanText(input.action) ?? previous?.action ?? 'updated the mission',
    detail: cleanText(input.detail) ?? previous?.detail ?? null,
    summary: cleanText(input.summary) ?? previous?.summary ?? null,
    version,
  };
}

function buildWriteResponse(
  requestId: string,
  mission: MissionVersionedRecord,
  eventId: string,
  sequenceIndex: number,
  sourceName: string,
): AgentEventWriteResult {
  return {
    ok: true,
    replayed: false,
    requestId,
    mission: {
      id: mission.id,
      title: mission.title,
      status: mission.status,
      updatedAt: mission.updatedAt,
      version: mission.version,
    },
    event: {
      id: eventId,
      sequenceIndex,
    },
    source: {
      name: sourceName,
      updatedAt: mission.updatedAt,
    },
  };
}

function stringifyResponse(response: AgentEventWriteResult): string {
  return JSON.stringify(response);
}

class EmptyDashboardStore implements DashboardStore {
  async readDashboard(generatedAt = new Date()): Promise<DashboardResponse> {
    return buildDashboardResponse([], generatedAt, [], DEFAULT_SOURCE_NAME);
  }

  async readLatestMissionTimeline(generatedAt = new Date()): Promise<MissionTimelineResponse> {
    return buildMissionTimelineResponse(null, [], generatedAt, DEFAULT_SOURCE_NAME);
  }

  async appendAgentEvent(): Promise<AgentEventWriteResult> {
    throw new Error('Database connection is not configured');
  }
}

class MemoryDashboardStore implements DashboardStore {
  private missions: MissionVersionedRecord[];
  private events: MissionTimelineEventRecord[];

  constructor(initial?: { missions?: MissionVersionedRecord[]; events?: MissionTimelineEventRecord[] }) {
    this.missions = [...(initial?.missions ?? [])];
    this.events = [...(initial?.events ?? [])];
  }

  async readDashboard(generatedAt = new Date()): Promise<DashboardResponse> {
    return buildDashboardResponse(this.missions, generatedAt, this.events, DEFAULT_SOURCE_NAME);
  }

  async readLatestMissionTimeline(generatedAt = new Date()): Promise<MissionTimelineResponse> {
    const latestMission = [...this.missions].sort((a, b) => {
      const aTime = Date.parse(a.updatedAt);
      const bTime = Date.parse(b.updatedAt);
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
        return bTime - aTime;
      }
      if (!Number.isFinite(aTime) && Number.isFinite(bTime)) {
        return 1;
      }
      if (Number.isFinite(aTime) && !Number.isFinite(bTime)) {
        return -1;
      }
      const titleComparison = a.title.localeCompare(b.title);
      if (titleComparison !== 0) {
        return titleComparison;
      }
      return a.id.localeCompare(b.id);
    })[0] ?? null;

    return buildMissionTimelineResponse(
      latestMission
        ? {
            id: latestMission.id,
            title: latestMission.title,
            status: latestMission.status,
            updatedAt: latestMission.updatedAt,
          }
        : null,
      this.events,
      generatedAt,
      DEFAULT_SOURCE_NAME,
    );
  }

  async appendAgentEvent(input: AgentEventWriteInput): Promise<AgentEventWriteResult> {
    if (this.events.some((event) => event.missionId === input.missionId && event.sequenceIndex === input.sequenceIndex)) {
      throw new Error('Sequence collision');
    }

    const previousMission = this.missions.find((mission) => mission.id === input.missionId) ?? null;
    const nextVersion = (previousMission?.version ?? 0) + 1;
    const snapshot = buildMissionSnapshot(input, previousMission, nextVersion);
    const eventId = `evt_${randomUUID()}`;
    const requestId = `req_${randomUUID()}`;

    this.missions = [snapshot, ...this.missions.filter((mission) => mission.id !== input.missionId)];
    this.events = [
      ...this.events,
      {
        id: eventId,
        missionId: input.missionId,
        actorName: snapshot.actorName,
        actorRole: snapshot.actorRole,
        action: snapshot.action,
        timestamp: input.eventTimestamp,
        sequenceIndex: input.sequenceIndex,
        parallelGroupId: cleanText(input.parallelGroupId),
        parallelOrder: typeof input.parallelOrder === 'number' && Number.isFinite(input.parallelOrder) ? input.parallelOrder : null,
        parallelSize: typeof input.parallelSize === 'number' && Number.isFinite(input.parallelSize) ? input.parallelSize : null,
        sourceLabel: cleanText(input.sourceLabel),
        freshness: 'fresh',
      },
    ];

    return buildWriteResponse(requestId, snapshot, eventId, input.sequenceIndex, DEFAULT_SOURCE_NAME);
  }
}

class NeonDashboardStore implements DashboardStore {
  private readonly pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl });
  }

  private async fetchMissions(): Promise<MissionVersionedRecord[]> {
    const { rows } = await this.pool.query<NeonMissionRow>(
      `
        select id, title, status, updated_at, actor_name, actor_role, action, detail, summary, version
        from missions
        order by updated_at desc, title asc, id asc
      `,
    );

    return rows.map(toMissionRecord);
  }

  private async fetchLatestMission(): Promise<MissionVersionedRecord | null> {
    const { rows } = await this.pool.query<NeonMissionRow>(
      `
        select id, title, status, updated_at, actor_name, actor_role, action, detail, summary, version
        from missions
        order by updated_at desc, title asc, id asc
        limit 1
      `,
    );

    return rows[0] ? toMissionRecord(rows[0]) : null;
  }

  private async fetchEventsForMission(missionId: string): Promise<MissionTimelineEventRecord[]> {
    const { rows } = await this.pool.query<NeonEventRow>(
      `
        select id, mission_id, actor_name, actor_role, action, event_timestamp, sequence_index,
               parallel_group_id, parallel_order, parallel_size, source_label, freshness
        from mission_events
        where mission_id = $1
        order by event_timestamp asc, sequence_index asc, coalesce(parallel_order, 2147483647) asc, id asc
      `,
      [missionId],
    );

    return rows.map(toEventRecord);
  }

  async readDashboard(generatedAt = new Date()): Promise<DashboardResponse> {
    const missions = await this.fetchMissions();
    const latestMission = missions[0] ?? null;
    const events = latestMission ? await this.fetchEventsForMission(latestMission.id) : [];
    return buildDashboardResponse(missions, generatedAt, events, DEFAULT_SOURCE_NAME);
  }

  async readLatestMissionTimeline(generatedAt = new Date()): Promise<MissionTimelineResponse> {
    const latestMission = await this.fetchLatestMission();
    const events = latestMission ? await this.fetchEventsForMission(latestMission.id) : [];
    return buildMissionTimelineResponse(latestMission, events, generatedAt, DEFAULT_SOURCE_NAME);
  }

  async appendAgentEvent(input: AgentEventWriteInput): Promise<AgentEventWriteResult> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const { rows: sequenceRows } = await client.query<{ id: string }>(
        `select id from mission_events where mission_id = $1 and sequence_index = $2 limit 1`,
        [input.missionId, input.sequenceIndex],
      );
      if (sequenceRows[0]) {
        throw new Error('Sequence collision');
      }

      const { rows: missionRows } = await client.query<NeonMissionRow>(
        `select id, title, status, updated_at, actor_name, actor_role, action, detail, summary, version from missions where id = $1 limit 1`,
        [input.missionId],
      );
      const previousMission = missionRows[0] ? toMissionRecord(missionRows[0]) : null;
      const nextVersion = (previousMission?.version ?? 0) + 1;
      const snapshot = buildMissionSnapshot(input, previousMission, nextVersion);
      const eventId = `evt_${randomUUID()}`;
      const requestId = `req_${randomUUID()}`;

      if (previousMission) {
        await client.query(
          `
            update missions
            set title = $2,
                status = $3,
                updated_at = $4,
                actor_name = $5,
                actor_role = $6,
                action = $7,
                detail = $8,
                summary = $9,
                version = $10,
                ingested_at = now()
            where id = $1
          `,
          [
            snapshot.id,
            snapshot.title,
            snapshot.status,
            snapshot.updatedAt,
            snapshot.actorName,
            snapshot.actorRole,
            snapshot.action,
            snapshot.detail,
            snapshot.summary,
            nextVersion,
          ],
        );
      } else {
        await client.query(
          `
            insert into missions (
              id, title, status, updated_at, actor_name, actor_role, action, detail, summary, version, created_at, ingested_at
            ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
          `,
          [
            snapshot.id,
            snapshot.title,
            snapshot.status,
            snapshot.updatedAt,
            snapshot.actorName,
            snapshot.actorRole,
            snapshot.action,
            snapshot.detail,
            snapshot.summary,
            nextVersion,
          ],
        );
      }

      const response = buildWriteResponse(requestId, snapshot, eventId, input.sequenceIndex, DEFAULT_SOURCE_NAME);
      await client.query(
        `
          insert into mission_events (
            id, mission_id, actor_name, actor_role, action, detail, summary, event_timestamp,
            sequence_index, parallel_group_id, parallel_order, parallel_size, source_label, event_type,
            request_id, payload_hash, freshness, created_at
          ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, now())
        `,
        [
          eventId,
          snapshot.id,
          snapshot.actorName,
          snapshot.actorRole,
          snapshot.action,
          snapshot.detail,
          snapshot.summary,
          input.eventTimestamp,
          input.sequenceIndex,
          cleanText(input.parallelGroupId),
          typeof input.parallelOrder === 'number' && Number.isFinite(input.parallelOrder) ? input.parallelOrder : null,
          typeof input.parallelSize === 'number' && Number.isFinite(input.parallelSize) ? input.parallelSize : null,
          cleanText(input.sourceLabel),
          cleanText(input.eventType),
          requestId,
          input.payloadHash,
          'fresh',
        ],
      );

      await client.query('commit');
      return response;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }
}

export function createMemoryDashboardStore(initial?: { missions?: MissionVersionedRecord[]; events?: MissionTimelineEventRecord[] }): DashboardStore {
  return new MemoryDashboardStore(initial);
}

export function createEmptyDashboardStore(): DashboardStore {
  return new EmptyDashboardStore();
}

export function setDashboardStoreForTests(store: DashboardStore | null): void {
  testDashboardStore = store;
  defaultDashboardStore = null;
}

export function getDashboardStore(): DashboardStore {
  if (testDashboardStore) {
    return testDashboardStore;
  }

  if (!defaultDashboardStore) {
    const databaseUrl = getDatabaseUrl();
    defaultDashboardStore = databaseUrl ? new NeonDashboardStore(databaseUrl) : new EmptyDashboardStore();
  }

  return defaultDashboardStore;
}

