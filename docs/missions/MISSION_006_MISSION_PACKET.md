# Mission 006: Mission Story Quality and Filtering

This mission adds real dashboard capabilities for understanding agent work: filter by role and status, search task descriptions, track task IDs, and surface blocked/resumed flow clearly.

## User goal
Improve the visibility dashboard so a user can quickly understand who did what, why, and current blockers by reading the dashboard alone.

## Core product decision
Treat mission events as a user-facing story, not just internal logs. Every event must be structured for comprehension and filtering.

## Scope in
- Role filters on latest mission timeline (architect, product, backend, frontend, qa, coordinator)
- Event status filters (started, updated, blocked, resumed, completed)
- Search across action, detail, and summary
- Add taskId to mission event write contract
- Display taskId in timeline and use it for event grouping
- Blocked/resumed visual treatment in timeline
- Block duration display when a blocked event is followed by resumed for the same taskId
- Backend validation guardrails for event quality (reject empty/generic descriptions)
- Preserve current read-only UX and existing canonical DB architecture
- Update tests for API validation, filtering behavior, and UI rendering
- Production-safe verification on deployed app

## Scope out
- End-user mutation controls
- New admin dashboard screens
- Cross-mission analytics pages
- AI rewriting of event text
- Replacing existing dashboard API envelope shapes

## Team roles and handoff
- Architect owns event contract updates, filter/search contract boundaries, indexing strategy, and blocked/resumed derivation rules
- Product Manager owns UX behavior for filters/search/task grouping and quality copy for states/errors
- Backend Developer owns schema updates, write validation, filter/search query behavior, and backend tests
- Frontend Developer owns filter/search UI, timeline grouping, blocked/resumed rendering, and frontend tests
- QA owns validation matrix, regressions, and end-to-end verification
- Coordinator owns sequencing, blocker handling, integration gates, and completion decision
- Every role writes a durable handoff in MISSION_006_HANDOFFS/
- Every role emits mission events via POST /api/agent-events after meaningful steps

## Architecture contract
- Canonical source of truth remains Neon-backed database
- Agents write mission events only through backend API
- Dashboard reads from backend read APIs over canonical DB
- Filtering/search are read concerns; they do not alter canonical state
- taskId is part of the canonical event contract for Mission 006+
- Freshness and lag semantics remain explicit and unchanged

## Data/API contract additions
### Write contract (POST /api/agent-events)
Add fields and validation:
- taskId (required): non-empty stable task identifier (example: M6-BE-03)
- eventStatus (required): one of started | updated | blocked | resumed | completed
- action (required): minimum 8 chars, meaningful verb phrase
- detail (required): minimum 20 chars, must describe change and purpose
- summary (required): short user-facing line

Validation behavior:
- reject empty/placeholder/generic descriptions (for example: done, updated, fixed, n/a)
- return explicit field-level errors in 400

### Read contract behavior
Keep existing response envelopes, add filter/search inputs where appropriate:
- role filter params
- event status filter params
- search query param for action/detail/summary

Read responses must preserve:
- timeline ordering
- parallel-group semantics
- freshness/lag/updated-at fields

## UX/UI direction
- Keep latest-mission-first read-only shell
- Add lightweight filter controls above timeline
- Add search input with clear empty-match state
- Show role, taskId, status badge, action, detail, and timestamp on each event card
- Highlight blocked/resumed events distinctly
- For resumed events, show computed blocked duration when derivable
- Preserve clarity over density; avoid introducing editable controls

## Acceptance criteria
- User can filter timeline by role and event status
- User can search timeline text and get accurate matches
- Every displayed event includes taskId
- Blocked/resumed events are visually distinct and duration is shown when possible
- Backend rejects low-quality event payloads with clear validation errors
- Existing freshness/lag/updated-at visibility remains intact
- pnpm typecheck, pnpm test, and pnpm build pass
- Code is pushed to GitHub, deployed to production, and production smoke verifies dashboard + latest mission endpoints + UI rendering

## Open questions
- Should search be case-insensitive substring only for v1, or tokenized?
- Should multi-select filters use AND logic or OR logic?
- Which blocked-duration format is preferred (14m, 14 min, 00:14)?
- Should validation reject or warn on repeated near-duplicate details for the same taskId?

## Dependencies / blockers
- Agreement on final taskId pattern and validation strictness
- Agreement on filter/query param shape
- Stable Neon env config for preview/production verification

## Notes
- This is a real feature mission, not a synthetic test mission
- It intentionally strengthens both product value and process observability
- Keep mission documentation in markdown and PDF form once mission artifacts are finalized
