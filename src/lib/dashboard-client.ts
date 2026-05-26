import { assertDashboardResponse, type DashboardResponse } from './dashboard-types';

export async function loadDashboard(
  input: RequestInfo | URL = '/api/dashboard',
  fetchImpl: typeof fetch = fetch,
): Promise<DashboardResponse> {
  const response = await fetchImpl(input, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  return assertDashboardResponse(payload);
}