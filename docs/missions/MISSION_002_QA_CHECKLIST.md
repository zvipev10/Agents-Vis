# Mission 002: Live Mission History Timeline QA Checklist

## QA goal
Validate that the dashboard shows only the last mission, renders a chronological live timeline, preserves the full history of agent actions, makes parallel activity visible, and clearly indicates lag/stale data.

## Acceptance checks
- [ ] Dashboard opens successfully for the intended single user.
- [ ] Dashboard shows only the last mission.
- [ ] The timeline is ordered chronologically from mission start to latest event.
- [ ] Every visible event is attributed to the correct agent.
- [ ] Realtime updates appear without manual refresh.
- [ ] Parallel actions are visually represented as parallel, not flattened into one linear list.
- [ ] The full mission history remains available and scrollable.
- [ ] Stale, delayed, or partial data is explicitly indicated.
- [ ] The UI does not introduce a second primary view for current-state summary.

## Ordering verification
- [ ] Earlier mission events appear before later ones.
- [ ] Events with the same timestamp follow the defined tie-breaker rule consistently.
- [ ] The order remains stable as new live events arrive.

## Parallel activity verification
- [ ] Concurrent actions are shown as concurrent.
- [ ] Parallel groups remain readable and do not collapse into a single ambiguous entry.
- [ ] If grouping metadata is missing, the UI still preserves sequence and does not invent concurrency.

## Realtime verification
- [ ] New events appear on the page without refresh.
- [ ] The live state changes visually when new data arrives.
- [ ] The UI clearly shows when data is delayed or stale.
- [ ] Late-arriving events are handled without breaking the timeline.

## Minimal regression checks
- [ ] Empty state renders cleanly when no mission exists.
- [ ] No unauthorized mutation controls are visible or callable.
- [ ] Long histories remain usable and readable.
- [ ] The interface remains consumer-friendly and not overly technical.

## Exit criteria
- [ ] All acceptance checks pass, or any failures are explicitly documented with a blocker or known-issue note.
- [ ] No live-update, ordering, or stale-data regressions remain open.
