-- =============================================================
-- Bagify E-Commerce — Row Level Security Policies
-- Migration: 20260526000002_rls_policies.sql
-- =============================================================
-- Enable RLS on every table. Default-deny. Grant minimum needed.
--
-- Policy naming convention:
--   "<table>_<role>_<action>"   e.g. "profiles_owner_select"
-- =============================================================


-- =============================================================
-- ENABLE RLS
-- =============================================================

alter table public.profiles          enable row level security;
alter table public.addresses         enable row level security;
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.product_images    enable row level security;
alter table public.product_variants  enable row level security;
alter table public.carts             enable row level security;
alter table public.cart_items        enable row level security;
alter table public.wishlists         enable row level security;
alter table public.wishlist_items    enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.reviews           enable row level security;


-- =============================================================
-- HELPER: is_admin() — avoids auth.uid() look-up repetition
-- =============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- =============================================================
-- profiles
-- =============================================================

-- Users can only see their own profile; admins can see all
create policy "profiles_owner_select"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Users update only their own profile
create policy "profiles_owner_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Inserts are handled by the handle_new_user() trigger only
-- (service role context) — no direct insert policy needed for users


-- =============================================================
-- addresses
-- =============================================================

create policy "addresses_owner_select"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "addresses_owner_insert"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "addresses_owner_update"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "addresses_owner_delete"
  on public.addresses for delete
  using (auth.uid() = user_id);


-- =============================================================
-- categories — public read, admin write
-- =============================================================

create policy "categories_public_select"
  on public.categories for select
  using (is_active = true or public.is_admin());

create policy "categories_admin_insert"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories_admin_update"
  on public.categories for update
  using (public.is_admin());

create policy "categories_admin_delete"
  on public.categories for delete
  using (public.is_admin());


-- =============================================================
-- products — public read (active only), admin write
-- =============================================================

create policy "products_public_select"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "products_admin_insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  using (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  using (public.is_admin());


-- =============================================================
-- product_images — public read, admin write
-- =============================================================

create policy "product_images_public_select"
  on public.product_images for select
  using (true);  -- Anyone can see product images

create policy "product_images_admin_insert"
  on public.product_images for insert
  with check (public.is_admin());

create policy "product_images_admin_update"
  on public.product_images for update
  using (public.is_admin());

create policy "product_images_admin_delete"
  on public.product_images for delete
  using (public.is_admin());


-- =============================================================
-- product_variants — public read (active), admin write
-- =============================================================

create policy "product_variants_public_select"
  on public.product_variants for select
  using (is_active = true or public.is_admin());

create policy "product_variants_admin_insert"
  on public.product_variants for insert
  with check (public.is_admin());

create policy "product_variants_admin_update"
  on public.product_variants for update
  using (public.is_admin());

create policy "product_variants_admin_delete"
  on public.product_variants for delete
  using (public.is_admin());


-- =============================================================
-- carts — owners only
-- =============================================================

create policy "carts_owner_select"
  on public.carts for select
  using (auth.uid() = user_id);

create policy "carts_owner_insert"
  on public.carts for insert
  with check (auth.uid() = user_id);

create policy "carts_owner_update"
  on public.carts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "carts_owner_delete"
  on public.carts for delete
  using (auth.uid() = user_id);


-- =============================================================
-- cart_items — owners only (via cart join)
-- =============================================================

create policy "cart_items_owner_select"
  on public.cart_items for select
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "cart_items_owner_insert"
  on public.cart_items for insert
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "cart_items_owner_update"
  on public.cart_items for update
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "cart_items_owner_delete"
  on public.cart_items for delete
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );


-- =============================================================
-- wishlists — owners can manage; public read if is_public
-- =============================================================

create policy "wishlists_public_select"
  on public.wishlists for select
  using (is_public = true or auth.uid() = user_id);

create policy "wishlists_owner_insert"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

create policy "wishlists_owner_update"
  on public.wishlists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "wishlists_owner_delete"
  on public.wishlists for delete
  using (auth.uid() = user_id);


-- =============================================================
-- wishlist_items
-- =============================================================

create policy "wishlist_items_select"
  on public.wishlist_items for select
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = wishlist_items.wishlist_id
        and (wishlists.is_public = true or wishlists.user_id = auth.uid())
    )
  );

create policy "wishlist_items_owner_insert"
  on public.wishlist_items for insert
  with check (
    exists (
      select 1 from public.wishlists
      where wishlists.id = wishlist_items.wishlist_id
        and wishlists.user_id = auth.uid()
    )
  );

create policy "wishlist_items_owner_delete"
  on public.wishlist_items for delete
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = wishlist_items.wishlist_id
        and wishlists.user_id = auth.uid()
    )
  );


-- =============================================================
-- orders — owners can view; admins can view + manage all
-- =============================================================

create policy "orders_owner_select"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- Orders are created server-side (service role) via server actions.
-- Customers cannot INSERT orders directly.
create policy "orders_admin_insert"
  on public.orders for insert
  with check (public.is_admin());

create policy "orders_admin_update"
  on public.orders for update
  using (public.is_admin());

-- Orders are never hard-deleted
-- No delete policy — use status = 'cancelled' instead


-- =============================================================
-- order_items — owners can view via order join
-- =============================================================

create policy "order_items_owner_select"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "order_items_admin_insert"
  on public.order_items for insert
  with check (public.is_admin());


-- =============================================================
-- reviews — approved reviews are public; owners manage own
-- =============================================================

create policy "reviews_approved_select"
  on public.reviews for select
  using (is_approved = true or auth.uid() = user_id or public.is_admin());

create policy "reviews_owner_insert"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_owner_update"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and is_approved = false);  -- Cannot edit after approval

create policy "reviews_owner_delete"
  on public.reviews for delete
  using (auth.uid() = user_id or public.is_admin());
