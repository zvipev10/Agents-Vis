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

    expect(screen.getByLabelText('Loading mission timeline')).toBeInTheDocument();
  });

  it('renders the live replay timeline for the latest mission only', () => {
    render(<DashboardShell state={{ status: 'ready', dashboard: readyDashboard }} />);

    expect(screen.getByText('Mission 001')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Last mission only' })).toBeInTheDocument();
    expect(screen.getByLabelText('Latest mission timeline')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ari, Coordinator reframed the delivery gates' })).toBeInTheDocument();
    expect(screen.getByText('Parallel workstream')).toBeInTheDocument();
    expect(screen.queryByText('Mission 002')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no missions', () => {
    render(<DashboardShell state={{ status: 'ready', dashboard: buildDashboardResponse([]) }} />);

    expect(screen.getByText('No mission history yet')).toBeInTheDocument();
    expect(screen.getByText('The live replay will attach to the latest mission automatically once the event feed starts sending data.')).toBeInTheDocument();
  });
});
