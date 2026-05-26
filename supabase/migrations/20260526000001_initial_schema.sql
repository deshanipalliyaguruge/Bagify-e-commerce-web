-- =============================================================
-- Bagify E-Commerce — Initial Database Schema
-- Migration: 20260526000001_initial_schema.sql
-- =============================================================
-- Run order matters: enums → tables (no FK) → tables (with FK)
--                  → triggers → views → indexes
-- =============================================================


-- =============================================================
-- EXTENSIONS
-- =============================================================

create extension if not exists "uuid-ossp";       -- uuid_generate_v4()
create extension if not exists "pg_trgm";          -- trigram indexes for full-text search


-- =============================================================
-- ENUMS
-- =============================================================

create type public.user_role as enum ('customer', 'admin');

create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.payment_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded'
);

create type public.payment_method as enum (
  'card',
  'paypal',
  'bank_transfer',
  'cash_on_delivery'
);


-- =============================================================
-- HELPER: updated_at trigger function
-- =============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =============================================================
-- TABLE: profiles
-- =============================================================
-- Extends auth.users (one-to-one). Created automatically via
-- handle_new_user() trigger when a user signs up.
-- =============================================================

create table public.profiles (
  id              uuid        primary key references auth.users (id) on delete cascade,
  email           text        not null unique,
  full_name       text,
  avatar_url      text,
  phone           text,
  role            public.user_role not null default 'customer',
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.profiles is
  'Public user profile extending auth.users. One-to-one via auth.users.id.';

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================
-- TABLE: addresses
-- =============================================================

create table public.addresses (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles (id) on delete cascade,
  label           text        not null default 'Home',   -- e.g. "Home", "Office"
  full_name       text        not null,
  phone           text,
  line1           text        not null,
  line2           text,
  city            text        not null,
  state           text        not null,
  postal_code     text        not null,
  country         text        not null default 'US',
  is_default      boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.addresses is
  'User shipping/billing addresses. One user may have many addresses.';

create trigger addresses_updated_at
  before update on public.addresses
  for each row execute function public.handle_updated_at();


-- =============================================================
-- TABLE: categories
-- =============================================================
-- Self-referential: supports unlimited depth (Bags > Totes > Mini Totes)
-- =============================================================

create table public.categories (
  id              uuid        primary key default gen_random_uuid(),
  parent_id       uuid        references public.categories (id) on delete set null,
  name            text        not null,
  slug            text        not null unique,
  description     text,
  image_url       text,
  display_order   integer     not null default 0,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Prevent circular references at DB level (parent ≠ self)
  constraint categories_no_self_ref check (id <> parent_id)
);

comment on table public.categories is
  'Product categories. Self-referential via parent_id for unlimited hierarchy depth.';

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();


-- =============================================================
-- TABLE: products
-- =============================================================

create table public.products (
  id              uuid        primary key default gen_random_uuid(),
  category_id     uuid        references public.categories (id) on delete set null,
  name            text        not null,
  slug            text        not null unique,
  description     text,
  short_description text,

  -- Pricing (stored in smallest currency unit, e.g. cents)
  price           integer     not null check (price >= 0),
  compare_at_price integer     check (compare_at_price >= 0),  -- "was" price for sale display

  -- Inventory
  sku             text        unique,
  stock_quantity  integer     not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5,

  -- SEO & discovery
  tags            text[]      not null default '{}',
  is_featured     boolean     not null default false,
  is_active       boolean     not null default true,

  -- Aggregated review stats (denormalized for performance, updated via trigger)
  review_count    integer     not null default 0 check (review_count >= 0),
  average_rating  numeric(3,2) check (average_rating between 0 and 5),

  -- Metadata
  weight_grams    integer     check (weight_grams > 0),
  meta_title      text,
  meta_description text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.products is
  'Core product catalog. price stored in cents to avoid floating-point errors.';
comment on column public.products.price is
  'Price in smallest currency unit (cents). Divide by 100 for display.';
comment on column public.products.compare_at_price is
  'Original/strikethrough price for sale products. NULL means not on sale.';

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();


-- =============================================================
-- TABLE: product_images
-- =============================================================

create table public.product_images (
  id              uuid        primary key default gen_random_uuid(),
  product_id      uuid        not null references public.products (id) on delete cascade,
  storage_path    text        not null,   -- Supabase Storage object path
  alt_text        text,
  display_order   integer     not null default 0,
  is_primary      boolean     not null default false,
  created_at      timestamptz not null default now()
);

comment on table public.product_images is
  'Product images stored in Supabase Storage. storage_path is the object key within the bucket.';
comment on column public.product_images.storage_path is
  'Supabase Storage object path, e.g. "products/abc123/main.webp". Use getStorageUrl() to build full URL.';

-- Enforce only one primary image per product
create unique index product_images_primary_unique
  on public.product_images (product_id)
  where is_primary = true;


-- =============================================================
-- TABLE: product_variants
-- =============================================================
-- e.g. "Size: Medium", "Color: Black"
-- Each variant has its own stock and optional price override.
-- =============================================================

create table public.product_variants (
  id              uuid        primary key default gen_random_uuid(),
  product_id      uuid        not null references public.products (id) on delete cascade,
  name            text        not null,   -- e.g. "Color"
  value           text        not null,   -- e.g. "Black"
  sku             text        unique,
  price_override  integer     check (price_override >= 0),  -- NULL = use product.price
  stock_quantity  integer     not null default 0 check (stock_quantity >= 0),
  display_order   integer     not null default 0,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint product_variants_unique_name_value unique (product_id, name, value)
);

comment on table public.product_variants is
  'Product variations (size, color, etc). price_override is NULL if same as parent product.';

create trigger product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.handle_updated_at();


-- =============================================================
-- TABLE: carts
-- =============================================================
-- One cart per user (authenticated) or per session (guest).
-- Guest carts are identified by session_id and merged on login.
-- =============================================================

create table public.carts (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        references public.profiles (id) on delete cascade,
  session_id      text,   -- For guest carts; set to NULL after merging on login
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- At least one of user_id or session_id must be present
  constraint carts_has_owner check (
    user_id is not null or session_id is not null
  ),
  -- One active cart per authenticated user
  constraint carts_user_unique unique (user_id)
);

comment on table public.carts is
  'Shopping cart. Supports both authenticated (user_id) and guest (session_id) carts.';

create trigger carts_updated_at
  before update on public.carts
  for each row execute function public.handle_updated_at();


-- =============================================================
-- TABLE: cart_items
-- =============================================================

create table public.cart_items (
  id              uuid        primary key default gen_random_uuid(),
  cart_id         uuid        not null references public.carts (id) on delete cascade,
  product_id      uuid        not null references public.products (id) on delete cascade,
  variant_id      uuid        references public.product_variants (id) on delete set null,
  quantity        integer     not null default 1 check (quantity > 0),
  -- Snapshot price at time of add (prevents cart price drift)
  unit_price      integer     not null check (unit_price >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- One row per product+variant combo per cart
  constraint cart_items_unique_item unique (cart_id, product_id, variant_id)
);

comment on table public.cart_items is
  'Line items in a cart. unit_price is snapshotted at add-time to prevent price drift.';

create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();


-- =============================================================
-- TABLE: wishlists
-- =============================================================

create table public.wishlists (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles (id) on delete cascade,
  name            text        not null default 'My Wishlist',
  is_public       boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.wishlists is
  'User wishlists. One user can have multiple named wishlists.';

create trigger wishlists_updated_at
  before update on public.wishlists
  for each row execute function public.handle_updated_at();


-- =============================================================
-- TABLE: wishlist_items
-- =============================================================

create table public.wishlist_items (
  id              uuid        primary key default gen_random_uuid(),
  wishlist_id     uuid        not null references public.wishlists (id) on delete cascade,
  product_id      uuid        not null references public.products (id) on delete cascade,
  added_at        timestamptz not null default now(),

  constraint wishlist_items_unique unique (wishlist_id, product_id)
);

comment on table public.wishlist_items is
  'Products saved in a wishlist. Duplicate product per wishlist is prevented.';


-- =============================================================
-- TABLE: orders
-- =============================================================

create table public.orders (
  id              uuid            primary key default gen_random_uuid(),
  user_id         uuid            not null references public.profiles (id) on delete restrict,
  order_number    text            not null unique,  -- Human-readable, e.g. "BG-00001234"

  -- Status
  status          public.order_status    not null default 'pending',
  payment_status  public.payment_status  not null default 'pending',
  payment_method  public.payment_method,

  -- Financials (all in cents)
  subtotal        integer         not null check (subtotal >= 0),
  discount_amount integer         not null default 0 check (discount_amount >= 0),
  shipping_amount integer         not null default 0 check (shipping_amount >= 0),
  tax_amount      integer         not null default 0 check (tax_amount >= 0),
  total_amount    integer         not null check (total_amount >= 0),

  -- Shipping address (snapshot at order time — not a FK)
  shipping_name      text         not null,
  shipping_line1     text         not null,
  shipping_line2     text,
  shipping_city      text         not null,
  shipping_state     text         not null,
  shipping_postal    text         not null,
  shipping_country   text         not null,
  shipping_phone     text,

  -- Fulfilment
  tracking_number    text,
  shipped_at         timestamptz,
  delivered_at       timestamptz,
  cancelled_at       timestamptz,
  cancel_reason      text,

  -- Notes
  customer_notes     text,

  created_at      timestamptz     not null default now(),
  updated_at      timestamptz     not null default now()
);

comment on table public.orders is
  'Order header. Shipping address is snapshotted (not FK) so address changes do not affect historical orders.';
comment on column public.orders.order_number is
  'Human-readable order ID, e.g. BG-00001234. Generated by application layer.';
comment on column public.orders.subtotal is
  'Sum of all order_items.unit_price * quantity, before discounts/shipping/tax. In cents.';

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();


-- =============================================================
-- TABLE: order_items
-- =============================================================

create table public.order_items (
  id              uuid        primary key default gen_random_uuid(),
  order_id        uuid        not null references public.orders (id) on delete cascade,
  product_id      uuid        not null references public.products (id) on delete restrict,
  variant_id      uuid        references public.product_variants (id) on delete set null,

  -- Snapshot fields — product details at time of purchase
  product_name    text        not null,
  variant_name    text,
  variant_value   text,
  product_image   text,       -- Supabase Storage path
  sku             text,

  -- Financials (in cents)
  unit_price      integer     not null check (unit_price >= 0),
  quantity        integer     not null check (quantity > 0),
  total_price     integer     not null check (total_price >= 0),  -- unit_price * quantity

  created_at      timestamptz not null default now()
);

comment on table public.order_items is
  'Order line items. All product fields are snapshotted so product changes do not affect order history.';

-- Enforce total_price integrity
create or replace function public.check_order_item_total()
returns trigger
language plpgsql
as $$
begin
  if new.total_price <> new.unit_price * new.quantity then
    raise exception 'order_items.total_price must equal unit_price * quantity';
  end if;
  return new;
end;
$$;

create trigger order_items_check_total
  before insert or update on public.order_items
  for each row execute function public.check_order_item_total();


-- =============================================================
-- TABLE: reviews
-- =============================================================

create table public.reviews (
  id              uuid        primary key default gen_random_uuid(),
  product_id      uuid        not null references public.products (id) on delete cascade,
  user_id         uuid        not null references public.profiles (id) on delete cascade,
  order_id        uuid        references public.orders (id) on delete set null,  -- Optional: verify purchase

  rating          smallint    not null check (rating between 1 and 5),
  title           text,
  body            text,
  is_verified_purchase boolean not null default false,
  is_approved     boolean     not null default false,  -- Admin moderation
  helpful_count   integer     not null default 0 check (helpful_count >= 0),

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- One review per user per product
  constraint reviews_user_product_unique unique (user_id, product_id)
);

comment on table public.reviews is
  'Product reviews. is_approved = false means pending moderation. One review per user per product.';

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();

-- Trigger: keep products.review_count and products.average_rating in sync
create or replace function public.update_product_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
begin
  -- Use new.product_id on insert/update, old.product_id on delete
  v_product_id := coalesce(new.product_id, old.product_id);

  update public.products
  set
    review_count   = (select count(*) from public.reviews where product_id = v_product_id and is_approved = true),
    average_rating = (select avg(rating) from public.reviews where product_id = v_product_id and is_approved = true),
    updated_at     = now()
  where id = v_product_id;

  return coalesce(new, old);
end;
$$;

create trigger reviews_sync_product_rating
  after insert or update or delete on public.reviews
  for each row execute function public.update_product_rating();


-- =============================================================
-- VIEW: products_with_primary_image
-- =============================================================

create view public.products_with_primary_image as
select
  p.*,
  pi.storage_path  as primary_image_path,
  pi.alt_text      as primary_image_alt
from public.products p
left join public.product_images pi
  on pi.product_id = p.id and pi.is_primary = true;

comment on view public.products_with_primary_image is
  'Products joined with their primary image. Use for listing pages.';


-- =============================================================
-- INDEXES
-- =============================================================

-- profiles
create index idx_profiles_role        on public.profiles (role);

-- categories
create index idx_categories_parent    on public.categories (parent_id);
create index idx_categories_slug      on public.categories (slug);
create index idx_categories_active    on public.categories (is_active) where is_active = true;

-- products — most frequently queried columns
create index idx_products_category    on public.products (category_id);
create index idx_products_slug        on public.products (slug);
create index idx_products_active      on public.products (is_active) where is_active = true;
create index idx_products_featured    on public.products (is_featured) where is_featured = true;
create index idx_products_price       on public.products (price);
create index idx_products_rating      on public.products (average_rating desc nulls last);
create index idx_products_created     on public.products (created_at desc);
create index idx_products_stock       on public.products (stock_quantity) where stock_quantity > 0;

-- Full-text search on products
create index idx_products_fts
  on public.products
  using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Trigram index for ILIKE search on product name
create index idx_products_name_trgm
  on public.products
  using gin (name gin_trgm_ops);

-- Tags array index (for @> queries)
create index idx_products_tags        on public.products using gin (tags);

-- product_images
create index idx_product_images_product  on public.product_images (product_id, display_order);

-- product_variants
create index idx_variants_product     on public.product_variants (product_id);
create index idx_variants_active      on public.product_variants (product_id, is_active) where is_active = true;

-- carts
create index idx_carts_user           on public.carts (user_id);
create index idx_carts_session        on public.carts (session_id) where session_id is not null;

-- cart_items
create index idx_cart_items_cart      on public.cart_items (cart_id);
create index idx_cart_items_product   on public.cart_items (product_id);

-- wishlists
create index idx_wishlists_user       on public.wishlists (user_id);

-- wishlist_items
create index idx_wishlist_items_list     on public.wishlist_items (wishlist_id);
create index idx_wishlist_items_product  on public.wishlist_items (product_id);

-- orders
create index idx_orders_user          on public.orders (user_id);
create index idx_orders_status        on public.orders (status);
create index idx_orders_payment       on public.orders (payment_status);
create index idx_orders_number        on public.orders (order_number);
create index idx_orders_created       on public.orders (created_at desc);

-- order_items
create index idx_order_items_order    on public.order_items (order_id);
create index idx_order_items_product  on public.order_items (product_id);

-- reviews
create index idx_reviews_product      on public.reviews (product_id);
create index idx_reviews_user         on public.reviews (user_id);
create index idx_reviews_approved     on public.reviews (product_id, is_approved) where is_approved = true;
create index idx_reviews_rating       on public.reviews (rating);

-- addresses
create index idx_addresses_user       on public.addresses (user_id);
create index idx_addresses_default    on public.addresses (user_id, is_default) where is_default = true;
