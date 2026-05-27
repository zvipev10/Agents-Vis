# Mission 002: Backend Approach

## Goal
Provide a thin read-only backend that serves the last mission as an ordered event stream with enough metadata for a realtime timeline UI.

## Minimum architecture
- One read-only API layer acting as a BFF for the timeline UI
- No write endpoints, no mission mutation, no admin tools
- Prefer direct reads from the mission event store, with a small aggregation layer only if needed for ordering or freshness metadata

## Likely data sources
1. Mission record
   - mission id
   - title / label
   - status: running | completed
   - updated_at / last_activity_at
2. Mission event log
   - ordered actions taken during the mission
   - actor attribution
   - timestamps
   - action text or structured payload
   - parallel/concurrency metadata if available
3. Agent/team metadata
   - agent id
   - display name
   - role or team label
4. Optional runtime/source health metadata
   - whether the source is current, partial, delayed, or stale

## Read-only API shape
Minimum viable surface:
- GET /api/missions/latest
  - Returns the last mission with its ordered event stream
- GET /api/missions/:id
  - Returns a single mission with its full history
- GET /api/missions/:id/events
  - Returns the mission events in chronological order, with concurrency metadata

If we want the smallest implementation, GET /api/missions/latest can be the primary entry point and can internally compose the full response.

## Response fields needed for the UI
Mission:
- id
- title
- status
- startedAt
- updatedAt
- sourceStatus
- freshnessState

Event:
- id
- missionId
- actorName
- actorRole
- action
- actionAt
- sequenceIndex
- parallelGroupId or concurrency marker
- sourceLabel
- freshness flag if partial/delayed

## Default and fallback behavior
- Default selection: most recent mission only
- Sort events chronologically by canonical timestamp
- If parallel grouping is missing, preserve ordering and expose the absence of grouping rather than inventing it
- If actor name is missing, show "Unknown agent"
- If role is missing, omit it rather than inventing one
- If a source is delayed or partial, return available data and mark the response accordingly
- If no mission exists, return an empty state payload instead of an error

## Backend risks / dependencies
- Ordering ambiguity if multiple events share a timestamp
- Concurrency ambiguity if the source data does not explicitly label parallel work
- Freshness risk if the system depends on multiple stores that update at different times
- Privacy/auth dependency: this is consumer-facing, so access control must be in place before exposure
- Performance risk if the backend has to reconstruct large histories on every request

## Recommendation
Start with a single aggregator endpoint backed by the mission database and event log, with defensive fallback rendering. Keep it read-only, minimal, and optimized for the last-mission timeline.
