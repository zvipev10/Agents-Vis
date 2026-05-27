import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildDashboardResponse } from '../../lib/dashboard-data';
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

  it('shows an empty state when there are no missions', () => {
    render(<DashboardShell state={{ status: 'ready', dashboard: buildDashboardResponse([]) }} />);

    expect(screen.getByText('No mission history yet')).toBeInTheDocument();
    expect(screen.getByText('The live replay will attach to the latest mission automatically once the event feed starts sending data.')).toBeInTheDocument();
  });
});
