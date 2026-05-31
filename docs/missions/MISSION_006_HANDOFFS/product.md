# Mission 006 Product Handoff

## Final UX/spec decisions reflected in the implementation
- Role filter is single-select with canonical exact values.
- Status filter is single-select with exact values for `started | updated | blocked | resumed | completed`.
- Filters combine with AND logic, and search is case-insensitive substring matching over action/detail/summary only.
- Timeline cards show `Task: {taskId}` and never surface literal `unknown`.
- Legacy rows use a deterministic fallback of `missionId-step-NN` when taskId is missing.
- Blocked/resumed states are visually distinct, and resumed rows show a compact elapsed duration when derivable.

## Validation/copy guidance
- Validation errors should stay explicit and field-level.
- The UI should remain read-only and not introduce any edit affordances.
- Clear empty-match feedback is preferred when filters/search hide all rows.

## Verification
- Frontend tests passed locally.
- App build/typecheck passed after the backend contract fix.

## Remaining UX risk
- Historical rows without a matching blocked predecessor will not show a duration, which is acceptable for v1 but should remain visible as a product caveat if questioned.
