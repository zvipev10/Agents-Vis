import { DashboardShell } from '../components/dashboard/DashboardShell';
import { getDashboardResponse } from '../lib/dashboard-service';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const dashboard = await getDashboardResponse();

  return <DashboardShell state={{ status: 'ready', dashboard }} />;
}
