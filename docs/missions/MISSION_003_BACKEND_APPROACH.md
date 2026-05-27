# Mission 003 Backend Approach

## Goal
Make the timeline backend production-safe and point it at the canonical production live source.

## Approach
Keep the current read-only response shape stable, but replace the repository-backed milestone source with the real production source of truth. The backend should continue to serve the latest mission only, preserve ordering and parallel metadata, and expose freshness fields that the frontend and QA can verify in production.

## Backend responsibilities
- Keep `GET /api/missions/latest` read-only
- Preserve the current response contract
- Serve the latest mission only
- Keep chronological ordering stable
- Preserve `sequenceIndex`, `parallelGroupId`, `parallelOrder`, and `parallelSize`
- Preserve freshness metadata (`freshnessState`, `isStale`, `lagMs`, and related fields)
- Make the production source explicit through environment configuration
- Keep cache behavior production-safe and predictable

## Production source decision
The backend should use a canonical production source, not the repo-backed milestone file, for the final mission.
The team may choose the ingestion method that best fits the real source: webhook push, polling, scheduled sync, or another safe path.
Webhook is optional, not required.
If the real store is not yet available, that gap is a blocker for Mission 003 completion.

## Verification targets
- `GET /api/missions/latest` returns the live production source payload
- Response shape remains stable
- Lag / stale information is present and accurate
- Parallel metadata survives the source swap
- Backend tests cover the source switch and contract stability
