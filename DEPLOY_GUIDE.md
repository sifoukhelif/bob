# DEGITALE — دليل الرفع والتشغيل الكامل

> ⚠️ **تحديث:** هذه النسخة تتضمن الآن `package.json` جاهزاً (Next.js 16، React 19). إذا كان لديك مشروع قائم بالفعل، تحقق من توافق نسخك قبل النسخ فوقه.

## 1. تنصيب المشروع محلياً

```bash
# استنسخ مشروعك أو ابدأ مشروع جديد
git clone https://github.com/YOUR_USERNAME/degitale-project.git
cd degitale-project

# انسخ الملفات الجديدة فوق الموجودة (تتضمن الآن package.json أيضاً)
cp -r /path/to/degitale-final/* .

# تنصيب المكتبات (موجودة بالفعل في package.json المرفق)
npm install

# إنشاء ملف البيئة
cp .env.local.example .env.local
# افتح .env.local واملأ القيم الحقيقية
```

## 2. إعداد Supabase

### أ. تشغيل SQL
1. اذهب إلى supabase.com → مشروعك → SQL Editor
2. شغّل `supabase/migrations/001_schema.sql` أولاً
3. ثم شغّل `supabase/migrations/002_rls.sql`
4. ثم شغّل `supabase/migrations/003_storage.sql` (ينشئ bucket الملفات وصلاحياته تلقائياً — لا حاجة لإنشائه يدوياً من الواجهة بعد الآن)
5. ثم شغّل `supabase/migrations/004_username.sql` (يضيف عمود اسم المستخدم، ويولّد اسماً تلقائياً لكل الحسابات الموجودة مسبقاً)

### ب. ترقية حسابك لأدمن
```sql
-- في SQL Editor — غيّر YOUR_EMAIL لإيميلك
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = 'YOUR_EMAIL';

UPDATE public.users SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');
```

ثم سجّل خروجاً ودخولاً مرة أخرى (أو زر أي صفحة جديدة) ليتحدّث الـ JWT بصلاحية الأدمن.

### ج. التحقق من Storage Bucket
الخطوة 4 أعلاه (تشغيل `003_storage.sql`) أنشأت bucket باسم `listing-files` بصلاحية **Private** تلقائياً، مع صلاحيات تسمح للبائع برفع/تعديل/حذف ملفات منتجاته الخاصة فقط (حسب مساره: `{seller_user_id}/{listing_id}/{filename}`).
تحقق من ظهوره في Supabase → Storage.

## 3. اختبار Stripe Webhooks محلياً

```bash
# تنصيب Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# أو للويندوز: https://stripe.com/docs/stripe-cli

# تسجيل الدخول
stripe login

# في terminal منفصل — شغّل المشروع محلياً
npm run dev

# forward الأحداث لـ localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# ستحصل على webhook signing secret — انسخه لـ .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...

# اختبار بحدث وهمي
stripe trigger checkout.session.completed
```

## 4. رفع على Vercel

```bash
# تأكد أن كل شيء يعمل محلياً
npm run build

# رفع التغييرات على GitHub
git add -A
git commit -m "feat: complete DEGITALE platform with admin dashboard"
git push origin main

# Vercel سيبني تلقائياً من GitHub
```

### متغيرات البيئة في Vercel:
1. vercel.com → مشروعك → Settings → Environment Variables
2. أضف كل متغير من `.env.local.example` بقيمه الحقيقية

| المتغير | من أين تحصل عليه |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (سري) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → endpoint secret |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NEXT_PUBLIC_APP_URL` | رابط موقعك على Vercel |

### إضافة Stripe Webhook في Production:
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://YOUR_DOMAIN.vercel.app/api/webhooks/stripe`
3. Events: `checkout.session.completed`
4. انسخ الـ Signing secret → أضفه لـ Vercel env vars

## 5. التحقق النهائي

```bash
# فحص TypeScript
npx tsc --noEmit

# فحص الـ Build
npm run build
```

### ملاحظة: `middleware.ts` أصبح `proxy.ts`
في Next.js 16، تم استبدال `middleware.ts` بـ `proxy.ts` (نفس الوظيفة، اسم أوضح لحدود الشبكة). الملف المرفق هنا بالاسم الجديد مباشرة، فلا حاجة لأي تعديل من جهتك.

### مسارات يجب اختبارها يدوياً بعد الرفع:
1. **تسجيل/دخول:** `/login` → أنشئ حساباً جديداً، تأكد أن الصفحة لا تعلّق على "جارٍ التحميل" (كانت هذه مشكلة فعلية تم إصلاحها — السبب كان غياب `Suspense` حول `useSearchParams`).
2. **البيع:** `/sell` → فعّل حساب البائع → أضف منتجاً من `/dashboard/new` → تأكد أنه يظهر "بانتظار المراجعة".
3. **مراجعة الأدمن:** سجّل دخول كأدمن → `/admin/products` → اقبل المنتج → تأكد أنه يظهر في `/shop`.
4. **الشراء:** كمستخدم آخر، اذهب لصفحة المنتج → اضغط "اشترِ الآن" → تأكد من التحويل لصفحة Stripe الحقيقية (لم يكن الزر يعمل سابقاً).
5. **بعد الدفع (بطاقة اختبار Stripe: 4242 4242 4242 4242):** تأكد من الوصول لـ `/checkout/success` ووجود رابط تحميل صالح.
6. **طلباتي:** `/orders` → تأكد من ظهور الطلب وزر التحميل.
7. **متجر عام:** `/store/[slug]` لأي بائع → تأكد من ظهور منتجاته المنشورة فقط.
8. **فلتر المتجر:** `/shop?cat=ebooks` → تأكد أن النتائج فعلاً مفلترة (كانت هذه مشكلة فعلية تم إصلاحها).
9. **حظر مستخدم:** من `/admin/users` احظر حساب تجربة → تأكد أنه يُحوَّل لصفحة `/banned` عند أي تنقل.
10. **مسارات الأدمن المحمية:** اذهب لـ `/admin` بحساب عادي → يُعاد توجيهه للرئيسية.

