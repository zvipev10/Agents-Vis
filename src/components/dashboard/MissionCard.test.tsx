import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MissionCard } from './MissionCard';

const mission = {
  id: 'mission-001',
  title: 'Reconnect the visibility brief',
  status: 'running' as const,
  headline: 'Ari, Coordinator reframed the delivery gates',
  detail: 'Clarified the privacy, read-only, and preview-first expectations for the visibility application.',
  actorName: 'Ari',
  actorRole: 'Coordinator',
  action: 'reframed the delivery gates',
  updatedAt: '2026-05-26T10:05:00.000Z',
  isLatest: true,
  isPartial: false,
};

describe('MissionCard', () => {
  it('renders actor-first copy and stays read-only', () => {
    render(<MissionCard mission={mission} featured />);

    expect(screen.getByRole('heading', { name: mission.headline })).toBeInTheDocument();
    expect(screen.getByText(mission.detail)).toBeInTheDocument();
    expect(screen.getByText('Latest mission')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
  });
});
