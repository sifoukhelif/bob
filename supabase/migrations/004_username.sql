-- ============================================================
-- DEGITALE — إضافة اسم مستخدم (username) لكل حساب
-- يُشغَّل بعد 001_schema.sql, 002_rls.sql, 003_storage.sql
-- ============================================================

-- تفعيل امتداد citext لمقارنة النصوص بدون حساسية للحالة (Case-insensitive)
CREATE EXTENSION IF NOT EXISTS citext;

-- إضافة العمود بنوع citext لضمان أن "Sif Khelif" و "sif khelif" يُعتبران نفس الاسم
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username citext UNIQUE;

-- توليد اسم مستخدم تلقائي من الجزء الأول من البريد + رقم عشوائي لمنع التكرار
CREATE OR REPLACE FUNCTION generate_username(p_email text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE base text; final_username text; counter int := 0;
BEGIN
  base := lower(regexp_replace(split_part(COALESCE(p_email,'user'), '@', 1), '[^a-z0-9]', '', 'g'));
  base := substr(COALESCE(NULLIF(base,''),'user'), 1, 20);
  final_username := base;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base || counter::text;
  END LOOP;
  RETURN final_username;
END; $$;

-- تحديث الدالة التي تُنشئ صف المستخدم الجديد لتوليد username تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url',
          generate_username(NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

-- تعبئة username للحسابات الموجودة مسبقاً (التي أُنشئت قبل هذا التحديث)
UPDATE public.users SET username = generate_username(email) WHERE username IS NULL;
