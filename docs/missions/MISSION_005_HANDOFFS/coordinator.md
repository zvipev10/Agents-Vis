# Mission 005 Coordinator Handoff

## Verdict
**blocked on live runtime/database wiring**

The repo now has the core Neon-backed architecture in place: a simple agent write endpoint, a Neon-backed store for reads/writes, preserved dashboard/latest-mission envelopes, and visible freshness/lag semantics. Backend, Frontend, Product, and QA handoffs have been refreshed, and the mission documentation PDFs now exist. The latest verification run confirmed local build/test/typecheck success, but the deployed Vercel app is currently returning `500` on `/`, `/api/dashboard`, and `/api/missions/latest`, so live cutover verification remains blocked.

## What is done
- Canonical trust boundary is implemented in code: backend validation + Neon DB are the source of truth.
- `POST /api/agent-events` exists as a simple server-validated write path into Neon, with payload-shape validation and DB-backed persistence.
- `GET /api/dashboard` and `GET /api/missions/latest` read from the Neon-backed store when DB env vars are present.
- The UI remains read-only and still consumes the same response envelopes.
- Freshness / lag / updated-at are preserved in the response contract.
- DB schema and migration scaffolding exist for `missions` and `mission_events`.
- Mission 005 PDFs were generated and verified in `docs/missions/pdfs/`.

## Key gaps / caveats
1. **Production cutover depends on deployment environment wiring.**
   - The runtime still falls back to JSON when `NEON_DATABASE_URL` / `DATABASE_URL` is absent.
   - That fallback is acceptable for local/dev, but it must not remain the live truth path in production/preview after cutover.

2. **Migration/backfill is not yet fully closed.**
   - There is a schema migration, but no clearly executed one-time JSON-to-Neon backfill path has been verified from this environment.
   - The boundary must be explicit: JSON may seed/bootstrap once, but new writes must go only to the simple backend API and Neon.

3. **Live deployment currently returns 500 from this environment.**
   - The production URL is reachable, but `/`, `/api/dashboard`, and `/api/missions/latest` are returning `500`.
   - This is a deployment / environment wiring issue, not a local code-quality issue.

4. **Freshness is mostly correct at the API layer, but DB persistence still stores a freshness field on events.**
   - Treat that as diagnostic/derived metadata, not a second source of truth.
   - Read-time freshness should remain based on DB timestamps and response generation time.

## Canonical DB trust boundary
- **Trusted:** Neon rows, backend validation, read API shaping.
- **Untrusted:** browser state, agent payloads before server validation, JSON files/feeds except as bootstrap/export artifacts.
- **Do not** treat JSON replication as the main architecture after migration.

## Freshness semantics
- Freshness must remain visible as one of: `fresh`, `partial`, `delayed`, `stale`, `empty`.
- `updatedAt` and `lagMs` should be derived from DB state and response generation time.
- The UI should keep surfacing freshness/lag explicitly and remain read-only.

## Migration / backfill boundary
- One-time historical import from the current JSON source is allowed.
- After backfill, writes must land only in the simple backend API and canonical DB.
- Any JSON export/debug artifact must be generated from DB state, not the reverse.
- Production/preview should not depend on JSON fallback once Neon is live.

## Recommended next-step dependencies
### Backend
- Finish the live deployment/runtime wiring checks for Neon-backed canonical environments.
- Confirm the live write path accepts valid payloads without any secret, nonce, or replay envelope.
- Keep the write/read contract stable.

### Frontend
- Keep the UI read-only.
- Continue consuming the existing dashboard/latest-mission envelopes.
- Ensure freshness / lag / updated-at remain visible and legible across states.

### QA
- Verify writes are accepted with valid payloads and rejected for invalid payload shape.
- Verify accepted writes persist to Neon and appear through read APIs.
- Verify freshness/lag visibility in preview or production.
- Verify the app remains read-only for end users.
- Verify JSON is no longer the truth path after cutover.
- Re-run deployed smoke once the environment wiring is updated.

## Coordinator call
Proceed with deployment/runtime verification next. Do not mark Mission 005 complete until the deployed app in the canonical environment is confirmed to return 200s on the canonical DB-backed path.
