export type MissionStatus = 'running' | 'completed';

export type MissionStatusLabel = MissionStatus | 'unknown';

export type DashboardFreshness = 'fresh' | 'partial' | 'delayed' | 'empty' | 'stale';

export interface MissionRecord {
  id: string;
  title?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  action?: string | null;
  detail?: string | null;
  summary?: string | null;
}

export interface MissionCard {
  id: string;
  title: string;
  status: MissionStatusLabel;
  headline: string;
  detail: string;
  actorName: string;
  actorRole: string | null;
  action: string;
  updatedAt: string | null;
  isLatest: boolean;
  isPartial: boolean;
}

export interface MissionTimelineEventRecord {
  id: string;
  missionId: string;
  taskId?: string | null;
  eventStatus?: 'started' | 'updated' | 'blocked' | 'resumed' | 'completed' | null;
  actorName?: string | null;
  actorRole?: string | null;
  action?: string | null;
  detail?: string | null;
  summary?: string | null;
  timestamp?: string | null;
  sequenceIndex?: number | null;
  parallelGroupId?: string | null;
  parallelOrder?: number | null;
  parallelSize?: number | null;
  sourceLabel?: string | null;
  freshness?: DashboardFreshness | null;
}

// Add taskId display and status badges for timeline events
export interface MissionTimelineEvent {
  id: string;
  missionId: string;
  taskId: string;
  eventStatus: 'started' | 'updated' | 'blocked' | 'resumed' | 'completed';
  actorName: string;
  actorRole: string | null;
  action: string;
  detail: string;
  summary: string;
  timestamp: string | null;
  sequenceIndex: number;
  parallelGroupId: string | null;
  parallelOrder: number | null;
  parallelSize: number | null;
  sourceLabel: string | null;
  freshness: DashboardFreshness;
  isStale: boolean;
  isParallel: boolean;
  isBlocked?: boolean;
  isResumed?: boolean;
  durationMs?: number;
}

export interface MissionTimelineHeader {
  id: string;
  title: string;
  status: MissionStatusLabel;
  startedAt: string | null;
  updatedAt: string | null;
}

export interface MissionTimelineResponse {
  mission: MissionTimelineHeader | null;
  events: MissionTimelineEvent[];
  eventCount: number;
  freshnessState: DashboardFreshness;
  sourceStatus: DashboardFreshness;
  lagMs: number | null;
  isStale: boolean;
  source: DashboardSource;
}

export interface MissionSummary {
  total: number;
  running: number;
  completed: number;
  partial: number;
}

export interface DashboardSource {
  name: string;
  freshness: DashboardFreshness;
  updatedAt: string | null;
  lagMs: number | null;
}

export interface DashboardResponse {
  generatedAt: string;
  source: DashboardSource;
  latestMission: MissionCard | null;
  missions: MissionCard[];
  summary: MissionSummary;
  timeline: MissionTimelineResponse;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringOrNull = (value: unknown): value is string | null =>
  typeof value === 'string' || value === null;

const isNumberOrNull = (value: unknown): value is number | null =>
  typeof value === 'number' || value === null;

const isFreshness = (value: unknown): value is DashboardFreshness =>
  value === 'fresh' || value === 'partial' || value === 'delayed' || value === 'empty' || value === 'stale';

function isMissionTimelineEvent(value: unknown): value is MissionTimelineEvent {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.missionId === 'string' &&
    typeof value.taskId === 'string' &&
    (value.eventStatus === 'started' || value.eventStatus === 'updated' || value.eventStatus === 'blocked' || value.eventStatus === 'resumed' || value.eventStatus === 'completed') &&
    typeof value.actorName === 'string' &&
    isStringOrNull(value.actorRole) &&
    typeof value.action === 'string' &&
    typeof value.detail === 'string' &&
    typeof value.summary === 'string' &&
    isStringOrNull(value.timestamp) &&
    typeof value.sequenceIndex === 'number' &&
    isStringOrNull(value.parallelGroupId) &&
    isNumberOrNull(value.parallelOrder) &&
    isNumberOrNull(value.parallelSize) &&
    isStringOrNull(value.sourceLabel) &&
    isFreshness(value.freshness) &&
    typeof value.isStale === 'boolean' &&
    typeof value.isParallel === 'boolean' &&
    (typeof value.isBlocked === 'boolean' || value.isBlocked === undefined) &&
    (typeof value.isResumed === 'boolean' || value.isResumed === undefined) &&
    (isNumberOrNull(value.durationMs) || value.durationMs === undefined)
  );
}
function isMissionTimelineResponse(value: unknown): value is MissionTimelineResponse {
  if (!isObject(value)) {
    return false;
  }

  const mission = value.mission;
  const source = value.source;

  return (
    (mission === null ||
      (isObject(mission) &&
        typeof mission.id === 'string' &&
        typeof mission.title === 'string' &&
        (mission.status === 'running' || mission.status === 'completed' || mission.status === 'unknown') &&
        isStringOrNull(mission.startedAt) &&
        isStringOrNull(mission.updatedAt))) &&
    Array.isArray(value.events) && value.events.every(isMissionTimelineEvent) &&
    typeof value.eventCount === 'number' &&
    isFreshness(value.freshnessState) &&
    isFreshness(value.sourceStatus) &&
    isNumberOrNull(value.lagMs) &&
    typeof value.isStale === 'boolean' &&
    isObject(source) &&
    typeof source.name === 'string' &&
    isFreshness(source.freshness) &&
    isStringOrNull(source.updatedAt) &&
    isNumberOrNull(source.lagMs)
  );
}

export function isMissionCard(value: unknown): value is MissionCard {
  if (!isObject(value)) {
    return false;
  }

  const status = value.status;

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    (status === 'running' || status === 'completed' || status === 'unknown') &&
    typeof value.headline === 'string' &&
    typeof value.detail === 'string' &&
    typeof value.actorName === 'string' &&
    isStringOrNull(value.actorRole) &&
    typeof value.action === 'string' &&
    isStringOrNull(value.updatedAt) &&
    typeof value.isLatest === 'boolean' &&
    typeof value.isPartial === 'boolean'
  );
}

export function isDashboardResponse(value: unknown): value is DashboardResponse {
  if (!isObject(value)) {
    return false;
  }

  const source = value.source;
  const summary = value.summary;

  return (
    typeof value.generatedAt === 'string' &&
    isObject(source) &&
    typeof source.name === 'string' &&
    isFreshness(source.freshness) &&
    isStringOrNull(source.updatedAt) &&
    isNumberOrNull(source.lagMs) &&
    (value.latestMission === null || isMissionCard(value.latestMission)) &&
    Array.isArray(value.missions) && value.missions.every(isMissionCard) &&
    isObject(summary) &&
    typeof summary.total === 'number' &&
    typeof summary.running === 'number' &&
    typeof summary.completed === 'number' &&
    typeof summary.partial === 'number' &&
    isMissionTimelineResponse(value.timeline)
  );
}

export function assertDashboardResponse(value: unknown): DashboardResponse {
  if (!isDashboardResponse(value)) {
    throw new Error('Invalid dashboard response payload');
  }

  return value;
}

export function assertMissionTimelineResponse(value: unknown): MissionTimelineResponse {
  if (!isMissionTimelineResponse(value)) {
    throw new Error('Invalid mission timeline response payload');
  }

  return value;
}
