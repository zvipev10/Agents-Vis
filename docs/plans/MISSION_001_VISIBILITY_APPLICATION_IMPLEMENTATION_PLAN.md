# Mission 001: Visibility Application Implementation Plan

> For Hermes: use subagent-driven-development task-by-task when you begin implementation.

Goal: Build a private, read-only visibility application for the autonomous agents team that defaults to the latest mission and shows running and completed missions with actor-first cards.

Architecture: Use a single Next.js app with a thin read-only dashboard API, a small data-contract layer, and a minimal UI focused on latest-mission visibility. Keep the system private, graceful under partial data, and production-oriented from the start so preview validation leads cleanly into production promotion.

Tech Stack: Next.js, TypeScript, React, Vercel, Neon, server-side API routes or route handlers, and a lightweight test stack for unit/integration coverage plus browser-based QA.

---

### Task 1: Scaffold the application and runtime contract

Objective: Create the app shell, environment template, and read-only API entrypoint so the mission has a concrete execution target.

Files:
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/api/dashboard/route.ts`
- Update: `.env.example`
- Update: `README.md`

Step 1: Write the minimal application scaffold.
- Create a simple root page and a stub dashboard API route.
- Keep the app read-only from day one.

Step 2: Document the environment expectations.
- Include the minimum variables for local development and preview deployments.
- Make the private/read-only scope explicit.

Step 3: Verify the scaffold boots.
- Run: `pnpm install`
- Run: `pnpm dev`
- Expected: app loads and the API returns a stub dashboard response.

Step 4: Commit the scaffold.
- Run: `git add .`
- Run: `git commit -m "chore: scaffold visibility application"`

---

### Task 2: Define the dashboard payload and fixtures

Objective: Establish a typed payload and fixture data so the UI and backend contract can be built in parallel.

Files:
- Create: `src/lib/dashboard-types.ts`
- Create: `src/lib/dashboard-fixtures.ts`
- Create: `src/lib/dashboard-data.ts`
- Modify: `src/app/api/dashboard/route.ts`
- Create: `src/lib/__tests__/dashboard-data.test.ts`

Step 1: Define the payload types.
- Include `DashboardResponse`, `MissionSummary`, `MissionCard`, and source freshness fields.

Step 2: Add fixture missions.
- Include at least one running mission and one completed mission.
- Include one partial record to validate fallbacks.

Step 3: Test recency and status selection.
- Verify the latest mission becomes the default highlight.
- Verify running and completed missions both appear.

Step 4: Verify route serialization.
- Run the targeted test file.
- Expected: the route can return the typed dashboard payload.

Step 5: Commit the contract.
- Run: `git add src/lib src/app/api/dashboard/route.ts`
- Run: `git commit -m "feat: define visibility dashboard contract"`

---

### Task 3: Implement the read-only dashboard API

Objective: Return the latest mission and recent missions in one read-only response with graceful fallback behavior.

Files:
- Modify: `src/app/api/dashboard/route.ts`
- Create: `src/lib/dashboard-service.ts`
- Create: `src/lib/__tests__/dashboard-service.test.ts`

Step 1: Write service tests first.
- Test latest-mission selection.
- Test missing actor/role/action fallbacks.
- Test empty-state behavior.

Step 2: Implement the minimal aggregator.
- Compose the dashboard response from the mission source.
- Return partial/stale markers when necessary.
- Do not add write functionality.

Step 3: Verify the service and route.
- Run the service tests.
- Run the API test if present.
- Expected: tests pass and latest mission behavior is correct.

Step 4: Commit the API layer.
- Run: `git add src/lib src/app/api/dashboard/route.ts`
- Run: `git commit -m "feat: add visibility dashboard api"`

---

### Task 4: Build the minimal card-based visibility UI

Objective: Render the dashboard in a calm, minimal layout that makes the latest mission obvious.

Files:
- Modify: `src/app/page.tsx`
- Create: `src/components/dashboard/DashboardShell.tsx`
- Create: `src/components/dashboard/MissionHighlightCard.tsx`
- Create: `src/components/dashboard/MissionList.tsx`
- Create: `src/components/dashboard/MissionCard.tsx`
- Create: `src/lib/dashboard-client.ts`
- Create: `src/components/dashboard/__tests__/MissionCard.test.tsx`

Step 1: Write tests for card ordering.
- Verify actor/team member appears before action text.
- Verify no edit affordances are present.

Step 2: Build the shell and cards.
- Render the latest mission first.
- Render recent missions below it.
- Keep copy and chrome minimal.

Step 3: Verify the page in the browser.
- Run the app locally.
- Open the root page.
- Expected: latest mission is visible immediately and the UI is read-only.

Step 4: Commit the UI.
- Run: `git add src/app src/components src/lib`
- Run: `git commit -m "feat: build visibility dashboard ui"`

---

### Task 5: Add loading, empty, and partial-data states

Objective: Keep the dashboard useful when the API is slow, empty, or missing fields.

Files:
- Modify: `src/components/dashboard/DashboardShell.tsx`
- Modify: `src/components/dashboard/MissionCard.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/components/dashboard/__tests__/dashboard-states.test.tsx`

Step 1: Add loading state UI.
- Use a simple skeleton or placeholder card.

Step 2: Add empty-state UI.
- Keep it short, calm, and non-blocking.

Step 3: Add partial-data fallbacks.
- If actor name is missing, show `Unknown agent`.
- If role is missing, omit it.
- If action detail is missing, fall back to a mission-level summary.

Step 4: Verify all states.
- Run the state tests.
- Verify no blank or broken cards appear.

Step 5: Commit the resilience work.
- Run: `git add src/app src/components src/lib`
- Run: `git commit -m "feat: handle dashboard loading and fallback states"`

---

### Task 6: Wire the database and preview/prod deployment path

Objective: Connect the data layer to Neon and make preview deployments the gate before production.

Files:
- Create: `prisma/schema.prisma` or the chosen data-layer config
- Create: `src/lib/db.ts`
- Modify: `.env.example`
- Update: `README.md`
- Create: `docs/deployment.md`

Step 1: Define the minimal persistent data shape.
- Map mission records, mission events, and actor metadata.
- Keep the schema read optimized.

Step 2: Document local and preview environment guidance.
- Explain how preview DB branches are used.
- Document required environment variables.

Step 3: Verify the deployment assumptions.
- Run schema generation or migrations.
- Confirm the dashboard reads from the configured database.

Step 4: Commit deployment readiness.
- Run: `git add prisma src docs README.md .env.example`
- Run: `git commit -m "feat: connect visibility dashboard to database"`

---

### Task 7: QA the mission against the team brief

Objective: Prove the visibility application satisfies the first mission before production promotion.

Files:
- Update: `docs/missions/MISSION_001_VISIBILITY_APPLICATION.md`
- Create: `tests/e2e/dashboard.spec.ts` or equivalent browser test

Step 1: Automate the core acceptance checks.
- Default landing shows the latest updated mission.
- Running and completed missions both appear.
- The latest mission is clearly highlighted.
- Read-only behavior is enforced.

Step 2: Run browser validation in preview.
- Confirm minimal UI and partial-data resilience.

Step 3: Record any gaps before release.
- Note blockers separately from nice-to-haves.

Step 4: Commit the QA artifacts.
- Run: `git add tests docs`
- Run: `git commit -m "test: validate visibility application mvp"`

---

### Exit criteria

- The application opens to the latest updated mission by default.
- Running and completed missions are both visible.
- Every card shows actor first, action second.
- The UI remains private, read-only, and minimal.
- Missing data does not block rendering.
- The app is validated in preview before production promotion.
