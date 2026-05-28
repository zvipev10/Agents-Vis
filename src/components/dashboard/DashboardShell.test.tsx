import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildDashboardResponse } from '../../lib/dashboard-data';
import type { DashboardResponse } from '../../lib/dashboard-types';
import { DashboardShell } from './DashboardShell';

const readyDashboard = buildDashboardResponse(
  [
    {
      id: 'mission-001',
      title: 'Reconnect the visibility brief',
      status: 'running',
      updatedAt: '2026-05-26T10:05:00.000Z',
      actorName: 'Ari',
      actorRole: 'Coordinator',
      action: 'reframed the delivery gates',
      detail: 'Clarified the privacy, read-only, and preview-first expectations for the visibility application.',
    },
    {
      id: 'mission-002',
      title: 'Stabilize the dashboard contract',
      status: 'completed',
      updatedAt: '2026-05-26T09:55:00.000Z',
      actorName: 'Mira',
      actorRole: 'Backend Developer',
      action: 'validated the typed response contract',
      detail: 'Added runtime checks and graceful fallbacks for partially missing source data.',
    },
  ],
  new Date('2026-05-26T10:06:00.000Z'),
  [
    {
      id: 'mission-001-event-001',
      missionId: 'mission-001',
      actorName: 'Ari',
      actorRole: 'Coordinator',
      action: 'reframed the delivery gates',
      timestamp: '2026-05-26T10:02:00.000Z',
      sequenceIndex: 1,
      sourceLabel: 'repository-backed live source',
    },
    {
      id: 'mission-001-event-002',
      missionId: 'mission-001',
      actorName: 'Mira',
      actorRole: 'Backend Developer',
      action: 'aligned the read-only contract',
      timestamp: '2026-05-26T10:03:00.000Z',
      sequenceIndex: 2,
      parallelGroupId: 'mission-001-parallel-01',
      parallelOrder: 0,
      parallelSize: 2,
      sourceLabel: 'repository-backed live source',
    },
    {
      id: 'mission-001-event-003',
      missionId: 'mission-001',
      actorName: 'Theo',
      actorRole: 'Frontend Developer',
      action: 'shaped the live timeline states',
      timestamp: '2026-05-26T10:03:00.000Z',
      sequenceIndex: 3,
      parallelGroupId: 'mission-001-parallel-01',
      parallelOrder: 1,
      parallelSize: 2,
      sourceLabel: 'repository-backed live source',
    },
  ],
);

type DashboardTestOverrides = {
  [K in keyof DashboardResponse]?: K extends 'source'
    ? Partial<DashboardResponse['source']>
    : K extends 'summary'
      ? Partial<DashboardResponse['summary']>
      : K extends 'timeline'
        ? Partial<Omit<DashboardResponse['timeline'], 'source'>> & { source?: Partial<DashboardResponse['timeline']['source']> }
        : DashboardResponse[K];
};

function dashboardWith(overrides: DashboardTestOverrides): DashboardResponse {
  return {
    ...readyDashboard,
    ...overrides,
    source: {
      ...readyDashboard.source,
      ...overrides.source,
    },
    summary: {
      ...readyDashboard.summary,
      ...overrides.summary,
    },
    timeline: {
      ...readyDashboard.timeline,
      ...overrides.timeline,
      source: {
        ...readyDashboard.timeline.source,
        ...(overrides.timeline?.source ?? {}),
      },
    },
  };
}

describe('DashboardShell', () => {
  it('shows a loading state before data is ready', () => {
    render(<DashboardShell state={{ status: 'loading' }} />);

    expect(screen.getByLabelText('Loading mission timeline')).toBeInTheDocument();
  });

  it('renders the live replay timeline for the latest mission only', () => {
    render(<DashboardShell state={{ status: 'ready', dashboard: readyDashboard }} />);

    expect(screen.getByRole('heading', { name: 'Reconnect the visibility brief' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'One mission, one timeline' })).toBeInTheDocument();
    expect(screen.getByText('Latest mission only')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('Updated at')).toBeInTheDocument();
    expect(screen.getByText(/behind the live clock|in sync with the live clock/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ari · Coordinator' })).toBeInTheDocument();
    expect(screen.getByText('Ari · Coordinator', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('reframed the delivery gates', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Clarified the privacy, read-only, and preview-first expectations for the visibility application.')).toBeInTheDocument();
    expect(screen.getByText('Parallel work stayed visible without losing order')).toBeInTheDocument();
    expect(screen.getByText('Lane 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Lane 2 of 2')).toBeInTheDocument();
    expect(screen.queryByText('Stabilize the dashboard contract')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows delayed, partial, and stale freshness states with explicit labels', () => {
    const delayedDashboard = dashboardWith({
      generatedAt: '2026-05-26T10:08:00.000Z',
      source: {
        name: 'repository-backed live source',
        freshness: 'delayed',
        updatedAt: '2026-05-26T10:07:00.000Z',
        lagMs: 60000,
      },
    });

    const partialDashboard = dashboardWith({
      generatedAt: '2026-05-26T10:08:00.000Z',
      source: {
        name: 'repository-backed live source',
        freshness: 'partial',
        updatedAt: '2026-05-26T10:07:00.000Z',
        lagMs: 60000,
      },
    });

    const staleDashboard = dashboardWith({
      generatedAt: '2026-05-26T10:25:00.000Z',
      source: {
        name: 'repository-backed live source',
        freshness: 'stale',
        updatedAt: '2026-05-26T10:05:00.000Z',
        lagMs: 1200000,
      },
    });

    const { rerender } = render(<DashboardShell state={{ status: 'ready', dashboard: delayedDashboard }} />);
    expect(screen.getAllByText('Delayed').length).toBeGreaterThan(0);
    expect(screen.getByText(/Delayed by about 1 minute behind live clock/)).toBeInTheDocument();

    rerender(<DashboardShell state={{ status: 'ready', dashboard: partialDashboard }} />);
    expect(screen.getAllByText('Partial feed').length).toBeGreaterThan(0);
    expect(screen.getByText(/Partial feed ·/)).toBeInTheDocument();

    rerender(<DashboardShell state={{ status: 'ready', dashboard: staleDashboard }} />);
    expect(screen.getAllByText('Stale').length).toBeGreaterThan(0);
    expect(screen.getByText(/Stale by about 20 minutes behind live clock/)).toBeInTheDocument();
  });

  it('shows an empty state when there are no missions', () => {
    render(<DashboardShell state={{ status: 'ready', dashboard: buildDashboardResponse([]) }} />);

    expect(screen.getByText('No mission data yet')).toBeInTheDocument();
    expect(screen.getByText('Waiting for the first canonical mission to appear.')).toBeInTheDocument();
  });
});
