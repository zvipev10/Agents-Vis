-- Add taskId, eventStatus, action, detail, summary columns
ALTER TABLE mission_events ADD COLUMN IF NOT EXISTS task_id TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE mission_events ADD COLUMN IF NOT EXISTS event_status TEXT;
ALTER TABLE mission_events ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE mission_events ADD COLUMN IF NOT EXISTS detail TEXT;
ALTER TABLE mission_events ADD COLUMN IF NOT EXISTS summary TEXT;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS mission_events_actor_role_idx ON mission_events (actor_role);
CREATE INDEX IF NOT EXISTS mission_events_event_status_idx ON mission_events (event_status);
CREATE INDEX IF NOT EXISTS mission_events_task_lookup_idx ON mission_events (mission_id, task_id, event_timestamp DESC, sequence_index DESC, id DESC);
CREATE INDEX IF NOT EXISTS mission_events_action_search_idx ON mission_events USING gin (lower(action) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS mission_events_detail_search_idx ON mission_events USING gin (lower(detail) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS mission_events_summary_search_idx ON mission_events USING gin (lower(summary) gin_trgm_ops);
