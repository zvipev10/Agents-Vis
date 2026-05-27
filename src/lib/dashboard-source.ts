import { existsSync, readFileSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';
import defaultLiveSource from './dashboard-live-source.json';
import type { MissionRecord, MissionTimelineEventRecord } from './dashboard-types';

export interface DashboardDataSource {
  name: string;
  records: readonly MissionRecord[];
  eventRecords: readonly MissionTimelineEventRecord[];
}

const DEFAULT_LIVE_SOURCE_FILE = 'src/lib/dashboard-live-source.json';
const DEFAULT_LIVE_SOURCE_URL = 'https://raw.githubusercontent.com/zvipev10/Agents-Vis/main/src/lib/dashboard-live-source.json';
const SOURCE_FILE_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_FILE';
const SOURCE_NAME_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_NAME';
const SOURCE_URL_ENV = 'AGENTS_VIS_DASHBOARD_SOURCE_URL';
const EMPTY_RECORDS: readonly MissionRecord[] = [];
const EMPTY_EVENT_RECORDS: readonly MissionTimelineEventRecord[] = [];
const EMBEDDED_LIVE_SOURCE = defaultLiveSource as Record<string, unknown>;
const SOURCE_FETCH_TIMEOUT_MS = 5_000;

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

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function loadSourceFromParsed(parsed: Record<string, unknown>, fallbackName: string): DashboardDataSource | null {
  const records = asArray<unknown>(parsed.records)?.filter(isMissionRecordLike) ?? null;
  const eventRecords = asArray<unknown>(parsed.eventRecords)?.filter(isMissionTimelineEventRecordLike) ?? null;

  if (!records || !eventRecords) {
    return null;
  }

  return {
    name: typeof parsed.sourceName === 'string' && parsed.sourceName.trim().length > 0 ? parsed.sourceName.trim() : fallbackName,
    records,
    eventRecords,
  };
}

function loadSourceFromFile(filePath: string): DashboardDataSource | null {
  const resolvedPath = resolveSourceFile(filePath);
  if (!existsSync(resolvedPath)) {
    return null;
  }

  try {
    const raw = readFileSync(resolvedPath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return loadSourceFromParsed(parsed, basename(resolvedPath));
  } catch {
    return null;
  }
}

async function loadSourceFromUrl(url: string): Promise<DashboardDataSource | null> {
  if (!isHttpUrl(url)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const parsed = (await response.json()) as Record<string, unknown>;
    return loadSourceFromParsed(parsed, url);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function loadEmbeddedSource(): DashboardDataSource | null {
  return loadSourceFromParsed(EMBEDDED_LIVE_SOURCE, DEFAULT_LIVE_SOURCE_FILE);
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

export async function loadDashboardDataSource(): Promise<DashboardDataSource> {
  const sourceName = process.env[SOURCE_NAME_ENV]?.trim();
  const envSourceUrl = process.env[SOURCE_URL_ENV]?.trim();
  const envSourceFile = process.env[SOURCE_FILE_ENV]?.trim();

  if (envSourceUrl) {
    const remoteSource = await loadSourceFromUrl(envSourceUrl);
    if (remoteSource) {
      return applySourceNameOverride(remoteSource, sourceName);
    }
  }

  if (envSourceFile) {
    const fileSource = loadSourceFromFile(envSourceFile);
    if (fileSource) {
      return applySourceNameOverride(fileSource, sourceName);
    }
  }

  const defaultRemoteSource = await loadSourceFromUrl(DEFAULT_LIVE_SOURCE_URL);
  if (defaultRemoteSource) {
    return applySourceNameOverride(defaultRemoteSource, sourceName);
  }

  const embeddedSource = loadEmbeddedSource();
  if (embeddedSource) {
    return applySourceNameOverride(embeddedSource, sourceName);
  }

  return {
    name: sourceName && sourceName.length > 0 ? sourceName : DEFAULT_LIVE_SOURCE_FILE,
    records: EMPTY_RECORDS,
    eventRecords: EMPTY_EVENT_RECORDS,
  };
}
