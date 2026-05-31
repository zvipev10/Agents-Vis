import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getDashboardStore, DashboardStoreHttpError } from '../../../lib/dashboard-store';
import type { MissionStatusLabel } from '../../../lib/dashboard-types';

export const dynamic = 'force-dynamic';

interface AgentEventRequestBody {
  missionId: string;
  taskId: string;
  eventStatus?: 'started' | 'updated' | 'blocked' | 'resumed' | 'completed' | null;
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
}

function jsonError(status: number, error: string, fields?: ValidationFieldError[]) {
  return NextResponse.json(
    {
      ok: false,
      error,
      ...(fields ? { fields } : {}),
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}

function isMissionStatus(value: unknown): value is MissionStatusLabel {
  return value === 'running' || value === 'completed' || value === 'unknown';
}

function normalizeText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

type ValidationFieldError = {
  field: string;
  message: string;
};

class ValidationError extends Error {
  constructor(public readonly errors: ValidationFieldError[]) {
    super('Validation failed');
  }
}

function isAllowedEventStatus(value: unknown): value is NonNullable<AgentEventRequestBody['eventStatus']> {
  return value === 'started' || value === 'updated' || value === 'blocked' || value === 'resumed' || value === 'completed';
}

function isGenericText(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return ['done', 'updated', 'fixed', 'n/a', 'na', 'none', 'update', 'misc', 'other', 'ok'].includes(normalized);
}

function pushTextValidation(
  errors: ValidationFieldError[],
  field: string,
  value: string | null,
  minimumLength: number,
  options?: { generic?: boolean },
): void {
  if (!value) {
    errors.push({ field, message: 'is required' });
    return;
  }

  if (value.length < minimumLength) {
    errors.push({ field, message: `must be at least ${minimumLength} characters` });
    return;
  }

  if (options?.generic !== false && isGenericText(value)) {
    errors.push({ field, message: 'must be specific and non-generic' });
  }
}

function parseBody(body: unknown): AgentEventRequestBody {
  if (!body || typeof body !== 'object') {
    throw new ValidationError([{ field: 'body', message: 'must be valid JSON' }]);
  }

  const input = body as Record<string, unknown>;
  const missionId = normalizeText(input.missionId);
  const taskId = normalizeText(input.taskId);
  const eventStatus = input.eventStatus;
  const actorName = normalizeText(input.actorName);
  const action = normalizeText(input.action);
  const detail = normalizeText(input.detail);
  const summary = normalizeText(input.summary);
  const eventTimestamp = normalizeText(input.eventTimestamp);
  const sequenceIndex = input.sequenceIndex;
  const errors: ValidationFieldError[] = [];

  pushTextValidation(errors, 'missionId', missionId, 3);
  pushTextValidation(errors, 'taskId', taskId, 3);

  if (!isAllowedEventStatus(eventStatus)) {
    errors.push({ field: 'eventStatus', message: 'must be one of started, updated, blocked, resumed, or completed' });
  }

  pushTextValidation(errors, 'actorName', actorName, 3);
  pushTextValidation(errors, 'action', action, 8);
  pushTextValidation(errors, 'detail', detail, 20);
  pushTextValidation(errors, 'summary', summary, 8, { generic: true });

  if (!eventTimestamp || Number.isNaN(Date.parse(eventTimestamp))) {
    errors.push({ field: 'eventTimestamp', message: 'must be a valid ISO-8601 timestamp' });
  }

  if (typeof sequenceIndex !== 'number' || !Number.isInteger(sequenceIndex) || sequenceIndex < 0) {
    errors.push({ field: 'sequenceIndex', message: 'must be a non-negative integer' });
  }

  const missionStatus = input.missionStatus === undefined || input.missionStatus === null ? null : (input.missionStatus as MissionStatusLabel);
  if (missionStatus !== null && !isMissionStatus(missionStatus)) {
    errors.push({ field: 'missionStatus', message: 'must be running, completed, or unknown' });
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return {
    missionId: missionId!,
    taskId: taskId!,
    eventStatus: eventStatus as NonNullable<AgentEventRequestBody['eventStatus']>,
    missionTitle: normalizeText(input.missionTitle),
    missionStatus,
    actorName: actorName!,
    actorRole: normalizeText(input.actorRole),
    action: action!,
    detail,
    summary,
    eventTimestamp: eventTimestamp!,
    sequenceIndex: sequenceIndex as number,
    parallelGroupId: normalizeText(input.parallelGroupId),
    parallelOrder: typeof input.parallelOrder === 'number' && Number.isFinite(input.parallelOrder) ? input.parallelOrder : null,
    parallelSize: typeof input.parallelSize === 'number' && Number.isFinite(input.parallelSize) ? input.parallelSize : null,
    sourceLabel: normalizeText(input.sourceLabel),
    eventType: normalizeText(input.eventType),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role')?.trim() || undefined;
  const eventStatus = searchParams.get('eventStatus')?.trim() || undefined;
  const search = searchParams.get('search')?.trim() || undefined;

  const store = getDashboardStore();
  const events = await store.readAgentEvents({ role, eventStatus, search });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  let payload: AgentEventRequestBody;
  try {
    payload = parseBody(JSON.parse(rawBody) as unknown);
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(400, 'Validation failed', error.errors);
    }

    return jsonError(400, error instanceof Error ? error.message : 'Invalid request body');
  }

  try {
    const payloadHash = createHash('sha256').update(rawBody).digest('hex');
    const store = getDashboardStore();
    const writeResult = await store.appendAgentEvent({
      ...payload,
      payloadHash,
    });

    return NextResponse.json(writeResult, {
      status: writeResult.replayed ? 200 : 201,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown write error';

    if (error instanceof DashboardStoreHttpError) {
      return jsonError(error.statusCode, message);
    }

    if (message.includes('Sequence collision') || message.includes('Replay') || message.includes('collision')) {
      return jsonError(409, message);
    }

    if (message.includes('Database connection is not configured')) {
      return jsonError(503, message);
    }

    return jsonError(500, message);
  }
}
