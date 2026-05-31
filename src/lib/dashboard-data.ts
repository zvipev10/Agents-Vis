import { dashboardMissionTimelineEvents } from './dashboard-timeline-fixtures';
import type {
  DashboardFreshness,
  DashboardResponse,
  MissionCard,
  MissionRecord,
  MissionStatusLabel,
  MissionTimelineEvent,
  MissionTimelineEventRecord,
  MissionTimelineHeader,
  MissionTimelineResponse,
} from './dashboard-types';

const FALLBACK_ACTION = 'updated the mission';
const FALLBACK_DETAIL = 'No extra details were recorded.';
const DELAY_THRESHOLD_MS = 60_000;
const STALE_THRESHOLD_MS = 15 * 60_000;

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTaskId(value: unknown): string | null {
  const taskId = cleanText(value);
  return taskId && taskId.toLowerCase() !== 'unknown' ? taskId : null;
}

function toMillis(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isFreshness(value: unknown): value is DashboardFreshness {
  return value === 'fresh' || value === 'partial' || value === 'delayed' || value === 'empty' || value === 'stale';
}

function normalizeFreshness(value: unknown, fallback: DashboardFreshness = 'fresh'): DashboardFreshness {
  return isFreshness(value) ? value : fallback;
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

function normalizeEventStatus(value: unknown): MissionTimelineEvent['eventStatus'] {
  return value === 'started' || value === 'updated' || value === 'blocked' || value === 'resumed' || value === 'completed'
    ? value
    : 'updated';
}

function buildTaskId(record: MissionTimelineEventRecord, sequenceIndex: number): string {
  return normalizeTaskId(record.taskId) ?? `${record.missionId}-step-${String(sequenceIndex).padStart(2, '0')}`;
}

function buildMissionTimelineEvent(record: MissionTimelineEventRecord): MissionTimelineEvent {
  const actorName = cleanText(record.actorName) ?? 'Unknown agent';
  const actorRole = cleanText(record.actorRole);
  const action = cleanText(record.action) ?? FALLBACK_ACTION;
  const detail = cleanText(record.detail) ?? cleanText(record.summary) ?? FALLBACK_DETAIL;
  const summary = cleanText(record.summary) ?? action;
  const timestamp = cleanText(record.timestamp);
  const sequenceIndex = typeof record.sequenceIndex === 'number' && Number.isFinite(record.sequenceIndex) ? record.sequenceIndex : 0;
  const parallelGroupId = cleanText(record.parallelGroupId);
  const parallelOrder = typeof record.parallelOrder === 'number' && Number.isFinite(record.parallelOrder) ? record.parallelOrder : null;
  const parallelSize = typeof record.parallelSize === 'number' && Number.isFinite(record.parallelSize) ? record.parallelSize : null;
  const sourceLabel = cleanText(record.sourceLabel);
  const freshness = normalizeFreshness(
    record.freshness,
    actorName === 'Unknown agent' || timestamp === null || cleanText(record.action) === null ? 'partial' : 'fresh',
  );
  const taskId = buildTaskId(record, sequenceIndex);
  const eventStatus = normalizeEventStatus(record.eventStatus);

  return {
    id: record.id,
    missionId: record.missionId,
    taskId,
    eventStatus,
    actorName,
    actorRole,
    action,
    detail,
    summary,
    timestamp,
    sequenceIndex,
    parallelGroupId,
    parallelOrder,
    parallelSize,
    sourceLabel,
    freshness,
    isStale: freshness === 'stale',
    isParallel: parallelGroupId !== null || (parallelSize ?? 0) > 1,
    isBlocked: eventStatus === 'blocked',
    isResumed: eventStatus === 'resumed',
  };
}

function compareTimelineEvents(a: MissionTimelineEvent, b: MissionTimelineEvent): number {
  const aTime = toMillis(a.timestamp);
  const bTime = toMillis(b.timestamp);

  if (aTime !== null && bTime !== null && aTime !== bTime) {
    return aTime - bTime;
  }

  if (aTime === null && bTime !== null) {
    return 1;
  }

  if (aTime !== null && bTime === null) {
    return -1;
  }

  if (a.sequenceIndex !== b.sequenceIndex) {
    return a.sequenceIndex - b.sequenceIndex;
  }

  if (a.parallelGroupId !== b.parallelGroupId) {
    if (a.parallelGroupId === null) {
      return 1;
    }

    if (b.parallelGroupId === null) {
      return -1;
    }

    return a.parallelGroupId.localeCompare(b.parallelGroupId);
  }

  if ((a.parallelOrder ?? Number.POSITIVE_INFINITY) !== (b.parallelOrder ?? Number.POSITIVE_INFINITY)) {
    return (a.parallelOrder ?? Number.POSITIVE_INFINITY) - (b.parallelOrder ?? Number.POSITIVE_INFINITY);
  }

  return a.id.localeCompare(b.id);
}

function buildMissionTimelineHeader(record: Pick<MissionRecord, 'id' | 'title' | 'status' | 'updatedAt'>, events: MissionTimelineEvent[]): MissionTimelineHeader {
  const timestampSource = events.map((event) => event.timestamp).filter((value): value is string => Boolean(value));
  const startedAt = timestampSource.length > 0 ? timestampSource[0] : cleanText(record.updatedAt);
  const updatedAt = timestampSource.length > 0 ? timestampSource[timestampSource.length - 1] : cleanText(record.updatedAt);

  return {
    id: record.id,
    title: cleanText(record.title) ?? 'Mission update',
    status: normalizeStatus(record.status),
    startedAt,
    updatedAt,
  };
}

function timelineLagMs(updatedAt: string | null, generatedAt: Date): number | null {
  const updatedMillis = toMillis(updatedAt);
  if (updatedMillis === null) {
    return null;
  }

  return Math.max(0, generatedAt.getTime() - updatedMillis);
}

function annotateBlockedDurations(events: MissionTimelineEvent[]): void {
  const blockedAtByTask = new Map<string, number>();

  for (const event of events) {
    const timestamp = toMillis(event.timestamp);
    if (timestamp === null) {
      continue;
    }

    if (event.eventStatus === 'blocked') {
      blockedAtByTask.set(event.taskId, timestamp);
      event.isBlocked = true;
      continue;
    }

    if (event.eventStatus === 'resumed') {
      event.isResumed = true;
      const blockedAt = blockedAtByTask.get(event.taskId);
      if (blockedAt !== undefined && timestamp >= blockedAt) {
        event.durationMs = timestamp - blockedAt;
      }
      continue;
    }
  }
}

function freshnessForTimeline(events: MissionTimelineEvent[], lagMs: number | null): DashboardFreshness {
  if (events.length === 0) {
    return 'empty';
  }

  if (events.some((event) => event.freshness === 'stale')) {
    return 'stale';
  }

  if (lagMs !== null && lagMs >= STALE_THRESHOLD_MS) {
    return 'stale';
  }

  if (lagMs !== null && lagMs >= DELAY_THRESHOLD_MS) {
    return 'delayed';
  }

  if (events.some((event) => event.freshness === 'partial')) {
    return 'partial';
  }

  return 'fresh';
}

export function buildMissionTimelineResponse(
  mission: Pick<MissionRecord, 'id' | 'title' | 'status' | 'updatedAt'> | null,
  eventRecords: readonly MissionTimelineEventRecord[],
  generatedAt = new Date(),
  sourceName = 'repository-backed live source',
): MissionTimelineResponse {
  const relevantEventRecords = mission ? eventRecords.filter((event) => event.missionId === mission.id) : [];
  const events = relevantEventRecords.map(buildMissionTimelineEvent).sort(compareTimelineEvents);
  annotateBlockedDurations(events);
  const header = mission ? buildMissionTimelineHeader(mission, events) : null;
  const lagMs = timelineLagMs(header?.updatedAt ?? null, generatedAt);
  const freshnessState = freshnessForTimeline(events, lagMs);

  return {
    mission: header,
    events,
    eventCount: events.length,
    freshnessState,
    sourceStatus: freshnessState,
    lagMs,
    isStale: freshnessState === 'stale',
    source: {
      name: sourceName,
      freshness: freshnessState,
      updatedAt: header?.updatedAt ?? null,
      lagMs,
    },
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

function missionPartial(record: MissionRecord, card: MissionCard): boolean {
  return (
    card.actorName === 'Unknown agent' ||
    cleanText(record.actorRole) === null ||
    cleanText(record.action) === null ||
    cleanText(record.detail) === null ||
    cleanText(record.summary) === null ||
    cleanText(record.updatedAt) === null ||
    card.status === 'unknown'
  );
}

export function buildMissionCard(record: MissionRecord, isLatest = false): MissionCard {
  const actorName = cleanText(record.actorName) ?? 'Unknown agent';
  const actorRole = cleanText(record.actorRole);
  const action = cleanText(record.action) ?? cleanText(record.summary) ?? FALLBACK_ACTION;
  const title = cleanText(record.title) ?? 'Mission update';
  const updatedAt = cleanText(record.updatedAt);
  const status = normalizeStatus(record.status);

  const card: MissionCard = {
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
    isPartial: false,
  };

  card.isPartial = missionPartial(record, card);

  return card;
}

function newestTimestamp(values: Array<string | null | undefined>): string | null {
  const timestamps = values.filter((value): value is string => Boolean(value));
  if (timestamps.length === 0) {
    return null;
  }

  return timestamps.sort((left, right) => {
    const aTime = toMillis(left) ?? Number.NEGATIVE_INFINITY;
    const bTime = toMillis(right) ?? Number.NEGATIVE_INFINITY;
    return bTime - aTime;
  })[0];
}

function freshnessForDashboard(cards: MissionCard[], timeline: MissionTimelineResponse | null): DashboardFreshness {
  if (cards.length === 0 && timeline === null) {
    return 'empty';
  }

  if (timeline?.isStale) {
    return 'stale';
  }

  if (timeline?.freshnessState === 'delayed') {
    return 'delayed';
  }

  if (cards.some((card) => card.isPartial) || timeline?.freshnessState === 'partial') {
    return 'partial';
  }

  return 'fresh';
}

export function buildDashboardResponse(
  records: readonly MissionRecord[],
  generatedAt = new Date(),
  eventRecords: readonly MissionTimelineEventRecord[] = dashboardMissionTimelineEvents,
  sourceName = 'repository-backed live source',
): DashboardResponse {
  const missions = records.map((record) => buildMissionCard(record)).sort(sortByRecency);
  const sortedMissions = missions.map((mission, index) => ({
    ...mission,
    isLatest: index === 0,
  }));
  const latestMission = sortedMissions[0] ?? null;
  const latestMissionRecord = records.find((record) => record.id === latestMission?.id) ?? null;
  const timeline = buildMissionTimelineResponse(latestMissionRecord, latestMissionRecord ? eventRecords : [], generatedAt, sourceName);
  const running = sortedMissions.filter((mission) => mission.status === 'running').length;
  const completed = sortedMissions.filter((mission) => mission.status === 'completed').length;
  const partial = sortedMissions.filter((mission) => mission.isPartial).length;
  const sourceUpdatedAt = newestTimestamp([
    ...sortedMissions.map((mission) => mission.updatedAt),
    timeline.source.updatedAt,
  ]);
  const sourceFreshness = freshnessForDashboard(sortedMissions, latestMissionRecord ? timeline : null);

  return {
    generatedAt: generatedAt.toISOString(),
    source: {
      name: sourceName,
      freshness: sourceFreshness,
      updatedAt: sourceUpdatedAt,
      lagMs: timeline.lagMs,
    },
    latestMission,
    missions: sortedMissions,
    summary: {
      total: sortedMissions.length,
      running,
      completed,
      partial,
    },
    timeline,
  };
}

export { cleanText, toMillis };
