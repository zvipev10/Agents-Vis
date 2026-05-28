# Mission 004 Frontend Handoff

## Completed
- Mission 004 is defined as the live-truth and story-refactor mission
- The UI remains read-only and single-view
- The app keeps only the latest mission timeline visible
- The frontend renders the clearer story contract and preserves chronology, parallel lanes, and freshness cues
- The repo-backed live source snapshot now includes Mission 004 as the latest mission
- The live source was refreshed again with a new verification event so the timeline story stays current

## Current frontend behavior target
- Keep the one-timeline layout
- Keep chronology and parallel lanes visible
- Keep freshness / lag / stale indicators visible
- Improve the wording and structure of timeline entries so the story reads clearly
- Keep the UI consumer-friendly and avoid turning it into a second summary dashboard
- Continue rendering the remote-source payload without changing the visible single-timeline experience
- Document each frontend step in a PDF artifact stored in the repo
- This run revalidated the frontend locally as part of the passing test suite, typecheck, and build; the mission PDFs were regenerated in `docs/missions/pdfs/`

## Story refactor target
- The frontend should render the story the agents produce, not invent a new summary layer
- The writing contract should make each update understandable in context
- The UI should highlight who did what, why it mattered, and what changed next
- The frontend should keep the timeline readable as the live source changes
- The browser title follows the latest mission, so the visible page now says Mission 004
- Local verification now uses the repo-backed live source file override in the route test, so the frontend view tracks the shipped source
- Production smoke confirms the timeline renders Mission 004 with delayed freshness, and the live API now reports stale freshness with visible lag

## Next frontend step
Keep the one-timeline layout readable and preserve the freshness state so lag remains visible in the UI.
- Markdown handoff updated and the matching PDF artifact was regenerated in `docs/missions/pdfs/`
