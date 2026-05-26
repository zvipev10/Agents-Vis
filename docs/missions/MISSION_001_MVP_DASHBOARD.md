# Mission 001: Private MVP Dashboard

## Mission brief
Build a private, read-only dashboard for one user that gives a clear visual summary of what the agent team did to complete a mission. The dashboard must default to the latest updated mission, show both running and completed missions, and emphasize who did what using simple cards and minimal text.

## Scope in
- Private, user-only dashboard
- Read-only UI
- Latest mission as default view
- Show running and completed missions
- Card-based layout with minimal text
- Each card shows agent/team member first, then the action
- Latest mission highlighted, with recent missions listed below
- Always load the latest available state on open
- If a source is missing, render what is available

## Scope out
- Editing or mission management tools
- Multi-user access or sharing
- Rich analytics, charts, or filters beyond MVP needs
- Notifications, approvals, or workflow automation
- Full historical reporting or deep search
- Complex permissions beyond user-only access

## Immediate work packages

### Product
- Define the exact MVP card content order and wording rules.
- Confirm the minimal mission states to display: running, completed.
- Define what qualifies as the “latest mission” for default view.
- Specify empty-state behavior when only partial data is available.
- Set acceptance criteria for “comfortable visual understanding” in MVP terms.

### Backend
- Identify all data sources required for mission state, updates, and actor/action attribution.
- Define the read-only API contract for latest mission and recent missions.
- Ensure the API returns the newest available state at request time.
- Add graceful fallback behavior when one source is unavailable.
- Expose only the data needed for the dashboard cards.

### Frontend
- Build the simple card-based dashboard shell.
- Prioritize latest mission highlight and recent missions list.
- Render agent/team member name before the action on every card.
- Support loading, empty, and partial-data states.
- Keep the UI visually calm, minimal, and readable.

### QA
- Verify default landing shows the most recently updated mission.
- Confirm running and completed missions both appear.
- Validate partial-source failures still show available data.
- Check that card order consistently shows actor first, action second.
- Test read-only behavior and ensure no edit affordances exist.

## Assumptions
- The system already has access to mission/update data somewhere in the stack.
- Mission records include enough metadata to determine recency and status.
- User authentication exists or will be added separately from this dashboard scope.
- The MVP can launch with a small set of fields and minimal styling.
- No long-lived staging environment is required for this first pass.

## Open questions
- Which source is authoritative when mission data conflicts across systems?
- What exact fields are guaranteed for each mission update?
- Is mission “latest” determined by updated_at only, or by a separate event timestamp?
- What authentication mechanism will gate this dashboard for the single user?

## Success criteria
- The dashboard opens to the latest updated mission by default.
- Running and completed missions are both visible.
- The latest mission is clearly highlighted.
- The UI stays minimal and read-only.
- Missing sources do not block rendering of available data.
