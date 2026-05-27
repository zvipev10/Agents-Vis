import type { Metadata } from 'next';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { getDashboardResponse } from '../lib/dashboard-service';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const dashboard = await getDashboardResponse();
  const missionTitle = dashboard.latestMission ? dashboard.latestMission.id.replace(/^mission-/, 'Mission ').replace(/-/g, ' ') : 'Agents-Vis';

  return {
    title: missionTitle,
  };
}

export default async function HomePage() {
  const dashboard = await getDashboardResponse();

  return <DashboardShell state={{ status: 'ready', dashboard }} />;
}
