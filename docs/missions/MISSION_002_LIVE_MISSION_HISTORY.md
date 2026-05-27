# Mission 002: Live Mission History Timeline

## Mission summary
Build a consumer-facing live mission history view for the last mission only. The page should present the mission as one chronological timeline that updates in realtime and shows the full sequence of actions taken by every agent.

The user must be able to understand what each agent did, when it happened, how the mission progressed over time, and whether actions were sequential or parallel. If data is delayed or stale, the UI must show that clearly.

## Goal
Create a single live timeline experience that reads like a realtime replay of the latest mission.

## Product intent
The user should be able to answer these questions immediately:
- What happened first?
- What did each agent do?
- What is happening now?
- Which actions happened in parallel?
- Is the data current or lagging?

## Scope in
- Last mission only
- One primary chronological timeline
- Realtime updates as events arrive
- Full mission history visible and scrollable
- Every agent action shown
- Parallel activity represented visibly as parallel
- Explicit lag / stale-data indicators
- Consumer-facing, read-only experience

## Scope out
- Multi-mission browsing
- Separate current-state dashboard
- Editing mission history
- Admin tooling
- Analytics dashboards
- Summary-only UI that hides the real execution sequence

## Success criteria
- The page opens to the last mission automatically
- The timeline is chronological from start to now
- New events appear live without manual refresh
- Every action is attributed to the correct agent
- Parallel actions are visibly distinguishable from sequential ones
- Full mission history remains accessible
- Lag/stale data is explicitly indicated

## Assumptions
- The source system can provide timestamped events
- The data stream includes enough metadata to reconstruct ordering and parallelism, or the backend will define a fallback rule
- The user wants a live replay of the mission rather than a separate summary view

## Coordinator responsibilities
The coordinator worker owns the mission from start to finish and must proactively handle missing pieces.

The coordinator worker will:
- turn the request into a mission brief
- define scope and delivery gates
- identify missing pieces and hidden dependencies
- make explicit decisions when requirements are incomplete
- choose the integration-test strategy
- resolve cross-role conflicts
- ensure the mission reaches production if it satisfies the success criteria

## Product Manager work package
- Define the single-view timeline experience
- Decide wording, hierarchy, and event presentation
- Specify how sequential vs parallel activity should look
- Define live, delayed, stale, and completed states
- Confirm acceptance criteria for the replay experience

## Backend Developer work package
- Define the event contract for mission history
- Expose the last mission and its ordered event stream
- Preserve timestamp, agent, action, and concurrency metadata
- Provide freshness / lag status for the UI
- Add backend tests for ordering, parallel grouping, and partial data

## Frontend Developer work package
- Build the single live timeline view
- Auto-load the last mission
- Render events chronologically
- Make concurrent activity visibly parallel
- Show live/stale/lag states clearly
- Add frontend tests for ordering, update flow, and state handling

## QA work package
- Verify only the last mission is shown
- Confirm chronological ordering is correct
- Verify realtime updates appear without refresh
- Confirm every event is attributed correctly
- Verify parallel activity is rendered as parallel
- Check that stale / delayed data is visible and understandable

## Delivery expectations
The team should proceed autonomously through these stages:
1. Mission brief and gap analysis
2. Product definition
3. Backend and frontend implementation
4. QA validation
5. Runtime verification
6. Production readiness decision

## Notes for future missions
This mission establishes the team’s working pattern for live historical replay features:
- mission brief
- gap analysis
- role work packages
- implementation
- QA
- verification
- production decision
