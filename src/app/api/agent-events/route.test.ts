import { beforeEach, describe, expect, it, vi } from 'vitest';

const appendAgentEvent = vi.fn();

vi.mock('../../../lib/dashboard-store', () => ({
  getDashboardStore: () => ({
    appendAgentEvent,
  }),
}));

import { POST } from './route';

describe('POST /api/agent-events', () => {
  beforeEach(() => {
    appendAgentEvent.mockReset();
  });

  it('validates payload shape and writes to the canonical DB without a secret', async () => {
    appendAgentEvent.mockResolvedValue({
      ok: true,
      replayed: false,
      requestId: 'request-123',
      mission: {
        id: 'mission-005',
        title: 'Mission 005',
        status: 'running',
        updatedAt: '2026-05-28T00:00:00.000Z',
        version: 2,
      },
      event: {
        id: 'event-123',
        sequenceIndex: 3,
      },
      source: {
        name: 'neon-canonical-db',
        updatedAt: '2026-05-28T00:00:00.000Z',
      },
    });

    const body = {
      missionId: 'mission-005',
      missionTitle: 'Mission 005',
      missionStatus: 'running',
      actorName: 'Agent One',
      actorRole: 'Backend',
      action: 'updated the canonical record',
      detail: 'Persisted the write path',
      summary: 'Canonical write succeeded',
      eventTimestamp: '2026-05-28T00:00:00.000Z',
      sequenceIndex: 3,
      parallelGroupId: 'mission-005-parallel-01',
      parallelOrder: 1,
      parallelSize: 2,
      sourceLabel: 'agents-vis',
      eventType: 'mission_update',
    };

    const rawBody = JSON.stringify(body);
    const response = await POST(new Request('http://localhost/api/agent-events', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: rawBody,
    }));

    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');
    expect(appendAgentEvent).toHaveBeenCalledTimes(1);
    expect(appendAgentEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        missionId: 'mission-005',
        actorName: 'Agent One',
        action: 'updated the canonical record',
        sequenceIndex: 3,
        payloadHash: expect.any(String),
      }),
    );

    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.replayed).toBe(false);
    expect(payload.mission.id).toBe('mission-005');
  });

  it('rejects invalid payloads', async () => {
    const response = await POST(new Request('http://localhost/api/agent-events', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        actorName: 'Agent One',
        action: 'missing mission id',
        eventTimestamp: '2026-05-28T00:00:00.000Z',
        sequenceIndex: 1,
      }),
    }));

    expect(response.status).toBe(400);
    expect(appendAgentEvent).not.toHaveBeenCalled();
    expect((await response.json()).error).toMatch(/missionId is required/);
  });
});
