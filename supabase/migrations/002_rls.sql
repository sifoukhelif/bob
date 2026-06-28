-- ============================================================
-- DEGITALE — Row Level Security Policies
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own"    ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own"    ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_all_users"     ON public.users FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- ── STORES ───────────────────────────────────────────────────
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_public_read"  ON public.stores FOR SELECT USING (true);
CREATE POLICY "stores_owner_write"  ON public.stores FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "admin_all_stores"    ON public.stores FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- ── LISTINGS ─────────────────────────────────────────────────
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_active_read" ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "listings_seller_all"  ON public.listings FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "admin_all_listings"   ON public.listings FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- ── ORDERS ───────────────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_buyer_read"   ON public.orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "admin_all_orders"    ON public.orders FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- ── ORDER ITEMS ───────────────────────────────────────────────
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_buyer_read"    ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid()));
CREATE POLICY "admin_all_items"     ON public.order_items FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- ── REVIEWS ──────────────────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_insert" ON public.reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "reviews_own_update"  ON public.reviews FOR UPDATE USING (reviewer_id = auth.uid());

-- ── PLATFORM SETTINGS ─────────────────────────────────────────
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read"  ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write"  ON public.platform_settings FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- ── ADMIN LOGS ────────────────────────────────────────────────
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_admin_only"     ON public.admin_logs FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- ── LISTING FILES ─────────────────────────────────────────────
ALTER TABLE public.listing_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "files_seller_manage" ON public.listing_files FOR ALL
  USING (listing_id IN (
    SELECT l.id FROM listings l
    JOIN stores s ON s.id = l.store_id WHERE s.owner_id = auth.uid()
  ));
CREATE POLICY "files_buyer_after_purchase" ON public.listing_files FOR SELECT
  USING (listing_id IN (
    SELECT oi.listing_id FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.buyer_id = auth.uid() AND o.status IN ('paid','completed')
  ));

-- ── HELPER: ترقية مستخدم لأدمن ─────────────────────────────
-- غيّر YOUR_EMAIL لإيميلك الحقيقي وشغّل هذا مرة واحدة
/*
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = 'YOUR_EMAIL';

UPDATE public.users SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');
*/

-- ── HELPER: RPC لإنشاء الطلب بعد الدفع ────────────────────
CREATE OR REPLACE FUNCTION create_order_from_webhook(
  p_buyer_id uuid, p_listing_id uuid, p_amount numeric,
  p_currency text, p_stripe_session text, p_stripe_intent text
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_order_id uuid; v_item_id uuid;
BEGIN
  INSERT INTO orders (buyer_id, total_amount, currency, status, stripe_session_id, stripe_payment_intent, paid_at)
  VALUES (p_buyer_id, p_amount, p_currency, 'paid', p_stripe_session, p_stripe_intent, now())
  RETURNING id INTO v_order_id;
  INSERT INTO order_items (order_id, listing_id, unit_price)
  VALUES (v_order_id, p_listing_id, p_amount) RETURNING id INTO v_item_id;
  UPDATE listings SET sales_count = sales_count + 1 WHERE id = p_listing_id;
  RETURN json_build_object('order_id', v_order_id, 'order_item_id', v_item_id);
END; $$;

-- ── HELPER: promote_buyer_to_seller ───────────────────────────
CREATE OR REPLACE FUNCTION promote_buyer_to_seller(
  p_user_id uuid, p_store_name text, p_store_slug text, p_bio text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role":"seller"}'::jsonb
  WHERE id = p_user_id;
  INSERT INTO public.stores (owner_id, name, slug, bio)
  VALUES (p_user_id, p_store_name, p_store_slug, p_bio)
  ON CONFLICT (owner_id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;
  UPDATE public.users SET role = 'seller' WHERE id = p_user_id;
END; $$;
