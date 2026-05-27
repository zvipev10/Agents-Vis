# Mission 002: Mission Packet

This file captures the initial team packet for the live mission history timeline feature.

## User goal
I want to watch the last mission as a live, chronological replay of the agents’ work.

## Core product decision
Use a single timeline view only. Do not split the experience into separate current-state and history views.

## Scope in
- Last mission only
- One primary chronological timeline
- Live updates as events arrive
- Full mission history visible and scrollable
- Every agent action shown
- Parallel activity represented visibly as parallel
- Explicit lag / stale-data indicators

## Scope out
- Multi-mission browser
- Separate summary dashboard
- Editing mission history
- Admin tools
- Analytics dashboards
- Summary-only UI

## Open questions
- Exact event schema for parallel/concurrency metadata
- Freshness threshold for stale state
- How to display late-arriving events after completion, if any

## Team handoff
- Backend owns the event contract and live feed
- Frontend owns the timeline rendering and live updates
- QA owns ordering, parallel rendering, freshness, and realtime validation
- Coordinator owns scope, sequencing, and gap resolution
- Coordinator also sends short status updates after every meaningful step, not just at the end of a run.
