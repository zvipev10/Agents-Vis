# Mission 001: MVP Validation Checklist

## QA goal
Validate the MVP dashboard is private, read-only, defaults to the latest mission, shows running and completed missions, and still renders useful data when one source is missing.

## Acceptance checks
- [ ] Dashboard opens successfully for the intended single user.
- [ ] Dashboard is read-only: no create, edit, delete, reorder, approve, or manage actions are visible or callable from the UI.
- [ ] The latest updated mission is shown by default on open.
- [ ] The latest mission is clearly highlighted relative to the recent mission list.
- [ ] Recent missions are visible under the highlighted mission.
- [ ] Both running and completed missions appear in the surfaced mission set.
- [ ] Each card shows the agent/team member first, then the action.
- [ ] UI text stays minimal and card-based; no charts, filters, or deep analytics are introduced.
- [ ] The dashboard loads the newest available state on each open/refresh.

## Read-only verification
- [ ] No edit affordances exist in buttons, menus, shortcuts, or context actions.
- [ ] URL/query changes cannot switch the UI into an edit mode.
- [ ] Any attempted write path returns blocked/unsupported or is absent entirely.
- [ ] Navigation remains view-only across highlighted mission and recent mission cards.

## Latest-mission behavior
- [ ] Default mission matches the most recently updated mission in the source data.
- [ ] If multiple timestamps exist, the selected mission follows the defined recency rule consistently.
- [ ] Refreshing after a newer update causes the highlighted mission to change to the new latest mission.
- [ ] The mission list order remains stable and recent-first as data changes.

## Running/completed mission display
- [ ] Running missions are visible when present.
- [ ] Completed missions are visible when present.
- [ ] Status is understandable from the card/list treatment without extra verbose labels.
- [ ] A mix of running and completed missions still preserves the latest mission highlight.

## Partial-source handling
- [ ] If one data source is unavailable, the dashboard still renders available data from the remaining source(s).
- [ ] Missing actor name falls back to a safe placeholder such as “Unknown agent”.
- [ ] Missing role is omitted rather than invented.
- [ ] Missing action-event detail falls back to mission-level summary cards.
- [ ] Partial/stale source state is indicated without blocking the page.
- [ ] No blank or broken cards appear when some fields are missing.

## Minimal regression checks
- [ ] Empty state renders cleanly when no missions exist.
- [ ] No unauthorized mission mutation occurs during load or refresh.
- [ ] No duplicate latest mission card appears in both highlight and recent list.
- [ ] Minimal text styling remains readable on the default viewport.
- [ ] Core card ordering remains actor first, action second across all visible missions.

## Exit criteria
- [ ] All acceptance checks pass, or any failures are explicitly documented with a blocker/known-issue note.
- [ ] No read-only or latest-mission regressions remain open.
