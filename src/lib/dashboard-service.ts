import { buildDashboardResponse, buildMissionTimelineResponse, toMillis } from './dashboard-data';
import { loadDashboardDataSource } from './dashboard-source';
import type {
  DashboardResponse,
  MissionRecord,
  MissionTimelineEventRecord,
  MissionTimelineResponse,
} from './dashboard-types';

function selectLatestMissionRecord(
  records: readonly MissionRecord[],
): Pick<MissionRecord, 'id' | 'title' | 'status' | 'updatedAt'> | null {
  if (records.length === 0) {
    return null;
  }

  return [...records]
    .sort((a, b) => {
      const aTime = toMillis(a.updatedAt ?? null);
      const bTime = toMillis(b.updatedAt ?? null);

      if (aTime !== null && bTime !== null && aTime !== bTime) {
        return bTime - aTime;
      }

      if (aTime === null && bTime !== null) {
        return 1;
      }

      if (aTime !== null && bTime === null) {
        return -1;
      }

      const aTitle = (a.title ?? 'Mission update').trim();
      const bTitle = (b.title ?? 'Mission update').trim();
      const titleComparison = aTitle.localeCompare(bTitle);
      if (titleComparison !== 0) {
        return titleComparison;
      }

      return a.id.localeCompare(b.id);
    })[0] ?? null;
}

export async function getDashboardResponse(generatedAt = new Date()): Promise<DashboardResponse> {
  const source = await loadDashboardDataSource();
  return buildDashboardResponse(source.records, generatedAt, source.eventRecords, source.name);
}

export async function getLatestMissionTimelineResponse(generatedAt = new Date()): Promise<MissionTimelineResponse> {
  const source = await loadDashboardDataSource();
  const record = selectLatestMissionRecord(source.records);

  return buildMissionTimelineResponse(record, source.eventRecords, generatedAt, source.name);
}
