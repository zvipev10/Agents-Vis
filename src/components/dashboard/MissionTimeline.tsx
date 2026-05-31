'use client';
import { useState } from 'react';
import type { DashboardResponse, MissionCard as MissionCardData, MissionTimelineEvent } from '../../lib/dashboard-types';

interface MissionTimelineProps {
  dashboard: DashboardResponse;
}

interface TimelineGroup {
  id: string;
  kind: 'single' | 'parallel';
  events: MissionTimelineEvent[];
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Updated at unavailable';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Updated at unavailable';
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

function freshnessTone(dashboard: DashboardResponse): 'fresh' | 'partial' | 'delayed' | 'stale' | 'empty' {
  if (dashboard.summary.total === 0) {
    return 'empty';
  }

  const minutesBehind = lagMinutes(dashboard.generatedAt, dashboard.source.updatedAt);
  const sourceFreshness = dashboard.source.freshness;

  if (sourceFreshness === 'stale' || (minutesBehind !== null && minutesBehind >= 15)) {
    return 'stale';
  }

  if (sourceFreshness === 'partial') {
    return 'partial';
  }

  if (sourceFreshness === 'delayed' || (minutesBehind !== null && minutesBehind >= 1)) {
    return 'delayed';
  }

  return 'fresh';
}

function freshnessLabel(tone: ReturnType<typeof freshnessTone>): string {
  if (tone === 'fresh') {
    return 'Live';
  }

  if (tone === 'delayed') {
    return 'Delayed';
  }

  if (tone === 'partial') {
    return 'Partial feed';
  }

  if (tone === 'stale') {
    return 'Stale';
  }

  return 'No mission data yet';
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

function missionActorLabel(mission: MissionCardData | null): string {
  if (!mission) {
    return 'No agent activity yet';
  }

  return mission.actorRole ? `${mission.actorName} · ${mission.actorRole}` : mission.actorName;
}

function eventActorLabel(event: MissionTimelineEvent): string {
  return event.actorRole ? `${event.actorName} · ${event.actorRole}` : event.actorName;
}

function sequenceLabel(sequenceIndex: number): string {
  return `Step ${String(sequenceIndex).padStart(2, '0')}`;
}

function eventStatusLabel(status: MissionTimelineEvent['eventStatus']): string {
  switch (status) {
    case 'started':
      return 'Started';
    case 'updated':
      return 'Updated';
    case 'blocked':
      return 'Blocked';
    case 'resumed':
      return 'Resumed';
    case 'completed':
      return 'Completed';
    default:
      return 'Status unavailable';
  }
}

const TIMELINE_EVENT_STATUSES: MissionTimelineEvent['eventStatus'][] = ['started', 'updated', 'blocked', 'resumed', 'completed'];

function formatDurationMs(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  const seconds = Math.round(durationMs / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  return remainderSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainderSeconds}s`;
}

function displayTaskId(event: MissionTimelineEvent): string {
  const fallbackTaskId = `${event.missionId}-step-${String(event.sequenceIndex).padStart(2, '0')}`;
  const normalizedTaskId = event.taskId.trim();

  if (normalizedTaskId.length === 0 || normalizedTaskId.toLowerCase() === 'unknown') {
    return fallbackTaskId;
  }

  return normalizedTaskId;
}

function buildSearchText(event: MissionTimelineEvent): string {
  return [event.action, event.detail, event.summary].filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ').toLowerCase();
}

function formatEventStateLabel(event: MissionTimelineEvent): string {
  if (event.eventStatus === 'blocked') {
    return 'Blocked';
  }

  if (event.eventStatus === 'resumed') {
    return event.durationMs ? `Resumed · ${formatDurationMs(event.durationMs)}` : 'Resumed';
  }

  return eventStatusLabel(event.eventStatus);
}

function roleOptions(events: MissionTimelineEvent[]): string[] {
  return Array.from(new Set(events.map((event) => event.actorRole).filter((value): value is string => Boolean(value)))).sort((left, right) => left.localeCompare(right));
}

function groupTimelineEvents(events: MissionTimelineEvent[]): TimelineGroup[] {
  const groups: TimelineGroup[] = [];

  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];

    if (event.parallelGroupId && event.parallelSize && event.parallelSize > 1) {
      const existingGroup = groups[groups.length - 1];
      if (existingGroup?.kind === 'parallel' && existingGroup.id === event.parallelGroupId) {
        existingGroup.events.push(event);
        continue;
      }

      groups.push({
        id: event.parallelGroupId,
        kind: 'parallel',
        events: [event],
      });
      continue;
    }

    groups.push({
      id: event.id,
      kind: 'single',
      events: [event],
    });
  }

  return groups;
}

function freshnessBadgeClass(freshness: MissionTimelineEvent['freshness']): string {
  if (freshness === 'fresh') {
    return 'badge--fresh';
  }

  if (freshness === 'partial') {
    return 'badge--partial';
  }

  if (freshness === 'delayed') {
    return 'badge--delayed';
  }

  if (freshness === 'stale') {
    return 'badge--stale';
  }

  return 'badge--source';
}

function freshnessEventLabel(freshness: MissionTimelineEvent['freshness']): string {
  if (freshness === 'fresh') {
    return 'Live';
  }

  if (freshness === 'partial') {
    return 'Partial feed';
  }

  if (freshness === 'stale') {
    return 'Stale';
  }

  if (freshness === 'delayed') {
    return 'Delayed';
  }

  return 'Unavailable';
}

function timelineLagLabel(freshness: ReturnType<typeof freshnessTone>, lag: number | null): string {
  if (lag === null) {
    return 'Lag unavailable';
  }

  if (freshness === 'stale') {
    return `Stale by about ${lag} minute${lag === 1 ? '' : 's'} behind live clock`;
  }

  if (freshness === 'delayed') {
    return `Delayed by about ${lag} minute${lag === 1 ? '' : 's'} behind live clock`;
  }

  if (freshness === 'partial') {
    return `Partial feed · ${lag} minute${lag === 1 ? '' : 's'} behind live clock`;
  }

  return 'Live · in sync with the live clock';
}

export function MissionTimeline({ dashboard }: MissionTimelineProps) {
  const latestMission = dashboard.latestMission;
  const freshness = freshnessTone(dashboard);
  const lag = lagMinutes(dashboard.generatedAt, dashboard.source.updatedAt);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');

  const roleFilterOptions = roleOptions(dashboard.timeline.events);
  const searchTerm = searchQuery.trim().toLowerCase();
  const filteredEvents = dashboard.timeline.events.filter((event) => {
    const matchesSearch = searchTerm === '' || buildSearchText(event).includes(searchTerm);
    const matchesRole = roleFilter === 'all' || event.actorRole === roleFilter;
    const matchesStatus = statusFilter === 'all' || event.eventStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const noMatchResults = dashboard.timeline.events.length > 0 && filteredEvents.length === 0;
  const timelineGroups = groupTimelineEvents(filteredEvents);
  const eventCountLabel = dashboard.timeline.eventCount === 1 ? '1 recorded step' : `${dashboard.timeline.eventCount} recorded steps`;
  const parallelGroupCount = timelineGroups.filter((group) => group.kind === 'parallel').length;

  return (
    <section className="panel panel-padding mission-timeline" aria-label="Latest mission timeline">
      <div className="mission-timeline__header">
        <div className="mission-timeline__headline-group">
          <p className="eyebrow">Latest mission replay</p>
          <h2 className="panel-title">One mission, one timeline</h2>
          <p className="mission-detail">
            Read the latest mission as a story: who acted, what changed, and why it matters, while keeping chronology,
            visible parallel work, and freshness cues intact.
          </p>
        </div>

        <div className="mission-timeline__filters" style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
          <input
            type="text"
            placeholder="Search action, detail, or summary..."
            value={searchQuery}
            aria-label="Search action, detail, or summary"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={roleFilter} aria-label="Role filter" onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            {roleFilterOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select value={statusFilter} aria-label="Status filter" onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {TIMELINE_EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {eventStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="mission-timeline__status" aria-label="Mission freshness status">
          <span className={`badge badge--${freshness}`}>{freshnessLabel(freshness)}</span>
          <span className="badge badge--latest">Latest mission only</span>
          <span className="badge badge--source">{eventCountLabel}</span>
        </div>
      </div>

      <div className="mission-timeline__meta-row" aria-label="Timeline metadata">
        <div className="mission-timeline__meta-card">
          <span className="mission-timeline__meta-label">Mission focus</span>
          <strong>{latestMission ? latestMission.title : 'No mission data yet'}</strong>
          <span>{latestMission ? statusLabel(latestMission.status) : 'Waiting for the first canonical mission to appear.'}</span>
        </div>
        <div className="mission-timeline__meta-card">
          <span className="mission-timeline__meta-label">Who acted</span>
          <strong>{missionActorLabel(latestMission)}</strong>
          <span>{latestMission ? latestMission.action : 'The latest mission will describe who acted once it begins.'}</span>
        </div>
        <div className="mission-timeline__meta-card">
          <span className="mission-timeline__meta-label">Why it matters</span>
          <strong>{latestMission ? latestMission.headline : 'No narrative yet'}</strong>
          <span>{latestMission ? latestMission.detail : 'Detail will appear here when the latest mission includes agent-written context.'}</span>
        </div>
        <div className="mission-timeline__meta-card">
          <span className="mission-timeline__meta-label">Updated at</span>
          <strong>{formatDateTime(dashboard.source.updatedAt)}</strong>
          <span>{timelineLagLabel(freshness, lag)}</span>
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
              <h3 className="timeline-event__title">Replay connected to the latest mission</h3>
              <p className="timeline-event__body">
                The app shows a single read-only timeline for the newest mission and keeps the narrative in chronological order.
              </p>
              {latestMission ? (
                <div className="timeline-event__footer">
                  <span className="badge badge--source">{latestMission.title}</span>
                  <span className={`badge ${latestMission.status === 'running' ? 'badge--running' : latestMission.status === 'completed' ? 'badge--completed' : 'badge--unknown'}`}>
                    {statusLabel(latestMission.status)}
                  </span>
                </div>
              ) : null}
            </div>
          </article>

          {noMatchResults ? (
            <article className="timeline-event timeline-event--empty" aria-label="No matching timeline events">
              <div className="timeline-event__card timeline-event__card--empty">
                <div className="timeline-event__meta">
                  <span className="timeline-event__index">--</span>
                  <span className="timeline-event__time">No matches found</span>
                </div>
                <h3 className="timeline-event__title">No events match the current filters</h3>
                <p className="timeline-event__body">
                  Clear search or relax the role and status filters to bring the latest mission steps back into view.
                </p>
              </div>
            </article>
          ) : timelineGroups.length > 0 ? (
            timelineGroups.map((group) => {
              const firstEvent = group.events[0];

              if (!firstEvent) {
                return null;
              }

              if (group.kind === 'parallel') {
                return (
                  <article
                    key={group.id}
                    className="timeline-event timeline-event--parallel"
                    aria-label={`Parallel activity starting at step ${firstEvent.sequenceIndex}`}
                  >
                    <div className="timeline-event__card">
                      <div className="timeline-event__meta">
                        <span className="timeline-event__index">{sequenceLabel(firstEvent.sequenceIndex)}</span>
                        <span className="timeline-event__time">{formatDateTime(firstEvent.timestamp)}</span>
                      </div>
                      <h3 className="timeline-event__title">Parallel work stayed visible without losing order</h3>
                      <p className="timeline-event__body">
                        These updates happened together in the story, and the lanes below keep each actor and action readable.
                      </p>

                      <div className="parallel-grid" role="list" aria-label="Parallel lanes">
                        {group.events.map((event) => {
                          const laneNumber = event.parallelOrder !== null ? event.parallelOrder + 1 : group.events.indexOf(event) + 1;
                          const laneSize = event.parallelSize ?? group.events.length;

                          return (
                            <div
                              key={event.id}
                              className={`parallel-lane ${event.freshness === 'stale' ? '' : 'parallel-lane--live'}`}
                              role="listitem"
                              aria-label={eventActorLabel(event)}
                            >
                              <span className="timeline-event__index">Lane {laneNumber} of {laneSize}</span>
                              <h4>{eventActorLabel(event)}</h4>
                              <p>{event.action}</p>
                              {event.detail ? <p className="timeline-event__detail">{event.detail}</p> : null}
                              <div className="timeline-event__footer">
                                <span className="badge badge--source">{event.sourceLabel ?? 'Live source'}</span>
                                <span className={`badge ${freshnessBadgeClass(event.freshness)}`}>{freshnessEventLabel(event.freshness)}</span>
                                <span className="badge badge--status">{eventStatusLabel(event.eventStatus)}</span>
                                <span className="badge badge--role">Role: {event.actorRole ?? 'Unknown'}</span>
                                <span className="badge badge--task">Task: {displayTaskId(event)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              }

              const event = firstEvent;

              return (
                <article key={group.id} className="timeline-event" aria-label={`Timeline step ${event.sequenceIndex}`}>
                  <div className="timeline-event__card">
                    <div className="timeline-event__meta">
                      <span className="timeline-event__index">{sequenceLabel(event.sequenceIndex)}</span>
                      <span className="timeline-event__time">{formatDateTime(event.timestamp)}</span>
                    </div>
                    <h3 className="timeline-event__title">{eventActorLabel(event)}</h3>
                    <p className="timeline-event__body">{event.action}</p>
                    {event.detail ? <p className="timeline-event__detail">{event.detail}</p> : null}
                    {event.summary ? <p className="timeline-event__summary">{event.summary}</p> : null}
                    <div className="timeline-event__footer">
                      <span className="badge badge--source">{event.sourceLabel ?? 'Live source'}</span>
                      <span className={`badge ${freshnessBadgeClass(event.freshness)}`}>
                        {freshnessEventLabel(event.freshness)}
                      </span>
                      {event.eventStatus === 'blocked' ? (
                        <span className="badge badge--blocked" role="status" aria-label="blocked">
                          Blocked
                        </span>
                      ) : event.eventStatus === 'resumed' ? (
                        <span className="badge badge--resumed">{formatEventStateLabel(event)}</span>
                      ) : (
                        <span className="badge badge--status">{eventStatusLabel(event.eventStatus)}</span>
                      )}
                      <span className="badge badge--role">Role: {event.actorRole ?? 'Unknown'}</span>
                      <span className="badge badge--task">Task: {displayTaskId(event)}</span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <article className="timeline-event timeline-event--empty" aria-label="Empty timeline">
              <div className="timeline-event__card timeline-event__card--empty">
                <div className="timeline-event__meta">
                  <span className="timeline-event__index">01</span>
                  <span className="timeline-event__time">No recorded steps yet</span>
                </div>
                <h3 className="timeline-event__title">No mission data yet</h3>
                <p className="timeline-event__body">
                  The latest mission will appear here once the first canonical event stream starts.
                </p>
              </div>
            </article>
          )}

          <article className="timeline-event timeline-event--lag" aria-label="Lag and freshness status">
            <div className="timeline-event__card timeline-event__card--status">
              <div className="timeline-event__meta">
                <span className="timeline-event__index">{String((timelineGroups.length || 0) + 1).padStart(2, '0')}</span>
                <span className="timeline-event__time">Freshness monitor</span>
              </div>
              <h3 className="timeline-event__title">
                {freshness === 'stale'
                  ? 'This view is stale and should be treated as lagging'
                  : freshness === 'delayed'
                    ? 'This view is delayed but still usable'
                    : freshness === 'partial'
                      ? 'This view is partial and some fields are still missing'
                      : 'This view is live and current'}
              </h3>
              <p className="timeline-event__body">
                {freshness === 'stale'
                  ? 'New events are overdue compared with the latest source update, so the UI should visibly warn the user.'
                  : freshness === 'delayed'
                    ? 'The view is behind the live clock, but the timeline still remains readable and useful.'
                    : freshness === 'partial'
                      ? 'Some content is still missing, so the UI labels the gaps without hiding the timeline.'
                      : 'The dashboard is current and ready for read-only replay.'}
              </p>
              <div className="timeline-event__footer">
                <span className="badge badge--source">{parallelGroupCount} parallel group{parallelGroupCount === 1 ? '' : 's'}</span>
                <span className={`badge badge--${freshness}`}>{freshnessLabel(freshness)}</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="mission-timeline__footer">
        <span>Source: {dashboard.source.name}</span>
        <span>Generated at: {formatDateTime(dashboard.generatedAt)}</span>
      </div>
    </section>
  );
}
