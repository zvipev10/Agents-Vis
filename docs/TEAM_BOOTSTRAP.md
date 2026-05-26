# Team Bootstrap Checklist

This document defines what should be prepared before a mission starts and what the team should receive.

## External resources provided by the user
- GitHub repository access
- Vercel project/access
- Neon database/access
- Any required third-party service accounts or secrets

## Confirmed platform mapping for this repo
- GitHub repo: `zvipev10/Agents-Vis`
- Default branch: `main`
- Vercel production URL: `https://agents-vis.vercel.app`
- Vercel previews: branches / pull requests create preview deployments
- Neon is managed through the Vercel integration; preview deployments get matching preview database branches automatically
- Vercel manages the environment variables for the connected project, so the repo only needs placeholder templates
- No long-lived staging database is required by default unless the team leader explicitly adds one

## Team-owned setup
- Repository structure
- Local setup instructions
- Environment template files
- Mission workflow and role definitions
- Test commands and validation flow
- Integration-test strategy per feature
- Deployment/runbook documentation

## Role responsibilities

### Coordinator
- Own the mission plan
- Decide what dev, QA, and production need for the mission
- Define integration-test strategy for the feature
- Decide promotion rules and release readiness

### Product Manager
- Define UX/UI
- Define acceptance criteria
- Define feature scope and edge cases

### Backend Developer
- Implement backend logic and backend tests
- Report contracts, data changes, and risks

### Frontend Developer
- Implement UI and frontend tests
- Match the agreed UX/UI definition

### QA
- Execute validation and integration checks
- Confirm the feature meets the agreed criteria

## Minimum bootstrap items
- README with setup instructions
- .env.example with placeholders
- .gitignore
- clear local run command
- clear test commands
- environment map for dev, preview/QA, and production
- deployment target documented

## Note
The reusable team operating model lives in `docs/TEAM_OPERATING_MODEL.md`.
The exact framework, folder structure, and deployment details for a specific app will be added once a mission is defined.
