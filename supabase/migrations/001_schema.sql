-- ============================================================
-- DEGITALE — Complete Database Schema
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ BEGIN CREATE TYPE listing_type   AS ENUM ('product','service'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE listing_status AS ENUM ('draft','pending_review','active','paused','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status   AS ENUM ('pending','paid','completed','refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_role      AS ENUM ('buyer','seller','admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text, full_name text, avatar_url text,
  role user_role NOT NULL DEFAULT 'buyer',
  is_banned boolean NOT NULL DEFAULT false,
  banned_reason text, stripe_account_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL, slug text NOT NULL UNIQUE, bio text, banner_url text,
  rating_avg numeric(3,2), rating_count integer NOT NULL DEFAULT 0,
  sales_count integer NOT NULL DEFAULT 0,
  stripe_verified boolean DEFAULT false, badges text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL, name text NOT NULL, name_ar text,
  parent_id uuid REFERENCES public.categories(id),
  type listing_type, position smallint DEFAULT 0, is_active boolean DEFAULT true
);

INSERT INTO public.categories (slug, name, name_ar, type, position) VALUES
  ('ui-ux-kits','UI / UX Kits','واجهات UI','product',1),
  ('ebooks','E-books','كتب إلكترونية','product',2),
  ('code-scripts','Code & Scripts','أكواد','product',3),
  ('web-development','Web Development','تطوير ويب','service',10),
  ('ui-ux-design','UI / UX Design','تصميم','service',11),
  ('consulting','Consulting','استشارات','service',12)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  type listing_type NOT NULL DEFAULT 'product',
  status listing_status NOT NULL DEFAULT 'pending_review',
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 100),
  slug text UNIQUE NOT NULL, description text,
  tags text[] DEFAULT '{}', category_id uuid REFERENCES public.categories(id),
  base_price numeric(10,2), compare_price numeric(10,2),
  currency char(3) NOT NULL DEFAULT 'USD',
  thumbnail_url text, gallery_urls text[] DEFAULT '{}',
  sales_count integer NOT NULL DEFAULT 0, view_count integer NOT NULL DEFAULT 0,
  rating_avg numeric(3,2), rating_count integer NOT NULL DEFAULT 0,
  limit_downloads integer, delivery_days smallint,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz
);

CREATE OR REPLACE FUNCTION generate_listing_slug() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE base_slug text; final_slug text; counter int := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.title,'[^a-zA-Z0-9\s]','','g'));
  base_slug := trim(regexp_replace(base_slug,'\s+','-','g'));
  base_slug := substr(COALESCE(base_slug,'product'), 1, 60);
  IF base_slug = '' THEN base_slug := 'product'; END IF;
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM listings WHERE slug = final_slug AND id != COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1; final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug; RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_listing_slug ON listings;
CREATE TRIGGER trg_listing_slug BEFORE INSERT OR UPDATE OF title ON listings FOR EACH ROW EXECUTE FUNCTION generate_listing_slug();

CREATE TABLE IF NOT EXISTS public.listing_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path text NOT NULL, original_name text NOT NULL,
  file_size_bytes bigint, mime_type text, version smallint DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id uuid NOT NULL REFERENCES public.users(id),
  total_amount numeric(10,2) NOT NULL, currency char(3) DEFAULT 'USD',
  status order_status NOT NULL DEFAULT 'pending',
  stripe_session_id text UNIQUE, stripe_payment_intent text,
  paid_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id),
  unit_price numeric(10,2), download_token text,
  token_expires_at timestamptz, download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id uuid NOT NULL REFERENCES public.users(id),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text, is_verified boolean DEFAULT false, helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(), UNIQUE (reviewer_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY, value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id), updated_at timestamptz DEFAULT now()
);

INSERT INTO platform_settings (key, value) VALUES
  ('platform_fee_percent','20'),('allow_new_sellers','true'),
  ('maintenance_mode','false'),('max_file_size_mb','500')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL, target_type text, target_id uuid,
  metadata jsonb DEFAULT '{}', created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.download_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id uuid REFERENCES order_items(id),
  ip_address text, downloaded_at timestamptz DEFAULT now()
);
