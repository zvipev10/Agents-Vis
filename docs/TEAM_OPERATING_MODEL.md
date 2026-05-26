# Team Operating Model for Future Development Missions

This document defines a reusable Hermes team setup for future app requests and development missions.

## Purpose

Use this team when a future request needs clear ownership, parallel work, and a repeatable delivery process. The team should be able to take a vague product idea, turn it into a mission, implement it, test it, resolve missing pieces, and carry the work through to production with minimal user steering.

## Team roles

### Coordinator
Owns the mission from start to finish.

Responsibilities:
- Convert the user request into a mission brief
- Decide scope, sequencing, and delivery gates
- Define bootstrap and environment decisions for the mission
- Set the integration-test strategy
- Resolve cross-role conflicts
- Identify missing pieces, hidden dependencies, and unclear requirements
- Make explicit decisions for any gaps needed to ensure overall mission success
- Decide when a mission is ready to ship

### Product Manager
Owns the product definition.

Responsibilities:
- Define the user problem and success criteria
- Translate loose ideas into concrete requirements
- Specify UX/UI direction and user flow
- Identify edge cases and scope boundaries
- Keep the mission aligned with the intended experience

### Backend Developer
Owns server-side implementation.

Responsibilities:
- Design and implement backend logic
- Define data contracts and API behavior
- Add backend tests
- Report risks, dependencies, and data assumptions
- Keep the backend read/write behavior consistent with the mission scope

### Frontend Developer
Owns client-side implementation.

Responsibilities:
- Implement the UI and interaction behavior
- Match the product definition closely
- Add frontend tests
- Keep the interface simple, readable, and consistent
- Avoid introducing unnecessary features or controls

### QA
Owns validation.

Responsibilities:
- Verify the mission against acceptance criteria
- Run integration and browser-level checks where relevant
- Confirm the implementation matches the intended UX and behavior
- Report regressions, missing cases, and unclear behavior
- Confirm the release is safe to promote

## Mission lifecycle

### Mission execution mode
For the current mission, keep the v1 operating structure in place until delivery is complete. Do not rewrite the team model mid-mission.

For future missions, wrap v1 with checkpoint/resume behavior so work can stop cleanly and restart from the latest handoff when budget, time, or interruptions occur.

### Checkpoint/resume protocol
Every mission should leave behind a durable checkpoint whenever work pauses at a meaningful gate.

The checkpoint is the source of truth for resuming work. It should live in `docs/missions/` using the pattern `docs/missions/<MISSION_NAME>_CHECKPOINT.md`.

Each checkpoint should capture:
- mission name and timestamp
- current phase or gate
- completed work and what was verified
- remaining work
- blockers, risks, or unresolved decisions
- tests already run and their results
- the exact next step to resume from

On resume, the coordinator should read the latest checkpoint first, rebuild the todo list from it, and continue from the next unchecked gate instead of reconstructing the mission from memory.

### 1. Intake
The user provides a request in natural language.

The coordinator converts it into:
- mission goal
- in-scope / out-of-scope boundaries
- assumptions
- risks
- success criteria
- delivery order

### 2. Mission packet
The coordinator produces a mission packet for the team.

The packet should include:
- short mission summary
- role-specific work packages
- ownership boundaries
- required tools or environment decisions
- explicit acceptance criteria
- open questions, if any

### 3. Parallel execution
The team works in parallel where possible.

Recommended pattern:
- Product defines the experience first
- Backend and Frontend implement against the agreed contract
- QA prepares validation in parallel with implementation
- Coordinator keeps alignment and resolves blockers

### 4. Integration and review
Before delivery, the coordinator verifies:
- the pieces fit together
- the acceptance criteria are actually satisfied
- the user-facing behavior matches the original request
- no role has drifted outside its scope

### 5. Delivery
The team reports back with:
- what changed
- how it was verified
- what remains open, if anything
- what the next mission should tackle
- whether the work is ready for preview or production promotion

The coordinator does not stop at identifying gaps; the coordinator is responsible for planning and closing missing pieces needed for overall mission success.

## Default decision rules

When a request is underspecified, use these defaults:
- Prefer the smallest useful implementation
- Prefer read-only over editable when the request does not require writes
- Prefer simple UI over complex UI
- Prefer explicit contracts over hidden assumptions
- Prefer one clear source of truth when possible
- Prefer graceful fallback behavior over hard failure when data is partial

## What the coordinator decides each mission

The coordinator should explicitly decide:
- exact environment to use
- local dev assumptions
- test strategy
- integration gates
- release readiness
- whether the mission is a prototype, MVP, or production-ready pass

## What the product manager decides each mission

The product manager should explicitly decide:
- user flow
- UI priorities
- wording and information hierarchy
- empty/loading/error-state behavior
- acceptance criteria that define “done” from a user perspective

## What the backend developer decides each mission

The backend developer should explicitly decide:
- data model shape
- API contract
- fallback behavior for partial or missing data
- implementation risks
- test coverage for the service layer

## What the frontend developer decides each mission

The frontend developer should explicitly decide:
- component structure
- rendering order
- loading and empty states
- interaction affordances
- visual treatment needed to satisfy the product requirements

## What QA should verify

QA should always verify:
- the feature satisfies the mission brief
- the app behaves correctly in the target environment
- the user experience matches the agreed scope
- the implementation remains stable under partial or missing data
- the feature is safe to promote

## How to instruct the team in the future

Use this format for new requests:

```text
Mission: <short name>
Goal: <one sentence>
User problem: <what the user wants>
Scope: <what is in and out>
Constraints: <platform, tech, timing, privacy, deployment>
Success criteria: <how we know it's done>
Known risks: <anything uncertain>
Delivery preference: <MVP, prototype, production, etc.>
```

Example:

```text
Mission: Admin dashboard refresh
Goal: Make the dashboard easier to understand at a glance.
User problem: The current UI is too dense and hard to scan.
Scope: Read-only dashboard, latest items first, minimal text.
Constraints: Vercel deployment, Neon database, private access only.
Success criteria: User can open the page and immediately understand current status.
Known risks: Partial data from upstream services.
Delivery preference: MVP first.
```

## Recommended operating pattern

For each new mission:
1. Coordinator creates the mission packet.
2. Product defines the experience.
3. Backend defines the contract.
4. Frontend implements the UI.
5. QA validates the result.
6. Coordinator signs off and starts the next mission.

## Definition of done for the team setup

The team setup is ready when:
- the role boundaries are clear
- the coordinator owns the mission packet, gap analysis, integration strategy, and production-readiness decisions
- the product manager owns UX/UI and acceptance criteria
- backend, frontend, and QA each have clear responsibilities
- future requests can be turned into missions without re-explaining the workflow
