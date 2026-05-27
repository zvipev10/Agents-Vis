# Mission 004 Frontend Handoff

## Completed
- Mission 004 is defined as the live-truth and story-refactor mission
- The UI remains read-only and single-view
- The app should keep only the latest mission timeline visible
- The frontend implementation already renders the clearer story contract and preserves chronology, parallel lanes, and freshness cues
- The repo-backed live source snapshot now includes Mission 004 as the latest mission

## Current frontend behavior target
- Keep the one-timeline layout
- Keep chronology and parallel lanes visible
- Keep freshness / lag / stale indicators visible
- Improve the wording and structure of timeline entries so the story reads clearly
- Keep the UI consumer-friendly and avoid turning it into a second summary dashboard
- Document each frontend step in a PDF artifact stored in the repo
- This run revalidated the frontend locally as part of the passing test suite, typecheck, and build; the mission PDFs remain in `docs/missions/pdfs/`

## Story refactor target
- The frontend should render the story the agents produce, not invent a new summary layer
- The writing contract should make each update understandable in context
- The UI should highlight who did what, why it mattered, and what changed next
- The frontend should keep the timeline readable as the live source changes
- Production still needs the updated source or redeploy before the improved story can be validated live

## Next frontend step
Define the story-writing contract with the coordinator, then update the presentation so the clearer agent-written records are displayed without losing chronology, freshness, or parallel structure.
