# Mission 004 Checkpoint

Generated: 2026-05-27T12:23:00Z

## Mission
Mission 004: Live Truth Ingestion and Storytelling

## Current state
Mission 004 is in progress. The repo now carries a Mission 004 live-source snapshot and the local gates are green, but the deployed production app is still serving the Mission 003 snapshot until the updated source is deployed.

## Latest known mission scope
- Keep the single latest-mission timeline experience
- Make the backend production-safe and source-driven
- Keep the displayed truth current through a real ingestion path
- Preserve chronology, parallel metadata, and freshness states
- Keep the app read-only and consumer-friendly
- Improve the story quality of what agents write

## What is done
- Mission 004 scope has been defined
- Product, backend, frontend, QA, and coordinator responsibilities are now written down
- The Mission 004 writing contract is defined: updates should communicate what changed, who changed it, why it matters, and what comes next when relevant
- The repo-backed live source snapshot was updated to include Mission 004 as the latest mission
- Backend and frontend implementation work has started
- Tests, typecheck, and build currently pass in the repo
- Local verification from this run is green: `npm test`, `npm run typecheck`, and `npm run build` all passed
- Live production smoke from this run still confirms `https://agents-vis.vercel.app/api/missions/latest` returns Mission 003 data and `https://agents-vis.vercel.app/api/dashboard` still reports stale freshness

## What remains
- Redeploy production so the updated repo-backed live source becomes visible on the live URL
- Or provision a canonical external JSON source and point production at it with `AGENTS_VIS_DASHBOARD_SOURCE_URL`
- Confirm the safest ingestion method for the real source
- Keep the frontend story presentation aligned with the latest source
- Update the checkpoint after each meaningful milestone
- The blocker is now live deployment / external source wiring, not missing repo data

## Resume instruction
Start by reading this checkpoint, the mission packet, and the role handoffs. Then assign the first concrete worker task needed to make the app show updated truth with a clearer story.

## Latest run summary
- Coordinator verified the repo, local tests, and production smoke
- The repo-backed live source now includes Mission 004 as the latest mission
- Backend/frontend code is already wired for an external source via `AGENTS_VIS_DASHBOARD_SOURCE_URL`
- QA evidence still shows the deployed app on Mission 003, so the next step is redeploying the updated source or wiring an external live source

## Notes for the next run
- Do not add a second dashboard view
- Do not hide lag or stale states
- Preserve parallel sequencing
- Keep status tied to live evidence and production checks
- Production smoke currently reaches the deployed app, but the live payload is still Mission 003 and stale
- Send short updates after every meaningful step
