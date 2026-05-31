# Mission 006 Backend Handoff

## What changed
- Updated the agent-event write path and dashboard store to align with Mission 006.
- `taskId` is required in the write contract.
- `eventStatus` is constrained to `started | updated | blocked | resumed | completed`.
- Validation rejects low-quality action/detail/summary content with explicit field errors.
- Read filters now support role, eventStatus, and search without leaking the search query into taskId matching.
- The store now enforces a `resumed`-after-`blocked` guard for the same mission/task.
- Schema support/indexing for the new fields was added in the Mission 006 migration.

## Tests
- Backend-focused tests passed as part of the repo-wide vitest run.
- `pnpm typecheck` and `pnpm build` pass.

## Remaining risk
- Production still serves Mission 005, so the updated API contract has not yet been verified against the live deployment.
