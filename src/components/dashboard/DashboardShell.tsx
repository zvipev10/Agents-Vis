'use client';

import type { DashboardResponse } from '../../lib/dashboard-types';
import { MissionTimeline } from './MissionTimeline';

export type DashboardViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; dashboard: DashboardResponse };

interface DashboardShellProps {
  state: DashboardViewState;
}

function LoadingState() {
  return (
    <section className="panel panel-padding timeline-loading" aria-label="Loading mission timeline">
      <div className="skeleton skeleton--hero" aria-hidden="true">
        <div className="skeleton-line short" />
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
      <div className="timeline-loading__stack" aria-hidden="true">
        <div className="skeleton skeleton--event">
          <div className="skeleton-line short" />
          <div className="skeleton-line long" />
          <div className="skeleton-line medium" />
        </div>
        <div className="skeleton skeleton--event">
          <div className="skeleton-line short" />
          <div className="skeleton-line long" />
          <div className="skeleton-line medium" />
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="panel panel-padding empty-state" role="status" aria-label="Empty timeline">
      <h2 className="panel-title">No mission history yet</h2>
      <p className="mission-detail">The live replay will attach to the latest mission automatically once the event feed starts sending data.</p>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="panel panel-padding error-state" role="alert" aria-label="Timeline error">
      <h2 className="panel-title">Timeline unavailable</h2>
      <p className="mission-detail">{message}</p>
    </section>
  );
}

export function DashboardShell({ state }: DashboardShellProps) {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Private visibility application</p>
        <h1 className="title">Mission 002</h1>
        <p className="lede">A single live replay of the latest mission, with chronological ordering, visible parallel work, and explicit freshness cues.</p>
      </section>

      {state.status === 'loading' ? <LoadingState /> : null}
      {state.status === 'error' ? <ErrorState message={state.message} /> : null}

      {state.status === 'ready' ? (
        <section className="dashboard-grid" aria-label="Mission replay dashboard">
          {state.dashboard.latestMission ? <MissionTimeline dashboard={state.dashboard} /> : <EmptyState />}
        </section>
      ) : null}
    </main>
  );
}