# Mission 004 QA Handoff

## Completed
- Mission 004 is defined as the live-truth ingestion and story-refactor mission
- The app must stay read-only, single-view, and consumer-friendly
- The pipeline and the story presentation must both be verified
- This run revalidated local quality gates and produced live production smoke evidence
- The repo-backed live source snapshot now includes Mission 004 as the latest mission

## QA focus
- Verify the production URL opens successfully
- Verify the latest mission timeline is still the only visible mission view
- Verify the timeline stays chronological from start to latest event
- Verify parallel actions remain visibly parallel
- Verify freshness / lag / stale states are clearly indicated
- Verify the displayed content reflects the updated truth coming from the ingestion path
- Verify the story reads more clearly after the writing-contract change
- Verify the interface remains read-only
- Verify production smoke checks run against the deployed app, not just local
- Document each QA step in a PDF artifact stored in the repo
- This run confirms the deployed app is now on Mission 004, while freshness still reads stale; the QA PDF artifact lives in `docs/missions/pdfs/`

## Exit criteria
- The ingestion path is working in production or the blocker is explicitly documented
- The story-writing contract is visible in the rendered output
- The app still passes smoke verification on the live deployment

## Smoke evidence
- Production URL opens successfully with HTTP 200
- Production API returns the Mission 004 payload, and the title also reflects Mission 004
- Live API smoke from this run:
  - `GET https://agents-vis.vercel.app/api/missions/latest` → 200, Mission 004 payload
  - `GET https://agents-vis.vercel.app/api/dashboard` → 200, stale freshness reported
