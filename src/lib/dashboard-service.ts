import { dashboardMissionRecords } from './dashboard-fixtures';
import { buildDashboardResponse } from './dashboard-data';
import type { DashboardResponse, MissionRecord } from './dashboard-types';

export function getDashboardResponse(records: readonly MissionRecord[] = dashboardMissionRecords): DashboardResponse {
  return buildDashboardResponse(records);
}