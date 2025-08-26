-- Billing schema: minutes tracking, subscriptions, purchases
create table if not exists minutes_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  minutes integer not null check (minutes > 0),
  entry_type text not null check (entry_type in ('credit','debit')),
  reason text not null,
  currency text default 'USD',
  cycle_start timestamptz,
  cycle_end timestamptz,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Unique free signup credit per user
create unique index if not exists minutes_ledger_free_signup_once on minutes_ledger(user_id)
  where reason = 'free_signup' and entry_type = 'credit';

-- Subscriptions table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('starter','basic','growth','pro')),
  billing_interval text not null check (billing_interval in ('monthly','yearly')),
  status text not null default 'inactive',
  currency text not null default 'USD',
  minutes_quota integer not null,
  razorpay_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on subscriptions(user_id);

-- Purchases (addons/upgrades)
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('addon','upgrade')),
  minutes integer not null,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'pending',
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_idx on purchases(user_id);
