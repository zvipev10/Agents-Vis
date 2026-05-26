'use client';

import type { MissionCard as MissionCardData } from '../../lib/dashboard-types';

interface MissionCardProps {
  mission: MissionCardData;
  featured?: boolean;
}

function formatUpdatedAt(updatedAt: string | null): string {
  if (!updatedAt) {
    return 'Timestamp unavailable';
  }

  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'Timestamp unavailable';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

function statusLabel(status: MissionCardData['status']): string {
  if (status === 'running') {
    return 'Running';
  }

  if (status === 'completed') {
    return 'Completed';
  }

  return 'Status unavailable';
}

function statusClass(status: MissionCardData['status']): string {
  if (status === 'running') {
    return 'badge--running';
  }

  if (status === 'completed') {
    return 'badge--completed';
  }

  return 'badge--unknown';
}

export function MissionCard({ mission, featured = false }: MissionCardProps) {
  return (
    <article className={`panel panel-padding mission-card ${featured ? 'mission-card--featured' : ''}`} aria-label={mission.title}>
      <div className="mission-card__topline">
        {mission.isLatest ? <span className="badge badge--latest">Latest mission</span> : null}
        <span className={`badge ${statusClass(mission.status)}`}>{statusLabel(mission.status)}</span>
      </div>

      <header>
        <h3 className="mission-headline">{mission.headline}</h3>
      </header>

      <p className="mission-detail">{mission.detail}</p>

      <ul className="mission-meta" aria-label="Mission metadata">
        <li>{mission.title}</li>
        <li>{formatUpdatedAt(mission.updatedAt)}</li>
      </ul>
    </article>
  );
}