create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
  email text unique not null,
  display_name text,
  role text not null check (role in ('super_admin', 'staff', 'talent', 'supporter')),
  created_at timestamptz not null default now()
);

create table if not exists public.talents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  slug text unique not null,
  name text not null,
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  talent_id uuid not null references public.talents(id) on delete cascade,
  slug text unique not null,
  title text not null,
  summary text not null,
  description text not null,
  cover_image_url text,
  goal_amount integer not null check (goal_amount > 0),
  currency text not null default 'JPY',
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'closed', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_rewards (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  description text not null,
  price integer not null check (price > 0),
  quantity integer,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  requires_shipping boolean not null default false
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete restrict,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  supporter_email text not null,
  supporter_name text,
  supporter_nickname text,
  supporter_phone text,
  message text,
  amount_total integer not null check (amount_total > 0),
  currency text not null default 'JPY',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  country text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reward_id uuid references public.campaign_rewards(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_amount integer not null check (unit_amount > 0),
  line_amount integer not null check (line_amount > 0)
);

create table if not exists public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  country text not null,
  postal_code text,
  state text,
  city text,
  address_line1 text not null,
  address_line2 text,
  recipient_name text not null
);

create table if not exists public.campaign_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  body text not null,
  is_public boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_approvals (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles(id) on delete restrict,
  status text not null check (status in ('approved', 'rejected', 'requested_changes')),
  comment text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'supporter')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.talents enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_rewards enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipping_addresses enable row level security;
alter table public.campaign_updates enable row level security;
alter table public.staff_approvals enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "public can view published campaigns"
on public.campaigns
for select
using (status = 'published');

create policy "users can view own profile"
on public.profiles
for select
using (
  auth.uid() = id
  or public.current_user_role() in ('super_admin', 'staff')
);

create policy "public can view active talents"
on public.talents
for select
using (is_active = true or profile_id = auth.uid() or public.current_user_role() in ('super_admin', 'staff'));

create policy "staff can manage profiles"
on public.profiles
for all
using (public.current_user_role() in ('super_admin', 'staff'))
with check (public.current_user_role() in ('super_admin', 'staff'));

create policy "staff can manage talents"
on public.talents
for all
using (public.current_user_role() in ('super_admin', 'staff'))
with check (public.current_user_role() in ('super_admin', 'staff'));

create policy "public can view active rewards of published campaigns"
on public.campaign_rewards
for select
using (
  is_active = true
  and exists (
    select 1
    from public.campaigns
    where public.campaigns.id = campaign_rewards.campaign_id
      and public.campaigns.status = 'published'
  )
);

create policy "staff can manage all rewards"
on public.campaign_rewards
for all
using (public.current_user_role() in ('super_admin', 'staff'))
with check (public.current_user_role() in ('super_admin', 'staff'));

create policy "talent can manage own rewards"
on public.campaign_rewards
for all
using (
  exists (
    select 1
    from public.campaigns
    join public.talents on public.talents.id = public.campaigns.talent_id
    where public.campaigns.id = public.campaign_rewards.campaign_id
      and public.talents.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.campaigns
    join public.talents on public.talents.id = public.campaigns.talent_id
    where public.campaigns.id = public.campaign_rewards.campaign_id
      and public.talents.profile_id = auth.uid()
  )
);

create policy "public can view public campaign updates"
on public.campaign_updates
for select
using (
  is_public = true
  and exists (
    select 1
    from public.campaigns
    where public.campaigns.id = campaign_updates.campaign_id
      and public.campaigns.status = 'published'
  )
);

create policy "staff can manage all campaigns"
on public.campaigns
for all
using (public.current_user_role() in ('super_admin', 'staff'))
with check (public.current_user_role() in ('super_admin', 'staff'));

create policy "talent can manage own campaigns"
on public.campaigns
for all
using (
  exists (
    select 1
    from public.talents
    where public.talents.id = public.campaigns.talent_id
      and public.talents.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.talents
    where public.talents.id = public.campaigns.talent_id
      and public.talents.profile_id = auth.uid()
  )
);
