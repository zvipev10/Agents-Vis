# Mission 004 Coordinator Handoff

## Current mission state
Mission 004 is the next mission after the Mission 003 production closeout.
Mission 004 is about two linked things:
1. the source of truth must stay live through a real ingestion path
2. the data the agents write must be reshaped so the timeline tells a clearer story

## What is done
- Mission packet is defined
- Backend, frontend, QA, and coordinator responsibilities are declared
- The release goal is now explicit: updated truth plus clearer story, not just a frozen production snapshot
- The writing contract is now defined: updates should say what changed, who changed it, why it matters, and what comes next when relevant
- The repo-backed live source snapshot now includes Mission 004 as the latest mission
- Backend and frontend implementation work has started
- Repo checks are currently green: tests, typecheck, and build pass
- This run revalidated the local repo successfully with `npm test`, `npm run typecheck`, and `npm run build`
- This run rechecked production and confirmed the deployed app is now serving Mission 004 data from the canonical live source snapshot

## What remains
- Keep the stale freshness visible and decide whether the source should be refreshed again
- The remaining blocker is production wiring: set `AGENTS_VIS_DASHBOARD_SOURCE_URL` in production to the verified live JSON feed at `https://raw.githubusercontent.com/zvipev10/Agents-Vis/main/src/lib/dashboard-live-source.json`
- Current production smoke still shows `freshnessState: stale` and `lagMs: 8844786`
- Keep the production deployment path and any external live-source wiring documented for the next run

## Coordinator instructions
- Keep the user-facing experience to one live timeline only
- Do not add a second summary view
- Preserve explicit stale/lag indicators
- Keep the checkpoint updated after each meaningful milestone
- Use the checkpoint and handoffs as the source of truth for future resumption
- Treat Mission 004 as incomplete until the updated truth pipeline and production smoke verification are done
- Send a short update after every meaningful step, not only at the end of a run
- Each update should say who worked and what the next step is
- Every product, backend, frontend, and QA step must be documented in a PDF artifact in the repo at `docs/missions/pdfs/`

## Live runtime note
- Dev server may still be used for local verification
- Production verification must happen on the deployed app
- Production is reachable and returns 200, and the live payload now reflects Mission 004 from the canonical live source snapshot with stale freshness data
- Local runtime smoke verified that the app can poll the real HTTPS JSON feed from `raw.githubusercontent.com` and still render Mission 004
- Production smoke this run:
  - `GET https://agents-vis.vercel.app/api/missions/latest` → 200, Mission 004 payload, `freshnessState: stale`
  - `GET https://agents-vis.vercel.app/api/dashboard` → 200, Mission 004 payload, stale freshness reported
- Browser title: `Mission 004`
