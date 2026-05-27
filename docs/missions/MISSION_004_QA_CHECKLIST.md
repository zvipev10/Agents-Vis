# Mission 004 Production QA Checklist

## QA goal
Verify that the app shows updated truth through the ingestion path and that the story the agents write is clearer in production.

## Production acceptance checks
- [ ] The production URL opens successfully
- [ ] The app shows only the latest mission timeline
- [ ] The timeline is chronological from start to latest event
- [ ] Every visible event is attributed correctly
- [ ] Parallel actions remain visibly parallel
- [ ] Full history is still available and scrollable
- [ ] Stale / lag / partial data is clearly indicated
- [ ] The interface remains read-only
- [ ] No secondary summary dashboard appears
- [ ] The content reflects the updated truth from the ingestion path
- [ ] The story is clearer because the agent writing contract was updated

## Production smoke checks
- [ ] The production page loads without manual intervention
- [ ] The production API returns the expected latest-mission payload
- [ ] Freshness / lag values match the source state
- [ ] The deployed UI matches the expected layout and messaging

## Release checks
- [ ] Tests passed before deploy
- [ ] Production deploy completed successfully
- [ ] Smoke checks were run against production, not just local
- [ ] Any remaining issue is documented as a blocker or known issue

## Exit criteria
- [ ] The app is production-ready or the blocker preventing release is explicitly documented
