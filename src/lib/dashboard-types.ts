export type MissionStatus = 'running' | 'completed';

export type MissionStatusLabel = MissionStatus | 'unknown';

export type DashboardFreshness = 'fresh' | 'partial' | 'empty' | 'stale';

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
}

export interface DashboardResponse {
  generatedAt: string;
  source: DashboardSource;
  latestMission: MissionCard | null;
  missions: MissionCard[];
  summary: MissionSummary;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringOrNull = (value: unknown): value is string | null =>
  typeof value === 'string' || value === null;

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
    (source.freshness === 'fresh' || source.freshness === 'partial' || source.freshness === 'empty' || source.freshness === 'stale') &&
    isStringOrNull(source.updatedAt) &&
    (value.latestMission === null || isMissionCard(value.latestMission)) &&
    Array.isArray(value.missions) && value.missions.every(isMissionCard) &&
    isObject(summary) &&
    typeof summary.total === 'number' &&
    typeof summary.running === 'number' &&
    typeof summary.completed === 'number' &&
    typeof summary.partial === 'number'
  );
}

export function assertDashboardResponse(value: unknown): DashboardResponse {
  if (!isDashboardResponse(value)) {
    throw new Error('Invalid dashboard response payload');
  }

  return value;
}