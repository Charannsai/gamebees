-- GameBees: coupons + grouped checkout support
-- Run this migration in Supabase SQL Editor before using promo codes/cart checkout.

create extension if not exists pgcrypto;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order_amount numeric(12,2) not null default 0,
  max_discount_amount numeric(12,2),
  usage_limit integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coupons_code_idx on public.coupons (upper(code));
create index if not exists coupons_active_idx on public.coupons (is_active, expires_at);

alter table public.bookings add column if not exists order_id uuid;
alter table public.bookings add column if not exists subtotal_price numeric(12,2);
alter table public.bookings add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.bookings add column if not exists coupon_code text;

create index if not exists bookings_order_id_idx on public.bookings (order_id);

-- Keep this table usable by the server-side Supabase service role. If you use
-- stricter RLS policies elsewhere, preserve those policies and grant access
-- only through your existing server-side admin actions.


-- Refresh PostgREST's schema cache immediately after the migration.
notify pgrst, 'reload schema';


-- Landing page "Pick Your Choice" editable gear options
create table if not exists public.landing_gear_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0 check (price >= 0),
  image_url text,
  description text,
  required boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists landing_gear_active_idx on public.landing_gear_options (is_active, sort_order);
alter table public.landing_gear_options enable row level security;

insert into public.landing_gear_options (name, price, image_url, description, required, sort_order)
select * from (values
  ('PlayStation 5 Pro Console', 12::numeric, '/ps5.png', 'PlayStation 5 Pro console rental.', true, 1),
  ('Extra DualSense Controller', 3::numeric, '/controller.png', 'Add an extra DualSense controller.', false, 2),
  ('Pulse 3D Wireless Headset', 2::numeric, '/controller.png', 'Wireless gaming headset for immersive audio.', false, 3),
  ('Premium Travel Case', 1::numeric, '/ps5.png', 'Protective travel case for your gaming setup.', false, 4)
) as seed(name, price, image_url, description, required, sort_order)
where not exists (select 1 from public.landing_gear_options);

-- Delivery/pickup is a single ₹100 order fee.
alter table public.bookings add column if not exists delivery_fee numeric(12,2) not null default 100;

notify pgrst, 'reload schema';


-- Editable long-rental discount settings shown in Admin > Promo Codes
create table if not exists public.rental_discount_settings (
  days integer primary key,
  discount_percent numeric(5,2) not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  updated_at timestamptz not null default now()
);

alter table public.rental_discount_settings enable row level security;
insert into public.rental_discount_settings (days, discount_percent) values
  (14, 10), (30, 20)
on conflict (days) do nothing;

notify pgrst, 'reload schema';


-- RLS policies for GameBees admin-managed tables.
-- Admin server actions normally use the service-role key, but these policies
-- also protect the tables when accessed with an authenticated client.
alter table public.coupons enable row level security;
alter table public.landing_gear_options enable row level security;
alter table public.rental_discount_settings enable row level security;

drop policy if exists "admin manage coupons" on public.coupons;
create policy "admin manage coupons" on public.coupons
  for all to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or (auth.jwt() ->> 'email') = 'gamebeesofficial@gmail.com')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or (auth.jwt() ->> 'email') = 'gamebeesofficial@gmail.com');

drop policy if exists "public read active landing gear" on public.landing_gear_options;
create policy "public read active landing gear" on public.landing_gear_options
  for select to anon, authenticated using (is_active = true);

drop policy if exists "admin manage landing gear" on public.landing_gear_options;
create policy "admin manage landing gear" on public.landing_gear_options
  for all to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or (auth.jwt() ->> 'email') = 'gamebeesofficial@gmail.com')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or (auth.jwt() ->> 'email') = 'gamebeesofficial@gmail.com');

drop policy if exists "public read rental discounts" on public.rental_discount_settings;
create policy "public read rental discounts" on public.rental_discount_settings
  for select to anon, authenticated using (true);

drop policy if exists "admin manage rental discounts" on public.rental_discount_settings;
create policy "admin manage rental discounts" on public.rental_discount_settings
  for all to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or (auth.jwt() ->> 'email') = 'gamebeesofficial@gmail.com')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or (auth.jwt() ->> 'email') = 'gamebeesofficial@gmail.com');

notify pgrst, 'reload schema';
