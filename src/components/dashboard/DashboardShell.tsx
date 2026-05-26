'use client';

import type { DashboardResponse } from '../../lib/dashboard-types';
import { MissionHighlightCard } from './MissionHighlightCard';
import { MissionList } from './MissionList';

export type DashboardViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; dashboard: DashboardResponse };

interface DashboardShellProps {
  state: DashboardViewState;
}

function LoadingState() {
  return (
    <div className="dashboard-grid" aria-label="Loading dashboard">
      <div className="panel panel-padding loading-state skeleton" aria-hidden="true">
        <div className="skeleton-line short" />
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
      <div className="panel panel-padding loading-state skeleton" aria-hidden="true">
        <div className="skeleton-line short" />
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="panel panel-padding empty-state" role="status" aria-label="Empty dashboard">
      <h2 className="panel-title">No missions available</h2>
      <p className="mission-detail">The visibility feed is empty right now. The dashboard will show the latest updated mission here once records exist.</p>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="panel panel-padding error-state" role="alert" aria-label="Dashboard error">
      <h2 className="panel-title">Dashboard unavailable</h2>
      <p className="mission-detail">{message}</p>
    </section>
  );
}

export function DashboardShell({ state }: DashboardShellProps) {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Private visibility application</p>
        <h1 className="title">Mission 001</h1>
        <p className="lede">A calm, read-only view of what the autonomous agents team is doing now, what has completed, and who did each step.</p>
      </section>

      {state.status === 'loading' ? <LoadingState /> : null}
      {state.status === 'error' ? <ErrorState message={state.message} /> : null}

      {state.status === 'ready' ? (
        <section className="dashboard-grid" aria-label="Mission dashboard">
          <div className="summary-row" aria-label="Dashboard summary">
            <span className="summary-chip">{state.dashboard.summary.running} running</span>
            <span className="summary-chip">{state.dashboard.summary.completed} completed</span>
            <span className="summary-chip">{state.dashboard.summary.total} total</span>
            <span className="summary-chip">{state.dashboard.source.freshness} source</span>
          </div>

          {state.dashboard.latestMission ? <MissionHighlightCard mission={state.dashboard.latestMission} /> : <EmptyState />}

          {state.dashboard.missions.length > 1 ? <MissionList missions={state.dashboard.missions.slice(1)} /> : state.dashboard.latestMission ? <MissionList missions={[]} /> : null}
        </section>
      ) : null}
    </main>
  );
}