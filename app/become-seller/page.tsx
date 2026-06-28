// app/become-seller/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
export const metadata = { title: 'فعّل حساب البائع' }

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return base || `store-${Date.now()}`
}

async function createStore(formData: FormData) {
  'use server'
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/become-seller')

  const storeName = (formData.get('storeName') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim() || null
  if (!storeName || storeName.length < 3) {
    redirect('/become-seller?error=' + encodeURIComponent('اسم المتجر يجب أن يكون 3 أحرف على الأقل'))
  }

  const admin = createAdminClient()
  const baseSlug = slugify(storeName)

  // تأكد أن الـ slug غير مستخدم، وأضف رقم إذا تكرر
  let finalSlug = baseSlug
  let attempt = 0
  while (attempt < 20) {
    const { data: existing } = await admin.from('stores').select('id').eq('slug', finalSlug).maybeSingle()
    if (!existing) break
    attempt += 1
    finalSlug = `${baseSlug}-${attempt}`
  }

  const { error } = await admin.rpc('promote_buyer_to_seller', {
    p_user_id: user.id,
    p_store_name: storeName,
    p_store_slug: finalSlug,
    p_bio: bio,
  })

  if (error) {
    redirect('/become-seller?error=' + encodeURIComponent('تعذّر إنشاء المتجر، حاول باسم آخر'))
  }

  redirect('/become-seller/done')
}

export default async function BecomeSellerPage({
  searchParams,
}: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/become-seller')

  const role = user.app_metadata?.role as string | undefined
  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle()

  // فقط حوّله لو كان بائعاً مُسجَّلاً فعلياً (له متجر حقيقي)، لا بمجرد أن دوره seller/admin —
  // هذا يمنع حلقة تحويل لا نهائية بين هذه الصفحة و /dashboard لأي أدمن بلا متجر
  if (store) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#C9A84C]/5 blur-[120px] rounded-full" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo size="md" />
            <span className="text-xl font-bold tracking-widest uppercase">DEGITALE</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold mt-6 mb-2">أنشئ متجرك</h1>
          <p className="text-gray-500 text-sm">خطوة واحدة وتصبح بائعاً على المنصة</p>
        </div>

        <form action={createStore} className="bg-[#111118] border border-white/6 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">اسم المتجر</label>
            <input name="storeName" type="text" placeholder="مثال: استوديو الأصالة" required minLength={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">نبذة عن متجرك (اختياري)</label>
            <textarea name="bio" rows={3} placeholder="ماذا تبيع؟ ما الذي يميزك؟"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors resize-none" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">{error}</div>
          )}

          <button type="submit"
            className="w-full bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity mt-2">
            إنشاء المتجر والبدء
          </button>
        </form>
      </div>
    </div>
  )
}
