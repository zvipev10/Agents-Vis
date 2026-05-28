import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getDashboardStore } from '../../../lib/dashboard-store';
import type { MissionStatusLabel } from '../../../lib/dashboard-types';

export const dynamic = 'force-dynamic';

interface AgentEventRequestBody {
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
}

function jsonError(status: number, error: string) {
  return NextResponse.json(
    {
      ok: false,
      error,
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

function parseBody(body: unknown): AgentEventRequestBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid JSON body');
  }

  const input = body as Record<string, unknown>;
  const missionId = normalizeText(input.missionId);
  const actorName = normalizeText(input.actorName);
  const action = normalizeText(input.action);
  const eventTimestamp = normalizeText(input.eventTimestamp);
  const sequenceIndex = input.sequenceIndex;

  if (!missionId) {
    throw new Error('missionId is required');
  }

  if (!actorName) {
    throw new Error('actorName is required');
  }

  if (!action) {
    throw new Error('action is required');
  }

  if (!eventTimestamp || Number.isNaN(Date.parse(eventTimestamp))) {
    throw new Error('eventTimestamp is required');
  }

  if (typeof sequenceIndex !== 'number' || !Number.isInteger(sequenceIndex) || sequenceIndex < 0) {
    throw new Error('sequenceIndex must be a non-negative integer');
  }

  const missionStatus = input.missionStatus === undefined || input.missionStatus === null ? null : input.missionStatus;
  if (missionStatus !== null && !isMissionStatus(missionStatus)) {
    throw new Error('missionStatus must be running, completed, or unknown');
  }

  return {
    missionId,
    missionTitle: normalizeText(input.missionTitle),
    missionStatus,
    actorName,
    actorRole: normalizeText(input.actorRole),
    action,
    detail: normalizeText(input.detail),
    summary: normalizeText(input.summary),
    eventTimestamp,
    sequenceIndex,
    parallelGroupId: normalizeText(input.parallelGroupId),
    parallelOrder: typeof input.parallelOrder === 'number' && Number.isFinite(input.parallelOrder) ? input.parallelOrder : null,
    parallelSize: typeof input.parallelSize === 'number' && Number.isFinite(input.parallelSize) ? input.parallelSize : null,
    sourceLabel: normalizeText(input.sourceLabel),
    eventType: normalizeText(input.eventType),
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  let payload: AgentEventRequestBody;
  try {
    payload = parseBody(JSON.parse(rawBody) as unknown);
  } catch (error) {
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

    if (message.includes('Sequence collision') || message.includes('Replay') || message.includes('collision')) {
      return jsonError(409, message);
    }

    if (message.includes('Database connection is not configured')) {
      return jsonError(503, message);
    }

    return jsonError(500, message);
  }
}
