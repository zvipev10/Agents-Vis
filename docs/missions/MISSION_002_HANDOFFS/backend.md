# Mission 002 Backend Handoff

## Completed
- Added the read-only `GET /api/missions/latest` endpoint
- Extended the dashboard data model for mission timeline events
- Added concurrency metadata fields:
  - `sequenceIndex`
  - `parallelGroupId`
  - `parallelOrder`
  - `parallelSize`
- Added freshness metadata:
  - `freshness`
  - `isStale`
  - `lagMs`
- Added env-driven source file override support
- Switched the default source to the repository-backed live store at `docs/missions/MISSION_002_LIVE_SOURCE.json`
- Removed fixture-backed fallback behavior from the default path
- Added runtime filtering for malformed source entries
- Latest mission selection now uses `updatedAt` recency rather than array order
- Timeline events are filtered to the selected mission before response assembly

## Current contract
- Latest mission only
- Chronological ordering
- Full timeline history in response
- Read-only payload
- Cache-control set to `no-store, max-age=0`

## Current source behavior
- Default source is the repository-backed live store at `docs/missions/MISSION_002_LIVE_SOURCE.json`
- If `AGENTS_VIS_DASHBOARD_SOURCE_FILE` is set, the source loader will read `records` and `eventRecords` from that file first
- If the override is absent or invalid, the loader falls back to the repo live store and returns empty data if neither source is usable
- `AGENTS_VIS_DASHBOARD_SOURCE_NAME` still overrides the returned `source.name`

## Verification
- `pnpm typecheck` passed
- `pnpm vitest run src/lib/dashboard-source.test.ts src/lib/dashboard-service.test.ts src/lib/dashboard-data.test.ts src/app/api/dashboard/route.test.ts src/app/api/missions/latest/route.test.ts` passed
- Runtime smoke confirmed `GET /api/missions/latest` returns the live-source payload with preserved freshness and parallel metadata

## Next backend step
Future work can replace the repository live source file with a real mission event store while keeping the response shape stable.
