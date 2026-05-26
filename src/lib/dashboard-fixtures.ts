import type { MissionRecord } from './dashboard-types';

export const dashboardMissionRecords: MissionRecord[] = [
  {
    id: 'mission-001',
    title: 'Reconnect the visibility brief',
    status: 'running',
    updatedAt: '2026-05-26T07:40:00.000Z',
    actorName: 'Ari',
    actorRole: 'Coordinator',
    action: 'reframed the delivery gates',
    detail: 'Clarified the privacy, read-only, and preview-first expectations for the visibility application.',
  },
  {
    id: 'mission-002',
    title: 'Stabilize the dashboard contract',
    status: 'completed',
    updatedAt: '2026-05-26T07:44:00.000Z',
    actorName: 'Mira',
    actorRole: 'Backend Developer',
    action: 'validated the typed response contract',
    detail: 'Added runtime checks and graceful fallbacks for partially missing source data.',
  },
  {
    id: 'mission-003',
    title: 'Finalize visibility polish',
    status: 'running',
    updatedAt: '2026-05-26T07:52:00.000Z',
    actorName: null,
    actorRole: null,
    action: null,
    detail: null,
    summary: 'The latest pass is still being reconciled after hardening.',
  },
];

export const emptyDashboardMissionRecords: MissionRecord[] = [];