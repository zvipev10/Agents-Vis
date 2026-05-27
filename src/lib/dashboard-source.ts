import { existsSync, readFileSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';
import type { MissionRecord, MissionTimelineEventRecord } from './dashboard-types';

export interface DashboardDataSource {
  name: string;
  records: readonly MissionRecord[];
  eventRecords: readonly MissionTimelineEventRecord[];
}

const DEFAULT_LIVE_SOURCE_FILE = 'src/lib/dashboard-live-source.json';
const SOURCE_FILE_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_FILE';
const SOURCE_NAME_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_NAME';
const EMPTY_RECORDS: readonly MissionRecord[] = [];
const EMPTY_EVENT_RECORDS: readonly MissionTimelineEventRecord[] = [];

function asArray<T>(value: unknown): readonly T[] | null {
  return Array.isArray(value) ? (value as readonly T[]) : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringOrNull(value: unknown): value is string | null | undefined {
  return typeof value === 'string' || value === null || value === undefined;
}

function isNumberOrNull(value: unknown): value is number | null | undefined {
  return typeof value === 'number' || value === null || value === undefined;
}

function isMissionRecordLike(value: unknown): value is MissionRecord {
  if (!isObject(value) || typeof value.id !== 'string') {
    return false;
  }

  return (
    isStringOrNull(value.title) &&
    isStringOrNull(value.status) &&
    isStringOrNull(value.updatedAt) &&
    isStringOrNull(value.actorName) &&
    isStringOrNull(value.actorRole) &&
    isStringOrNull(value.action) &&
    isStringOrNull(value.detail) &&
    isStringOrNull(value.summary)
  );
}

function isMissionTimelineEventRecordLike(value: unknown): value is MissionTimelineEventRecord {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.missionId !== 'string') {
    return false;
  }

  return (
    isStringOrNull(value.actorName) &&
    isStringOrNull(value.actorRole) &&
    isStringOrNull(value.action) &&
    isString(value.timestamp) &&
    typeof value.sequenceIndex === 'number' &&
    isStringOrNull(value.parallelGroupId) &&
    isNumberOrNull(value.parallelOrder) &&
    isNumberOrNull(value.parallelSize) &&
    isStringOrNull(value.sourceLabel) &&
    isStringOrNull(value.freshness)
  );
}

function resolveSourceFile(filePath: string): string {
  return isAbsolute(filePath) ? filePath : resolve(process.cwd(), filePath);
}

function loadSourceFromFile(filePath: string): DashboardDataSource | null {
  const resolvedPath = resolveSourceFile(filePath);
  if (!existsSync(resolvedPath)) {
    return null;
  }

  try {
    const raw = readFileSync(resolvedPath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const records = asArray<unknown>(parsed.records)?.filter(isMissionRecordLike) ?? null;
    const eventRecords = asArray<unknown>(parsed.eventRecords)?.filter(isMissionTimelineEventRecordLike) ?? null;

    if (!records || !eventRecords) {
      return null;
    }

    return {
      name:
        typeof parsed.sourceName === 'string' && parsed.sourceName.trim().length > 0
          ? parsed.sourceName.trim()
          : basename(resolvedPath),
      records,
      eventRecords,
    };
  } catch {
    return null;
  }
}

function applySourceNameOverride(source: DashboardDataSource, sourceName: string | undefined): DashboardDataSource {
  if (!sourceName) {
    return source;
  }

  return {
    ...source,
    name: sourceName,
  };
}

export function loadDashboardDataSource(): DashboardDataSource {
  const sourceName = process.env[SOURCE_NAME_ENV]?.trim();
  const envSourceFile = process.env[SOURCE_FILE_ENV]?.trim();
  const candidateFiles = [envSourceFile, DEFAULT_LIVE_SOURCE_FILE].filter((value): value is string => Boolean(value));

  for (const filePath of candidateFiles) {
    const fileSource = loadSourceFromFile(filePath);
    if (fileSource) {
      return applySourceNameOverride(fileSource, sourceName);
    }
  }

  return {
    name: sourceName && sourceName.length > 0 ? sourceName : DEFAULT_LIVE_SOURCE_FILE,
    records: EMPTY_RECORDS,
    eventRecords: EMPTY_EVENT_RECORDS,
  };
}
