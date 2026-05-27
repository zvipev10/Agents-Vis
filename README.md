# Agents-Vis

A fresh repository for a small web application built with a team workflow in Hermes.

## Team workflow

Roles are split into:
- Assistant
- Coordinator Worker
- Product Manager
- Backend Developer
- Frontend Developer
- QA

The assistant helps prepare the mission and report status.
The coordinator worker owns mission planning, integration strategy, and delivery gates.
The product manager owns UX/UI and acceptance criteria.
The backend and frontend developers implement the feature and tests.
QA validates the result in the agreed environment.

## Repository and deployment status

- GitHub repository: https://github.com/zvipev10/Agents-Vis
- Default branch: main
- Vercel production URL: https://agents-vis.vercel.app
- Preview deployments: enabled through GitHub branches / pull requests in Vercel
- Neon is managed by Vercel integration, so preview deployments get matching preview database branches automatically

## What preview deployments mean

When a branch other than `main` is pushed, or when a pull request is opened, Vercel can create a temporary preview deployment for that change.
That preview has its own URL and is used for QA and review before merging to production.

## Database and environment policy

- Production uses the main branch and the protected production database
- Preview deployments use Vercel-managed preview branches in Neon
- The team leader does not need to manually create a Neon branch for every PR
- Vercel manages the deployment environment variables for the connected project
- Migrations should be validated in preview before production promotion
- A separate long-lived staging database is optional, not required by default

## Current status

The repository is bootstrapped and the first development mission is defined in `docs/missions/MISSION_001_VISIBILITY_APPLICATION.md`.
Mission progress is also checkpointed in `docs/missions/MISSION_001_CHECKPOINT.md`, with the reusable checkpoint/resume protocol documented in `docs/missions/CHECKPOINT_RESUME_PROTOCOL.md`.

## Next step
Provide a future mission using the format in `docs/TEAM_OPERATING_MODEL.md`, and resume long-running work from the latest checkpoint file instead of reconstructing context from memory.
