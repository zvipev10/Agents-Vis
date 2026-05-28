create table if not exists missions (
  id text primary key,
  title text not null,
  status text not null check (status in ('running', 'completed', 'unknown')),
  updated_at timestamptz not null,
  actor_name text,
  actor_role text,
  action text,
  detail text,
  summary text,
  version bigint not null default 0,
  created_at timestamptz not null default now(),
  ingested_at timestamptz not null default now()
);

create index if not exists missions_updated_at_idx on missions (updated_at desc, title asc, id asc);
create index if not exists missions_status_idx on missions (status);

create table if not exists mission_events (
  id text primary key,
  mission_id text not null references missions (id) on delete cascade,
  actor_name text not null,
  actor_role text,
  action text not null,
  detail text,
  summary text,
  event_timestamp timestamptz not null,
  sequence_index bigint not null,
  parallel_group_id text,
  parallel_order integer,
  parallel_size integer,
  source_label text,
  event_type text,
  request_id text not null unique,
  payload_hash text not null,
  freshness text not null default 'fresh' check (freshness in ('fresh', 'partial', 'delayed', 'stale', 'empty')),
  created_at timestamptz not null default now(),
  unique (mission_id, sequence_index)
);

create index if not exists mission_events_mission_time_idx on mission_events (mission_id, event_timestamp asc, sequence_index asc);
create index if not exists mission_events_created_at_idx on mission_events (mission_id, created_at desc);
create unique index if not exists mission_events_request_id_idx on mission_events (request_id);
