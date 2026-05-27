# Mission 002 Coordinator Handoff

## Current mission state
Mission 002 is implemented in the main repo and currently verified against the live dev server on port 3004.
The coordinator loop is now wired as a recurring Hermes cron job so the mission can keep progressing without chat-driven babysitting.
The dashboard and `/api/missions/latest` now default to the repository-backed live source at `docs/missions/MISSION_002_LIVE_SOURCE.json`, and the runtime no longer calls it a fixture feed.
This run rechecked live evidence: the dev server remains attached on port 3004, `/api/missions/latest` still returns 200, and the latest payload currently surfaces `mission-003` with stale/lag indicators intact.

## What is done
- Mission packet, backend approach, and QA checklist are written
- Timeline API exists at `/api/missions/latest`
- Timeline UI is in the app
- Source loading now supports an env-driven override file
- The default path is repository-backed and no longer fixture-backed
- Tests, typecheck, browser smoke, and API smoke all pass

## What remains
- Future work can replace the repository-backed source with a real mission event store or live feed if needed
- Keep the response contract stable while the source changes
- Re-verify ordering, concurrency, and freshness with the new source if that future swap happens

## Coordinator instructions
- Keep the user-facing experience to one live timeline only
- Do not add a second summary view
- Preserve explicit stale/lag indicators
- Keep the checkpoint updated after each meaningful milestone
- Use the checkpoint and handoffs as the source of truth for future resumption
- The coordinator loop may treat the mission as operational and complete for the repository-backed live-source milestone
- After any recovery from connection issues, do not end the turn with only a repair step; the next successful turn must either launch real bounded work or clearly record that no work remains.
- Recovery-only turns are not progress. The coordinator should leave each successful run with a concrete next action, not just a fixed pipe.
- User-facing update messages should be short, simple, and grounded in live evidence.
- Send an update after every meaningful step, not only at the end of a run.
- Each update should say who worked and what the next step is.

## Live runtime note
- Dev server: `http://127.0.0.1:3004`
- API smoke target: `http://127.0.0.1:3004/api/missions/latest`
- Current smoke status: both endpoints returned 200 after a fresh dev-server restart, and the latest payload now points at `mission-003` while preserving the single-timeline contract
