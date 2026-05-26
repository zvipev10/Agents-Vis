# Mission 001: Minimum Backend Approach

## Goal
Provide a thin, read-only backend that always serves the latest available mission state for the MVP dashboard.

## Minimum architecture
- One read-only API layer acting as a BFF for the dashboard.
- No write endpoints, no mission mutation, no admin tools.
- Prefer direct reads from the mission store; only add a small aggregation/cache layer if needed for performance or source merging.

## Likely data sources
1. Mission records
   - mission id
   - title / label
   - status: running | completed
   - updated_at / last_activity_at
2. Mission update/event log
   - ordered actions taken during the mission
   - actor attribution
   - timestamps
   - short action text
3. Agent/team metadata
   - agent id
   - display name
   - role or team label
4. Optional runtime/source health metadata
   - whether a source is current, partial, or stale

## Read-only API shape
Minimum viable surface:
- GET /api/dashboard
  - Returns the latest mission plus recent missions in one response
- GET /api/missions?status=running,completed&limit=10
  - Returns recent missions for the list
- GET /api/missions/:id
  - Returns a single mission with its action cards

If we want the smallest possible implementation, GET /api/dashboard can be the only required endpoint and can internally compose the list + highlighted mission.

## Response fields needed for the UI
Mission list item:
- id
- title
- status
- updatedAt
- isLatest
- shortSummary
- actorPreview { name, role }

Mission detail/card feed:
- missionId
- actorName
- actorRole
- action
- actionAt
- sourceLabel
- confidence or freshness flag if data is partial

Dashboard wrapper:
- latestMission
- recentMissions
- generatedAt
- sourceStatus

## Default and fallback behavior
- Default selection: most recently updated mission.
- If multiple timestamps exist, use updated_at as the primary sort key and event time as secondary tie-breaker.
- If action events are missing, fall back to mission-level summary cards.
- If actor name is missing, show "Unknown agent".
- If role is missing, omit it rather than inventing one.
- If a source is unavailable, return available data from the remaining source(s) and mark the response partial/stale.
- If no missions exist, return an empty state payload instead of an error.

## Backend risks / dependencies
- Source-of-truth ambiguity if mission metadata and event logs disagree.
- Freshness risk if the dashboard depends on multiple stores that update at different times.
- Privacy/auth dependency: this is user-only, so the API must be gated before exposure.
- Performance risk if the backend has to merge large event histories on every request; add lightweight pagination or cached aggregation if needed.
- Timezone consistency: all recency logic should use one canonical timestamp format.

## Recommendation
Start with a single aggregator endpoint backed by the mission database and event log, with defensive fallback rendering. Keep it read-only, minimal, and optimized for the dashboard’s default view.
