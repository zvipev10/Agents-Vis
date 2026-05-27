# Mission 001 coordinator worker handoff

## Mission status
Resume from the checkpoint and finish the final verification pass for the reconstructed visibility dashboard.

## Source of truth
- Mission brief: `docs/missions/MISSION_001_VISIBILITY_APPLICATION.md`
- Checkpoint: `docs/missions/MISSION_001_CHECKPOINT.md`
- QA checklist: `docs/missions/MISSION_001_QA_CHECKLIST.md`
- Backend approach: `docs/missions/MISSION_001_BACKEND_APPROACH.md`

## What the coordinator worker should do first
1. Read the checkpoint and confirm the current checkout state.
2. Re-run the missing verification steps from the current repo state.
3. Check for port conflicts before browser smoke validation.
4. Decide whether any last hardening edits need a final tweak or can be accepted as-is.
5. Keep the team focused on the latest mission state rather than chat history.

## What to hand to the team
- A fresh verification packet with the current repo state
- A narrow backend sanity check for the dashboard data contract
- A frontend sanity check for read-only / latest-mission-first behavior
- A QA pass focused on regression, smoke, and production-readiness evidence

## Success condition
The mission should resume cleanly from files, not from a rewritten plan, and the team should be able to finish verification without re-discussing the earlier implementation details.
