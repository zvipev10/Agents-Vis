# Mission 003: Production Application Delivery Mission Packet

This mission turns Mission 002 into a real production application release instead of stopping at the repo-backed milestone.

## User goal
Ship the Agents-Vis app as a production-ready application with a live, read-only mission timeline that is deployed, verified, and ready for users.

## Core product decision
Keep the single live timeline experience. Do not add a second dashboard view. Make the existing experience production-ready and verifiable end-to-end.

## Scope in
- One primary chronological timeline for the latest mission only
- Production deployment of the app
- Production-safe live data source or live mission feed
- Stable read-only API contract
- Explicit freshness / stale / lag indicators
- Full-history replay remains visible and scrollable
- Parallel activity remains visibly parallel
- Production smoke verification on the deployed URL
- Clear rollback / release-readiness notes

## Scope out
- Multi-mission browser
- Admin tools
- Mutation controls
- Analytics dashboards
- Feature expansion beyond production readiness
- Rewriting the timeline UX into a second summary view

## Team handoff
- Backend owns production data access, API stability, caching, and source wiring
- Frontend owns production UI polish, responsiveness, and live-state rendering
- QA owns production smoke tests, ordering checks, and release verification
- Coordinator owns sequencing, blockers, release gates, and status updates

## Acceptance criteria
- The app is deployed to production and reachable at the expected production URL
- The production app shows only the latest mission timeline
- The timeline stays chronological and preserves parallel activity
- Freshness / lag / stale states are visible in production
- The API contract remains read-only and stable
- Production smoke checks pass on the live deployment
- The team can explain the next release step or confirm the release is complete

## Open questions
- Is the production live source a real external event store, a production database, or another canonical feed?
- What is the exact release gate for marking the app production-ready?
- What smoke checks should be mandatory before release is considered done?
