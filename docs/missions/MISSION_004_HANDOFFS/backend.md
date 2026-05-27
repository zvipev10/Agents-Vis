# Mission 004 Backend Handoff

## Completed
- Mission 004 is defined as the live-truth ingestion mission
- The backend must keep the timeline API read-only and production-safe
- The backend must point at a canonical production live source for the final release
- The backend must also ingest updates into that source so the displayed truth stays current
- The safest practical ingestion path now supported in code is polling a configured HTTPS JSON endpoint via `AGENTS_VIS_DASHBOARD_SOURCE_URL`
- The repo-backed live source snapshot now includes Mission 004 as the latest mission
- The code path for remote source polling is already implemented and covered by tests

## Current backend behavior target
- Keep `GET /api/missions/latest` stable
- Keep latest-mission-only selection
- Keep chronological ordering
- Keep parallel metadata intact
- Keep freshness / stale / lag fields intact
- Keep cache behavior predictable in production
- Keep ingestion safe, explicit, and resumable
- Document each backend step in a PDF artifact stored in the repo at `docs/missions/pdfs/`
- This run revalidated the backend locally with the full repo test suite, typecheck, and build

## Production source target
- The final release should not depend on a frozen snapshot
- The production live source must be explicit and verifiable
- If no canonical production source exists yet, that is the first backend blocker to solve
- The team should prefer polling a remote JSON endpoint over webhook when the source can expose JSON directly
- Webhook is not required
- Production is still reading Mission 003 data, so the remaining blocker is deployment / external source wiring rather than backend implementation

## Next backend step
Confirm or implement the canonical production live source, then build the ingestion path that updates it, and verify the API response shape against that source in production with tests for the source and ingestion switch.

## Live production note
- The deployed app is still serving the Mission 003 snapshot and stale freshness data
- That means the repo changes are not yet wired to a live Mission 004 source in production
- Production smoke this run confirmed `GET /api/missions/latest` is still Mission 003 and `GET /api/dashboard` still reports stale freshness
