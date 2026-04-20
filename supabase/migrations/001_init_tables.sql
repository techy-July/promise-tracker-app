-- ============================================================
-- Promise & Commitment Tracker — Supabase Schema
-- Run in order. Requires pgcrypto + uuid-ossp extensions.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. CATEGORIES
-- Must exist before trackable_items references it.
-- ============================================================
create table public.categories (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  color_hex     text not null default '#6366f1',
  icon          text,                          -- e.g. 'briefcase', 'graduation-cap'
  keywords      text[] not null default '{}',  -- phrases that trigger auto-extraction
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint categories_user_name_unique unique (user_id, name)
);

-- ============================================================
-- 2. TRACKABLE ITEMS
-- Central table — replaces the original promises table.
-- ============================================================
create table public.trackable_items (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  category_id     uuid references public.categories(id) on delete set null,

  -- Content
  title           text not null,
  description     text,
  source_type     text not null default 'manual'
                    check (source_type in ('manual','paste','email','slack','sms')),
  source_raw      text,   -- original pasted text blob

  -- Status lifecycle: pending → done | overdue | snoozed
  status          text not null default 'pending'
                    check (status in ('pending','done','overdue','snoozed')),
  priority        smallint not null default 2
                    check (priority between 1 and 3),  -- 1=high 2=medium 3=low

  -- Scheduling
  due_date        timestamptz,
  snoozed_until   timestamptz,

  -- Extraction metadata
  auto_extracted  boolean not null default false,
  confidence      numeric(4,3),  -- 0.000–1.000, populated by AI extractor

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_trackable_items_updated_at
  before update on public.trackable_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. TAGS  (optional labelling, e.g. "urgent", "client-x")
-- ============================================================
create table public.tags (
  id      uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label   text not null,
  constraint tags_user_label_unique unique (user_id, label)
);

create table public.item_tags (
  item_id uuid not null references public.trackable_items(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

-- ============================================================
-- 4. EXTRACTION RULES
-- Learned patterns that auto-classify future pastes.
-- ============================================================
create table public.extraction_rules (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  pattern_type        text not null default 'phrase'
                        check (pattern_type in ('phrase','regex')),
  pattern_value       text not null,
  default_category_id uuid references public.categories(id) on delete set null,
  default_priority    smallint not null default 2
                        check (default_priority between 1 and 3),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- 5. NOTIFICATION CHANNELS
-- Verified destinations: email, slack webhook, web push.
-- ============================================================
create table public.notification_channels (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  channel_type text not null check (channel_type in ('email','slack','push')),
  destination  text not null,   -- email addr, slack webhook url, or push endpoint
  label        text,            -- human-friendly name, e.g. "Work Slack"
  is_verified  boolean not null default false,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  constraint channels_user_dest_unique unique (user_id, destination)
);

-- ============================================================
-- 6. REMINDERS
-- Each item can have multiple reminders on different channels.
-- ============================================================
create table public.reminders (
  id         uuid primary key default uuid_generate_v4(),
  item_id    uuid not null references public.trackable_items(id) on delete cascade,
  channel_id uuid references public.notification_channels(id) on delete set null,
  remind_at  timestamptz not null,
  status     text not null default 'pending'
               check (status in ('pending','sent','failed','cancelled')),
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. REPLY TRACKING
-- One-to-one with an item; tracks whether a response is awaited.
-- ============================================================
create table public.reply_tracking (
  id                 uuid primary key default uuid_generate_v4(),
  item_id            uuid not null unique references public.trackable_items(id) on delete cascade,
  platform           text not null default 'email'
                       check (platform in ('email','slack','sms','other')),
  external_thread_id text,    -- Gmail message-id, Slack thread_ts, etc.
  awaiting_reply     boolean not null default true,
  nudge_after_days   smallint not null default 3,
  last_checked_at    timestamptz,
  replied_at         timestamptz,
  created_at         timestamptz not null default now()
);

-- ============================================================
-- 8. INDEXES
-- ============================================================
create index idx_items_user_status    on public.trackable_items(user_id, status);
create index idx_items_due_date       on public.trackable_items(due_date) where due_date is not null;
create index idx_items_snoozed        on public.trackable_items(snoozed_until) where status = 'snoozed';
create index idx_reminders_remind_at  on public.reminders(remind_at) where status = 'pending';
create index idx_reply_awaiting       on public.reply_tracking(awaiting_reply) where awaiting_reply = true;

-- ============================================================
-- 9. ROW LEVEL SECURITY
-- Enable on every table. Users only see their own data.
-- ============================================================
alter table public.categories           enable row level security;
alter table public.trackable_items      enable row level security;
alter table public.tags                 enable row level security;
alter table public.item_tags            enable row level security;
alter table public.extraction_rules     enable row level security;
alter table public.notification_channels enable row level security;
alter table public.reminders            enable row level security;
alter table public.reply_tracking       enable row level security;

-- categories
create policy "users manage own categories"
  on public.categories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trackable_items
create policy "users manage own items"
  on public.trackable_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- tags
create policy "users manage own tags"
  on public.tags for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- item_tags (join table — access via item ownership)
create policy "users manage own item_tags"
  on public.item_tags for all
  using (
    exists (
      select 1 from public.trackable_items
      where id = item_id and user_id = auth.uid()
    )
  );

-- extraction_rules
create policy "users manage own rules"
  on public.extraction_rules for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- notification_channels
create policy "users manage own channels"
  on public.notification_channels for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reminders (access via item ownership)
create policy "users manage own reminders"
  on public.reminders for all
  using (
    exists (
      select 1 from public.trackable_items
      where id = item_id and user_id = auth.uid()
    )
  );

-- reply_tracking (access via item ownership)
create policy "users manage own reply_tracking"
  on public.reply_tracking for all
  using (
    exists (
      select 1 from public.trackable_items
      where id = item_id and user_id = auth.uid()
    )
  );

-- ============================================================
-- 10. DEFAULT CATEGORIES SEED FUNCTION
-- Call after a new user signs up (via trigger or auth webhook).
-- ============================================================
create or replace function public.seed_default_categories(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.categories (user_id, name, color_hex, icon, keywords, is_default) values
    (p_user_id, 'Promises',        '#6366f1', 'handshake',      array['i''ll send','i''ll get back','follow up','let me check','i''ll do'], true),
    (p_user_id, 'Deadlines',       '#f59e0b', 'clock',          array['due by','deadline','submit by','by end of','before'], true),
    (p_user_id, 'Waiting on reply',  '#3b82f6', 'mail',         array['awaiting','waiting for','no response','did you get'], true),
    (p_user_id, 'Job applications', '#10b981', 'briefcase',     array['applied','application','interview','offer','rejection'], false),
    (p_user_id, 'University',       '#8b5cf6', 'graduation-cap',array['admission','enrollment','transcript','financial aid'], false);
end;
$$;

-- Auto-seed on new user creation
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 11. OVERDUE UPDATER
-- Run periodically via pg_cron or Supabase Edge Function cron.
-- Updates pending items past their due_date to overdue.
-- ============================================================
create or replace function public.mark_overdue_items()
returns void language plpgsql security definer as $$
begin
  update public.trackable_items
  set status = 'overdue'
  where status = 'pending'
    and due_date is not null
    and due_date < now();
end;
$$;

-- ============================================================
-- Done. Verify with:
--   select table_name from information_schema.tables
--   where table_schema = 'public' order by table_name;
-- ============================================================