# Mission 003 Backend Handoff

## Completed
- Mission 003 is defined as a production-delivery mission
- The backend must keep the timeline API read-only and production-safe
- The backend must point at a canonical production live source for the final release

## Current backend behavior target
- Keep `GET /api/missions/latest` stable
- Keep latest-mission-only selection
- Keep chronological ordering
- Keep parallel metadata intact
- Keep freshness / stale / lag fields intact
- Keep cache behavior predictable in production

## Production source target
- The final release should not depend on the repository-backed milestone file
- The production live source must be explicit and verifiable
- If no canonical production source exists yet, that is the first backend blocker to solve
- The team may choose webhook push, polling, scheduled sync, or another ingestion path; webhook is not required

## Next backend step
Confirm or implement the canonical production live source, then verify the API response shape against that source in production and add or update tests for the source switch.
