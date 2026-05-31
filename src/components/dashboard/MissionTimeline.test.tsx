import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MissionTimeline } from './MissionTimeline';
import type { DashboardResponse } from '../../lib/dashboard-types';

const generatedAt = '2026-05-26T10:20:00.000Z';
const updatedAt = '2026-05-26T10:06:00.000Z';

const mockDashboard: DashboardResponse = {
  generatedAt,
  source: {
    name: 'test-source',
    freshness: 'fresh',
    updatedAt,
    lagMs: 0,
  },
  latestMission: {
    id: 'm1',
    title: 'Test Mission',
    status: 'running',
    headline: 'Working on it',
    detail: 'Some details',
    actorName: 'Mira',
    actorRole: 'Backend Developer',
    action: 'Updating the timeline filters',
    updatedAt,
    isLatest: true,
    isPartial: false,
  },
  missions: [],
  summary: {
    total: 1,
    running: 1,
    completed: 0,
    partial: 0,
  },
  timeline: {
    mission: null,
    events: [
      {
        id: 'e1',
        missionId: 'm1',
        taskId: 'unknown',
        actorName: 'Mira',
        actorRole: 'Backend Developer',
        action: 'Waiting on the migration lock',
        eventStatus: 'blocked',
        detail: 'The database lock must clear before the mission can continue.',
        summary: 'Blocked on migration lock',
        timestamp: '2026-05-26T10:06:00.000Z',
        sequenceIndex: 1,
        parallelGroupId: null,
        parallelOrder: null,
        parallelSize: null,
        sourceLabel: 'source',
        freshness: 'fresh',
        isStale: false,
        isParallel: false,
        isBlocked: true,
      },
      {
        id: 'e2',
        missionId: 'm1',
        taskId: 'unknown',
        actorName: 'Mira',
        actorRole: 'Backend Developer',
        action: 'Resumed work after the lock cleared',
        eventStatus: 'resumed',
        detail: 'The task picked up from the blocked step without losing context.',
        summary: 'Resumed after migration lock cleared',
        timestamp: '2026-05-26T10:20:22.000Z',
        sequenceIndex: 2,
        parallelGroupId: null,
        parallelOrder: null,
        parallelSize: null,
        sourceLabel: 'source',
        freshness: 'fresh',
        isStale: false,
        isParallel: false,
        isResumed: true,
        durationMs: 862000,
      },
      {
        id: 'e3',
        missionId: 'm1',
        taskId: 'TASK-200',
        actorName: 'Theo',
        actorRole: 'Frontend Developer',
        action: 'Adjusted timeline copy',
        eventStatus: 'updated',
        detail: 'Updated the search hint to cover action, detail, and summary only.',
        summary: 'Adjusted the filter copy',
        timestamp: '2026-05-26T10:21:00.000Z',
        sequenceIndex: 3,
        parallelGroupId: null,
        parallelOrder: null,
        parallelSize: null,
        sourceLabel: 'source',
        freshness: 'fresh',
        isStale: false,
        isParallel: false,
      },
    ],
    eventCount: 3,
    freshnessState: 'fresh',
    sourceStatus: 'fresh',
    lagMs: 0,
    isStale: false,
    source: {
      name: 'test-source',
      freshness: 'fresh',
      updatedAt,
      lagMs: 0,
    },
  },
};

describe('MissionTimeline', () => {
  it('renders canonical filter values, stable task ids, and compact resumed duration labels', () => {
    render(<MissionTimeline dashboard={mockDashboard} />);

    expect(screen.getByRole('option', { name: 'Backend Developer' })).toHaveValue('Backend Developer');
    expect(screen.getByRole('option', { name: 'Frontend Developer' })).toHaveValue('Frontend Developer');
    expect(screen.getByText('Task: m1-step-01')).toBeInTheDocument();
    expect(screen.getByText('Task: m1-step-02')).toBeInTheDocument();
    expect(screen.getByText('Task: TASK-200')).toBeInTheDocument();
    expect(screen.queryByText('Task: unknown')).not.toBeInTheDocument();
    expect(screen.getByText('Resumed · 14m 22s')).toBeInTheDocument();

    const blockedBadge = screen.getByRole('status', { name: 'blocked' });
    expect(blockedBadge).toHaveTextContent('Blocked');
    expect(within(blockedBadge).queryByText(/blocked/i)).toBeInTheDocument();
  });

  it('applies canonical role and status filters with AND logic', () => {
    render(<MissionTimeline dashboard={mockDashboard} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Role filter' }), { target: { value: 'Backend Developer' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Status filter' }), { target: { value: 'resumed' } });

    expect(screen.getByText('Resumed · 14m 22s')).toBeInTheDocument();
    expect(screen.queryByText('Waiting on the migration lock')).not.toBeInTheDocument();
    expect(screen.queryByText('Adjusted timeline copy')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Role filter' }), { target: { value: 'Frontend Developer' } });

    expect(screen.getByText('No events match the current filters')).toBeInTheDocument();
    expect(screen.getByText('Clear search or relax the role and status filters to bring the latest mission steps back into view.')).toBeInTheDocument();
  });

  it('searches only action, detail, and summary text', () => {
    render(<MissionTimeline dashboard={mockDashboard} />);

    const searchInput = screen.getByRole('textbox', { name: 'Search action, detail, or summary' });

    fireEvent.change(searchInput, { target: { value: 'TASK-200' } });
    expect(screen.getByText('No events match the current filters')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Backend Developer' } });
    expect(screen.getByText('No events match the current filters')).toBeInTheDocument();
  });
});
