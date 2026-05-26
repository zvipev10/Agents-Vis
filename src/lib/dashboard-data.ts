import type { DashboardResponse, MissionCard, MissionRecord, MissionStatusLabel } from './dashboard-types';

const FALLBACK_ACTION = 'updated the mission';
const FALLBACK_DETAIL = 'No extra details were recorded.';

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toMillis(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStatus(status: MissionRecord['status']): MissionStatusLabel {
  if (status === 'running' || status === 'completed') {
    return status;
  }

  return 'unknown';
}

function buildHeadline(actorName: string, actorRole: string | null, action: string): string {
  const actor = actorRole ? `${actorName}, ${actorRole}` : actorName;
  return `${actor} ${action}`;
}

function buildDetail(record: MissionRecord, action: string): string {
  return cleanText(record.detail) ?? cleanText(record.summary) ?? cleanText(record.title) ?? action ?? FALLBACK_DETAIL;
}

export function buildMissionCard(record: MissionRecord, isLatest = false): MissionCard {
  const actorName = cleanText(record.actorName) ?? 'Unknown agent';
  const actorRole = cleanText(record.actorRole);
  const action = cleanText(record.action) ?? cleanText(record.summary) ?? FALLBACK_ACTION;
  const title = cleanText(record.title) ?? 'Mission update';
  const updatedAt = cleanText(record.updatedAt);
  const status = normalizeStatus(record.status);
  const isPartial =
    actorName === 'Unknown agent' ||
    actorRole === null && cleanText(record.actorRole) === null ||
    cleanText(record.action) === null ||
    cleanText(record.detail) === null ||
    cleanText(record.summary) === null ||
    cleanText(record.updatedAt) === null ||
    status === 'unknown';

  return {
    id: record.id,
    title,
    status,
    headline: buildHeadline(actorName, actorRole, action),
    detail: buildDetail(record, action),
    actorName,
    actorRole,
    action,
    updatedAt,
    isLatest,
    isPartial,
  };
}

function sortByRecency(a: MissionCard, b: MissionCard): number {
  const aTime = toMillis(a.updatedAt);
  const bTime = toMillis(b.updatedAt);

  if (aTime !== null && bTime !== null && aTime !== bTime) {
    return bTime - aTime;
  }

  if (aTime === null && bTime !== null) {
    return 1;
  }

  if (aTime !== null && bTime === null) {
    return -1;
  }

  const titleComparison = a.title.localeCompare(b.title);
  if (titleComparison !== 0) {
    return titleComparison;
  }

  return a.id.localeCompare(b.id);
}

function freshnessFor(cards: MissionCard[]): DashboardResponse['source']['freshness'] {
  if (cards.length === 0) {
    return 'empty';
  }

  return cards.some((card) => card.isPartial) ? 'partial' : 'fresh';
}

function newestTimestamp(cards: MissionCard[]): string | null {
  const timestamps = cards.map((card) => card.updatedAt).filter((value): value is string => Boolean(value));
  if (timestamps.length === 0) {
    return null;
  }

  return timestamps.sort((left, right) => {
    const aTime = toMillis(left) ?? Number.NEGATIVE_INFINITY;
    const bTime = toMillis(right) ?? Number.NEGATIVE_INFINITY;
    return bTime - aTime;
  })[0];
}

export function buildDashboardResponse(records: readonly MissionRecord[], generatedAt = new Date()): DashboardResponse {
  const missions = records.map((record) => buildMissionCard(record)).sort(sortByRecency);
  const sortedMissions = missions.map((mission, index) => ({
    ...mission,
    isLatest: index === 0,
  }));

  const running = sortedMissions.filter((mission) => mission.status === 'running').length;
  const completed = sortedMissions.filter((mission) => mission.status === 'completed').length;
  const partial = sortedMissions.filter((mission) => mission.isPartial).length;

  return {
    generatedAt: generatedAt.toISOString(),
    source: {
      name: 'fixture mission feed',
      freshness: freshnessFor(sortedMissions),
      updatedAt: newestTimestamp(sortedMissions),
    },
    latestMission: sortedMissions[0] ?? null,
    missions: sortedMissions,
    summary: {
      total: sortedMissions.length,
      running,
      completed,
      partial,
    },
  };
}

export { cleanText, toMillis };