import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildDashboardResponse } from '../../lib/dashboard-data';
import { DashboardShell } from './DashboardShell';

const readyDashboard = buildDashboardResponse([
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
]);

describe('DashboardShell', () => {
  it('shows a loading state before data is ready', () => {
    render(<DashboardShell state={{ status: 'loading' }} />);

    expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument();
  });

  it('renders the latest mission first in a calm read-only layout', () => {
    render(<DashboardShell state={{ status: 'ready', dashboard: readyDashboard }} />);

    expect(screen.getByText('Private visibility application')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ari, Coordinator reframed the delivery gates' })).toBeInTheDocument();
    expect(screen.getByText('Latest mission')).toBeInTheDocument();
    expect(screen.getByText('1 running')).toBeInTheDocument();
    expect(screen.getByText('1 completed')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no missions', () => {
    render(<DashboardShell state={{ status: 'ready', dashboard: buildDashboardResponse([]) }} />);

    expect(screen.getByText('No missions available')).toBeInTheDocument();
    expect(screen.getByText('The visibility feed is empty right now. The dashboard will show the latest updated mission here once records exist.')).toBeInTheDocument();
  });
});
