# Mission 001 QA handoff

## What to resume
Run the final verification pass from the current checkout and confirm the mission is still production-ready after the last hardening edits.

## Checks to run
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- Browser smoke test against a free local port
- Confirm read-only behavior in the rendered UI
- Confirm latest-mission-first display
- Confirm running and completed missions both appear
- Confirm partial data still renders safely

## Special attention
- Watch for port conflicts before starting the dev server
- Re-check after the last hardening edits, not just the earlier successful pass
- Capture any regression introduced by the final verification tweaks

## Expected output
- A concise pass/fail summary
- Any blockers that prevent production promotion
- Any last-mile issues that require a coordinator decision
