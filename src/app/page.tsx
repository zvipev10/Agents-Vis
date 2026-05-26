import { DashboardShell } from '../components/dashboard/DashboardShell';
import { getDashboardResponse } from '../lib/dashboard-service';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const dashboard = getDashboardResponse();

  return <DashboardShell state={{ status: 'ready', dashboard }} />;
}