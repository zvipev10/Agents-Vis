# Mission 004 Coordinator Handoff

## Current mission state
Mission 004 is the live-truth ingestion and storytelling mission.
The mission is now complete: the live source was refreshed again in the repo with a new verification event, production is ingesting the refreshed feed, and the single timeline still shows the latest mission with freshness lag visible.

## What is done
- Mission packet is defined
- Backend, frontend, QA, and coordinator responsibilities are declared
- The release goal is explicit: updated truth plus clearer story, not just a frozen production snapshot
- The writing contract is defined: updates should say what changed, who changed it, why it matters, and what comes next when relevant
- The repo-backed live source snapshot now includes Mission 004 as the latest mission
- Backend and frontend implementation work is reflected in the live source refresh and the follow-up verification event
- Repo checks are green: tests, typecheck, and build pass
- This run revalidated the local repo successfully with `npm test`, `npm run typecheck`, and `npm run build`
- This run rechecked production and confirmed the deployed app serves Mission 004 data from the refreshed canonical live source

## What remains
- No functional blocker remains for Mission 004
- Keep the freshness state visible and keep the live source refreshed as new truth arrives
- Keep the production deployment path and external live-source wiring documented for future runs

## Coordinator instructions
- Keep the user-facing experience to one live timeline only
- Do not add a second summary view
- Preserve explicit freshness / lag indicators
- Keep the checkpoint updated after each meaningful milestone
- Use the checkpoint and handoffs as the source of truth for future resumption
- Treat Mission 004 as complete unless new scope is introduced
- Send a short update after every meaningful step, not only at the end of a run
- Each update should say who worked and what the next step is
- Every product, backend, frontend, and QA step must be documented in a PDF artifact in the repo at `docs/missions/pdfs/`

## Live runtime note
- Dev server may still be used for local verification
- Production verification must happen on the deployed app
- Production is reachable and returns 200, and the live payload now reflects Mission 004 from the refreshed canonical live source
- Local verification now pins the route test to `AGENTS_VIS_DASHBOARD_SOURCE_FILE=src/lib/dashboard-live-source.json` so the checkout matches the shipped source
- Production smoke this run:
  - `GET https://agents-vis.vercel.app/api/missions/latest` → 200, Mission 004 payload, `eventCount: 7`, `freshnessState: stale`, `lagMs: 2164553`
  - `GET https://agents-vis.vercel.app/api/dashboard` → 200, JSON source freshness stale, `lagMs: 2171520`
- The deployed app still serves the single latest-mission timeline through the live source path
- Markdown handoff updated and the matching PDF artifact was regenerated in `docs/missions/pdfs/`
