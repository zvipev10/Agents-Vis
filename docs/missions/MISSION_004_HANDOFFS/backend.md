# Mission 004 Backend Handoff

## Completed
- Mission 004 is defined as the live-truth ingestion mission
- The backend keeps the timeline API read-only and production-safe
- The backend points at a canonical production live source for the final release
- The backend also ingests updates into that source so the displayed truth stays current
- The safest practical ingestion path supported in code is polling a configured HTTPS JSON endpoint via `AGENTS_VIS_DASHBOARD_SOURCE_URL`
- The repo-backed live source snapshot now includes Mission 004 as the latest mission
- The code path for remote source polling is implemented and covered by tests
- Production now reads the refreshed canonical live source snapshot and surfaces Mission 004 with explicit delayed freshness

## Current backend behavior target
- Keep `GET /api/missions/latest` stable
- Keep latest-mission-only selection
- Keep chronological ordering
- Keep parallel metadata intact
- Keep freshness / delayed / stale / lag fields intact
- Keep cache behavior predictable in production
- Keep ingestion safe, explicit, and resumable
- Document each backend step in a PDF artifact stored in the repo at `docs/missions/pdfs/`
- This run revalidated the backend locally with the full repo test suite, typecheck, and build, then the live deployment picked up the refreshed Mission 004 snapshot

## Production source target
- The final release should not depend on a frozen snapshot
- The production live source is explicit and verifiable
- The repo has a verified live JSON source to point at: `https://raw.githubusercontent.com/zvipev10/Agents-Vis/main/src/lib/dashboard-live-source.json`
- This run verified that `AGENTS_VIS_DASHBOARD_SOURCE_URL` can poll that live JSON source locally and return Mission 004
- The remaining backend work is now just ongoing refresh hygiene, not a release blocker
- The team should prefer polling a remote JSON endpoint over webhook when the source can expose JSON directly
- Webhook is not required
- Production is reading Mission 004 data from the refreshed canonical live source snapshot, and delayed freshness remains visible by design

## Next backend step
Keep the ingestion path and source shape stable while preserving visible freshness semantics in production, and refresh the canonical live source as new truth arrives.

## Live production note
- The deployed app is serving the Mission 004 snapshot and delayed freshness data
- Production smoke this run confirmed `GET /api/missions/latest` is Mission 004 and `GET /api/dashboard` reports delayed freshness
- Browser title smoke confirmed `Mission 004`
- Markdown handoff updated and the matching PDF artifact was regenerated in `docs/missions/pdfs/`
