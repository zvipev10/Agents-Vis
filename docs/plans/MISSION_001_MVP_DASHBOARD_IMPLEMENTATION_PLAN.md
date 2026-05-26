# Mission 001: MVP Dashboard Implementation Plan

> For Hermes: use subagent-driven-development task-by-task when you begin implementation.

Goal: Build a private, read-only dashboard that opens to the latest updated mission by default and shows both running and completed missions with clear actor-first cards and minimal text.

Architecture: Use a single Next.js app as the frontend and thin BFF layer for the dashboard. Keep the data model read-only, optimize for one dashboard payload that returns the latest mission plus recent missions, and design graceful fallback behavior so partial data still renders. Use Vercel for deployment and Neon for the database, with preview deployments connected to preview DB branches.

Tech Stack: Next.js, TypeScript, React, Vercel, Neon, server-side API routes or route handlers, and a lightweight test stack for unit/integration coverage plus browser-based QA for the final UI.

---

### Task 1: Lock the app scaffold and contract

Objective: Turn the docs-only repo into a concrete web app scaffold with agreed environment variables, folder layout, and a single dashboard data contract.

Files:
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/api/dashboard/route.ts`
- Update: `.env.example`
- Update: `README.md`

Step 1: Define the runtime assumptions in the repo docs.
- Document that the app is private, read-only, and mission-dashboard focused.
- Document the minimum env vars required for local dev and preview deploys.

Step 2: Create the app scaffold with a single dashboard route and a single read API route.
- Keep the initial app shell minimal.
- Ensure the codebase can run locally without any mutation endpoints.

Step 3: Verify the scaffold boots.
- Run: `pnpm install`
- Run: `pnpm dev`
- Expected: app starts, root page loads, API route responds with a stub payload.

Step 4: Commit the scaffold.
- Run: `git add .`
- Run: `git commit -m "chore: scaffold mission dashboard app"`

---

### Task 2: Add dashboard data types and fixture source

Objective: Define the exact dashboard payload shape and a small fixture-backed data source so the UI can be built without waiting on the full backend.

Files:
- Create: `src/lib/dashboard-types.ts`
- Create: `src/lib/dashboard-fixtures.ts`
- Create: `src/lib/dashboard-data.ts`
- Modify: `src/app/api/dashboard/route.ts`
- Create: `tests/dashboard-data.test.ts` or `src/lib/__tests__/dashboard-data.test.ts`

Step 1: Write the payload types first.
- Define `DashboardResponse`, `MissionSummary`, `MissionCard`, and `SourceStatus`.
- Include fields for latest mission, recent missions, actor name, actor role, action text, timestamps, and freshness indicators.

Step 2: Create a tiny fixture set.
- Include at least one running mission and one completed mission.
- Include one mission with partial data to test fallbacks.

Step 3: Add a test for sorting and default selection.
- Verify the most recently updated mission becomes the default highlight.
- Verify running and completed missions can both appear in the payload.

Step 4: Verify the route returns the typed payload.
- Run the targeted test file.
- Expected: tests pass and the route can serialize the fixture-backed dashboard response.

Step 5: Commit the data contract.
- Run: `git add src/lib src/app/api/dashboard/route.ts tests`
- Run: `git commit -m "feat: define dashboard data contract"`

---

### Task 3: Implement the read-only dashboard API

Objective: Replace the fixture-only route with a thin aggregator that returns the latest mission and recent missions in one read-only response.

Files:
- Modify: `src/app/api/dashboard/route.ts`
- Create: `src/lib/dashboard-service.ts`
- Create: `src/lib/__tests__/dashboard-service.test.ts`

Step 1: Write tests for the service behavior.
- Test latest-mission selection.
- Test fallback behavior when actor name, role, or event details are missing.
- Test empty-state response when no missions exist.

Step 2: Implement the minimal aggregator.
- Compose a single dashboard response.
- Keep the endpoint read-only and free of any mutation side effects.
- Return partial/stale markers when source data is incomplete.

Step 3: Verify the endpoint against the tests.
- Run the service test file.
- Run the dashboard route test if present.
- Expected: pass with latest mission selected correctly.

Step 4: Commit the backend layer.
- Run: `git add src/lib src/app/api/dashboard/route.ts`
- Run: `git commit -m "feat: add read-only dashboard api"`

---

### Task 4: Build the minimal card-based dashboard UI

Objective: Render a calm, read-only dashboard that highlights the latest mission first and lists recent missions below it.

Files:
- Modify: `src/app/page.tsx`
- Create: `src/components/dashboard/DashboardShell.tsx`
- Create: `src/components/dashboard/MissionHighlightCard.tsx`
- Create: `src/components/dashboard/MissionList.tsx`
- Create: `src/components/dashboard/MissionCard.tsx`
- Create: `src/lib/dashboard-client.ts`
- Create: `src/components/dashboard/__tests__/MissionCard.test.tsx`

Step 1: Write component tests for the actor-first card order.
- Verify the actor/team member name appears before the action text.
- Verify minimal text treatment and no edit affordances.

Step 2: Build the dashboard shell.
- Load the dashboard payload.
- Render the highlighted latest mission first.
- Render recent missions below it with simple cards.

Step 3: Keep the UI intentionally sparse.
- Use small, readable labels.
- Avoid charts, filters, and nonessential controls.
- Make the latest mission visually distinct without adding clutter.

Step 4: Verify the page in the browser.
- Run the app locally.
- Open the root page.
- Expected: latest mission loads by default and the UI is clearly read-only.

Step 5: Commit the UI.
- Run: `git add src/app src/components src/lib`
- Run: `git commit -m "feat: build mission dashboard ui"`

---

### Task 5: Add loading, empty, and partial-data states

Objective: Make the dashboard resilient when the API is slow, empty, or missing fields from one source.

Files:
- Modify: `src/components/dashboard/DashboardShell.tsx`
- Modify: `src/components/dashboard/MissionCard.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/components/dashboard/__tests__/dashboard-states.test.tsx`

Step 1: Add loading state UI.
- Show a minimal skeleton or placeholder card while the dashboard loads.

Step 2: Add empty-state UI.
- Show a calm empty state when there are no missions.
- Keep it short and non-blocking.

Step 3: Add partial-data fallbacks.
- If actor name is missing, show `Unknown agent`.
- If role is missing, omit the role.
- If action detail is missing, fall back to a mission-level summary card.

Step 4: Verify all states.
- Run the state tests.
- Open the app with fixture cases for empty and partial data.
- Expected: no broken or blank cards appear.

Step 5: Commit the resilience work.
- Run: `git add src/app src/components src/lib`
- Run: `git commit -m "feat: handle dashboard loading and fallback states"`

---

### Task 6: Wire the database and deployment path

Objective: Connect the dashboard data layer to Neon and make the deployment path work cleanly on Vercel previews and production.

Files:
- Create: `prisma/schema.prisma` or the chosen data-layer config
- Create: `src/lib/db.ts`
- Modify: `.env.example`
- Update: `README.md`
- Create: `docs/deployment.md`

Step 1: Pick the persistent data shape.
- Map mission records, mission events, and actor metadata to the database.
- Keep the schema minimal and read optimized.

Step 2: Add local and preview environment guidance.
- Document how preview DB branches are used.
- Document the variables required for local dev.

Step 3: Verify the deployment assumptions.
- Run the migration or schema generation command.
- Confirm the dashboard can read from the configured database.

Step 4: Commit deployment readiness.
- Run: `git add prisma src docs README.md .env.example`
- Run: `git commit -m "feat: connect dashboard to database"`

---

### Task 7: QA the MVP against the mission brief

Objective: Prove the dashboard meets the private, read-only, latest-mission, actor-first requirements before production promotion.

Files:
- Create or update: `docs/missions/MISSION_001_QA_CHECKLIST.md`
- Create: `tests/e2e/dashboard.spec.ts` or equivalent browser test

Step 1: Automate the acceptance checks that matter most.
- Default landing shows the latest updated mission.
- Running and completed missions both appear.
- The latest mission is clearly highlighted.
- Read-only behavior is visible and enforced.

Step 2: Run browser-based validation in preview.
- Confirm the UI is minimal and readable.
- Confirm partial-source data still renders.

Step 3: Record any known gaps before release.
- Document blockers separately from nice-to-have items.

Step 4: Tag the release candidate.
- Run: `git add tests docs`
- Run: `git commit -m "test: validate mission dashboard mvp"`

---

### Exit criteria

- The dashboard opens to the latest updated mission by default.
- Running and completed missions are both visible.
- Every card shows actor first, action second.
- The UI remains private, read-only, and minimal.
- Missing data does not block rendering.
- The app is deployed and validated in a Vercel preview before production promotion.
