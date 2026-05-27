'use client';

import type { DashboardResponse, MissionCard as MissionCardData } from '../../lib/dashboard-types';

function missionLabelFromId(id: string | null | undefined): string {
  if (!id) {
    return 'Mission replay';
  }

  const match = /^mission-(.+)$/.exec(id);
  return match ? `Mission ${match[1]}` : 'Mission replay';
}


interface MissionTimelineProps {
  dashboard: DashboardResponse;
}

interface TimelineLane {
  id: string;
  title: string;
  tone: 'live' | 'muted';
  detail: string;
}

const PARALLEL_LANES: TimelineLane[] = [
  {
    id: 'coordination',
    title: 'Coordination lane',
    tone: 'live',
    detail: 'Coordinator decisions stay visible here while the mission remains in flight.',
  },
  {
    id: 'execution',
    title: 'Execution lane',
    tone: 'muted',
    detail: 'Backend, frontend, and QA work will split into their own visible tracks once the event contract includes concurrency metadata.',
  },
];

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Timestamp unavailable';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Timestamp unavailable';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

function toMillis(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function lagMinutes(generatedAt: string, updatedAt: string | null): number | null {
  const generated = toMillis(generatedAt);
  const source = toMillis(updatedAt);

  if (generated === null || source === null) {
    return null;
  }

  return Math.max(0, Math.round((generated - source) / 60000));
}

function freshnessTone(dashboard: DashboardResponse): 'fresh' | 'partial' | 'stale' | 'empty' {
  if (dashboard.summary.total === 0) {
    return 'empty';
  }

  const minutesBehind = lagMinutes(dashboard.generatedAt, dashboard.source.updatedAt);
  if (minutesBehind !== null && minutesBehind >= 5) {
    return 'stale';
  }

  if (dashboard.source.freshness === 'partial') {
    return 'partial';
  }

  return 'fresh';
}

function freshnessLabel(tone: ReturnType<typeof freshnessTone>): string {
  if (tone === 'fresh') {
    return 'Live';
  }

  if (tone === 'partial') {
    return 'Partial feed';
  }

  if (tone === 'stale') {
    return 'Stale';
  }

  return 'Empty';
}

function missionLabel(mission: MissionCardData | null): string {
  if (!mission) {
    return 'No mission event available';
  }

  return mission.actorRole ? `${mission.actorName} · ${mission.actorRole}` : mission.actorName;
}

export function MissionTimeline({ dashboard }: MissionTimelineProps) {
  const latestMission = dashboard.latestMission;
  const freshness = freshnessTone(dashboard);
  const lag = lagMinutes(dashboard.generatedAt, dashboard.source.updatedAt);
  const replayLabel = latestMission ? `${missionLabelFromId(latestMission.id)} replay` : 'Mission replay';

  return (
    <section className="panel panel-padding mission-timeline" aria-label="Latest mission timeline">
      <div className="mission-timeline__header">
        <div className="mission-timeline__headline-group">
          <p className="eyebrow">{replayLabel}</p>
          <h2 className="panel-title">Last mission only</h2>
          <p className="mission-detail">
            One chronological feed for the latest mission. Events remain in order, concurrent work can fan out into lanes,
            and lag is called out when the source stops moving.
          </p>
        </div>

        <div className="mission-timeline__status" aria-label="Mission freshness status">
          <span className={`badge badge--${freshness}`}>{freshnessLabel(freshness)}</span>
          <span className="badge badge--latest">Latest mission only</span>
          <span className="badge badge--source">{dashboard.summary.total} feed snapshots</span>
        </div>
      </div>

      <div className="mission-timeline__meta-row" aria-label="Timeline metadata">
        <div className="mission-timeline__meta-card">
          <span className="mission-timeline__meta-label">Latest activity</span>
          <strong>{latestMission ? latestMission.headline : 'Waiting for the next live event'}</strong>
          <span>{latestMission ? missionLabel(latestMission) : 'No agent activity yet'}</span>
        </div>
        <div className="mission-timeline__meta-card">
          <span className="mission-timeline__meta-label">Source updated</span>
          <strong>{formatDateTime(dashboard.source.updatedAt)}</strong>
          <span>
            {lag === null
              ? 'Lag cannot be calculated yet'
              : freshness === 'stale'
                ? `Stale by about ${lag} minute${lag === 1 ? '' : 's'}`
                : `${lag} minute${lag === 1 ? '' : 's'} behind the live clock`}
          </span>
        </div>
        <div className="mission-timeline__meta-card">
          <span className="mission-timeline__meta-label">Replay depth</span>
          <strong>{dashboard.summary.total} recorded items</strong>
          <span>{dashboard.summary.running} running, {dashboard.summary.completed} completed</span>
        </div>
      </div>

      <div className="mission-timeline__scroll" aria-label="Chronological mission history">
        <div className="timeline-rail">
          <article className="timeline-event timeline-event--start" aria-label="Replay start">
            <div className="timeline-event__card">
              <div className="timeline-event__meta">
                <span className="timeline-event__index">00</span>
                <span className="timeline-event__time">Mission opened</span>
              </div>
              <h3 className="timeline-event__title">Replay shell connected</h3>
              <p className="timeline-event__body">
                The timeline opens on the latest mission and will keep extending as new events arrive.
              </p>
            </div>
          </article>

          {latestMission ? (
            <article className="timeline-event timeline-event--current" aria-label="Current mission event" aria-live="polite">
              <div className="timeline-event__card timeline-event__card--current">
                <div className="timeline-event__meta">
                  <span className="timeline-event__index">01</span>
                  <span className="timeline-event__time">{formatDateTime(latestMission.updatedAt)}</span>
                </div>
                <h3 className="timeline-event__title">{latestMission.headline}</h3>
                <p className="timeline-event__body">{latestMission.detail}</p>
                <div className="timeline-event__footer">
                  <span className="badge badge--source">{latestMission.title}</span>
                  <span className={`badge ${latestMission.status === 'running' ? 'badge--running' : latestMission.status === 'completed' ? 'badge--completed' : 'badge--unknown'}`}>
                    {latestMission.status === 'running' ? 'Running' : latestMission.status === 'completed' ? 'Completed' : 'Status unavailable'}
                  </span>
                </div>
              </div>
            </article>
          ) : (
            <article className="timeline-event timeline-event--empty" aria-label="Empty timeline">
              <div className="timeline-event__card timeline-event__card--empty">
                <div className="timeline-event__meta">
                  <span className="timeline-event__index">01</span>
                  <span className="timeline-event__time">No data yet</span>
                </div>
                <h3 className="timeline-event__title">No live mission event available</h3>
                <p className="timeline-event__body">The timeline will fill in automatically once the last mission emits event data.</p>
              </div>
            </article>
          )}

          <article className="timeline-event timeline-event--parallel" aria-label="Parallel activity scaffold">
            <div className="timeline-event__card">
              <div className="timeline-event__meta">
                <span className="timeline-event__index">02</span>
                <span className="timeline-event__time">Parallel workstream</span>
              </div>
              <h3 className="timeline-event__title">Concurrent activity will appear as separate lanes</h3>
              <p className="timeline-event__body">
                This scaffold reserves room for parallel agent work so overlapping execution does not get flattened into a single row.
              </p>

              <div className="parallel-grid" role="list" aria-label="Parallel lanes">
                {PARALLEL_LANES.map((lane) => (
                  <div
                    key={lane.id}
                    className={`parallel-lane parallel-lane--${lane.tone}`}
                    role="listitem"
                    aria-label={lane.title}
                  >
                    <span className="timeline-event__index">Lane</span>
                    <h4>{lane.title}</h4>
                    <p>{lane.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="timeline-event timeline-event--lag" aria-label="Lag and freshness status">
            <div className="timeline-event__card timeline-event__card--status">
              <div className="timeline-event__meta">
                <span className="timeline-event__index">03</span>
                <span className="timeline-event__time">Freshness monitor</span>
              </div>
              <h3 className="timeline-event__title">
                {freshness === 'stale' ? 'The feed is stale and should be treated as lagging' : 'The feed is still current enough for live replay'}
              </h3>
              <p className="timeline-event__body">
                {freshness === 'stale'
                  ? 'New events are overdue compared with the latest source update, so the UI should visibly warn the user.'
                  : 'When the source slows down, this slot will surface stale or delayed data instead of silently hiding the gap.'}
              </p>
            </div>
          </article>
        </div>
      </div>

      <div className="mission-timeline__footer">
        <span>Source: {dashboard.source.name}</span>
        <span>Generated: {formatDateTime(dashboard.generatedAt)}</span>
      </div>
    </section>
  );
}
