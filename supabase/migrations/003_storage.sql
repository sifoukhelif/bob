-- ============================================================
-- DEGITALE — Storage bucket + policies for digital product files
-- يُشغَّل بعد 001_schema.sql و 002_rls.sql
-- ============================================================

-- إنشاء الـ bucket (private) إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-files', 'listing-files', false)
ON CONFLICT (id) DO NOTHING;

-- البائع يرفع/يدير ملفات منتجاته الخاصة فقط
-- المسار المتوقع: {seller_user_id}/{listing_id}/{filename}
CREATE POLICY "sellers_upload_own_files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "sellers_manage_own_files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'listing-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "sellers_delete_own_files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'listing-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- لا سياسة SELECT عامة هنا عمداً: التحميل يتم فقط عبر روابط
-- موقّعة (signed URLs) يولّدها السيرفر بصلاحية الـ service role
-- في /api/webhooks/stripe و /api/checkout، بعد التحقق من الشراء.
