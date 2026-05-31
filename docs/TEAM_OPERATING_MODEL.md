# Team Operating Model for Future Development Missions

This document defines a reusable Hermes team setup for future app requests and development missions.

## Purpose

Use this team when a future request needs clear ownership, parallel work, and a repeatable delivery process. The team should be able to take a vague product idea, turn it into a mission, implement it, test it, resolve missing pieces, and carry the work through to production with minimal user steering.

The assistant helps prepare the mission, clarify requirements with the user, and report status. The coordinator worker owns mission execution and coordination.

## Team roles

### Assistant
Supports the user during mission setup and tracking.

Responsibilities:
- Turn rough requests into a clean mission prompt or brief
- Help identify missing context before work starts
- Read checkpoints and handoffs to summarize progress
- Report blockers, milestones, and status back to the user
- Stay out of execution ownership so the coordinator worker can lead delivery

### Coordinator Worker
Owns the mission from start to finish.

Responsibilities:
- Convert the user request into a mission brief
- Decide scope, sequencing, and delivery gates
- Define bootstrap and environment decisions for the mission
- Set the integration-test strategy
- Coordinate product, backend, frontend, and QA workstreams
- Keep the product manager aligned on UX/UI, acceptance criteria, and mission intent
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
- Work with the coordinator worker so product decisions are reflected in the mission packet and checkpoints

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

The assistant should remain the user-facing prep/status layer, while the coordinator worker should remain the execution owner.

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

On resume, the coordinator worker should read the latest checkpoint first, rebuild the todo list from it, and continue from the next unchecked gate instead of reconstructing the mission from memory.

### Context compaction protocol
When the chat is getting long, the team should assume compaction may happen soon and switch state to files first.

Before context pressure becomes a problem:
- write or update the latest checkpoint
- update any finished role handoff files
- record the current live status in a short summary
- keep detailed evidence in files, not in chat

After a compaction, recover state in this order:
1. latest checkpoint
2. role handoffs
3. todo list or task board
4. live process / port / browser evidence if the mission is still executing

Do not rebuild mission state from chat memory when durable artifacts already exist.

### 1. Intake
The user provides a request in natural language.

The coordinator worker converts it into:
- mission goal
- in-scope / out-of-scope boundaries
- assumptions
- risks
- success criteria
- delivery order

### 2. Mission packet
The coordinator worker produces a mission packet for the team.

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
- Coordinator worker keeps alignment and resolves blockers

### 4. Integration and review
Before delivery, the coordinator worker verifies:
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

The coordinator worker does not stop at identifying gaps; the coordinator worker is responsible for planning and closing missing pieces needed for overall mission success.

## Mission event ledger protocol

For any mission that uses the Agents-Vis live dashboard, the event API is the mission ledger. Agents must treat it as the only supported write path for timeline state.

Required rules:
- Write mission timeline events only through `POST /api/agent-events`.
- Do not write dashboard JSON, Neon rows, mission timeline state, or cached API payloads directly.
- The coordinator worker owns the `missionId`, role assignments, and sequence plan before workers start writing events.
- All workers must use the same `missionId` for the mission.
- `sequenceIndex` must be a safe integer and strictly increasing for durable mission milestones.
- Use adjacent indexes for normal serial work. Do not use large artificial gaps such as `99`, `1000`, or random fallback numbers unless the coordinator explicitly reserved that range before work began.
- Parallel work should still receive deterministic adjacent indexes from the coordinator, with `parallelGroupId`, `parallelOrder`, and `parallelSize` used to express concurrency.
- Write events only for durable milestones: assignment accepted, important decision, handoff completed, verification result, blocker found, deployment/promote decision, and final closeout.
- Do not write heartbeat, progress-noise, speculative, or duplicate summary events.
- If the API returns a sequence conflict, stop and ask the coordinator for a new assigned `sequenceIndex`. Do not retry with a random or very large index.
- If the API returns a server error, record the failure in the checkpoint and stop event-writing work until the coordinator resolves the write path.

Recommended event ownership:
- Coordinator writes mission start, sequence plan, integration gates, blocker decisions, and final closeout.
- Product writes product decisions and acceptance-criteria handoff events.
- Backend writes API/data-contract decisions, backend implementation milestones, and backend verification events.
- Frontend writes UI implementation and frontend verification events.
- QA writes validation plan, validation results, regressions, and release-readiness events.

A mission is not considered fully observable until the coordinator confirms that expected role events were accepted by `POST /api/agent-events` and visible through both `/api/dashboard` and `/api/missions/latest`.

## Default decision rules

When a request is underspecified, use these defaults:
- Prefer the smallest useful implementation
- Prefer read-only over editable when the request does not require writes
- Prefer simple UI over complex UI
- Prefer explicit contracts over hidden assumptions
- Prefer one clear source of truth when possible
- Prefer graceful fallback behavior over hard failure when data is partial

## What the coordinator worker decides each mission

The coordinator worker should explicitly decide:
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
1. Assistant helps the user refine the request.
2. Coordinator worker creates the mission packet.
3. Product defines the experience.
4. Coordinator worker coordinates product decisions into the mission packet.
5. Backend defines the contract.
6. Frontend implements the UI.
7. QA validates the result.
8. Coordinator worker signs off and starts the next mission.

## Definition of done for the team setup

The team setup is ready when:
- the role boundaries are clear
- the coordinator worker owns the mission packet, gap analysis, integration strategy, and production-readiness decisions
- the product manager owns UX/UI and acceptance criteria
- the assistant supports mission prep and progress reporting instead of owning execution
- backend, frontend, and QA each have clear responsibilities
- future requests can be turned into missions without re-explaining the workflow
