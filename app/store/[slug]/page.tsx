// app/store/[slug]/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Fragment } from 'react'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

// يعالج الترميز المزدوج المحتمل لأسماء/روابط المتاجر العربية
// (نفس الحل المُطبَّق في app/product/[slug]/page.tsx)
function safeDecodeSlug(raw: string): string {
  let decoded = raw
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch {
      break
    }
  }
  return decoded
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = safeDecodeSlug(rawSlug)
  const supabase = await createServerClient()
  const { data } = await supabase.from('stores').select('name,bio').eq('slug', slug).maybeSingle()
  if (!data) return { title: 'متجر غير موجود' }
  return { title: data.name, description: data.bio ?? `تصفح منتجات ${data.name} على DEGITALE` }
}

export default async function StorePage({ params }: { params: Params }) {
  const { slug: rawSlug } = await params
  const slug = safeDecodeSlug(rawSlug)
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  let username: string | null = null
  if (user) {
    const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
    username = profile?.username ?? null
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id,name,slug,bio,banner_url,rating_avg,rating_count,sales_count,stripe_verified,badges,created_at')
    .eq('slug', slug).maybeSingle()

  if (storeError) {
    console.error('[store-page] query error for slug:', slug, JSON.stringify(storeError))
  }
  if (!store) {
    console.error('[store-page] no data returned for slug:', slug, 'raw:', rawSlug)
    notFound()
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('id,title,slug,base_price,thumbnail_url,type,rating_avg,sales_count')
    .eq('store_id', store.id)
    .eq('status', 'active')
    .order('sales_count', { ascending: false })

  // نُدرج بطاقة إعلانية بعد كل 6 منتجات داخل الشبكة
  const AD_EVERY = 6
  const items = listings ?? []

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} />
            {user ? (
              <UserMenu email={user.email ?? ''} username={username} role={user.app_metadata?.role as string | undefined} />
            ) : (
              <Link href="/shop" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{t.store.generalShop}</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-24">
        {/* STORE HEADER */}
        <div className="bg-[#111118] border border-white/5 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C] text-3xl font-black shrink-0">
            {store.name?.charAt(0) ?? 'S'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-2xl font-serif font-bold">{store.name}</h1>
              {store.stripe_verified && (
                <span className="text-[10px] bg-[#4F8EF7]/10 text-[#4F8EF7] px-2.5 py-1 rounded-full font-bold">{t.store.verified}</span>
              )}
            </div>
            {store.bio && <p className="text-gray-500 text-sm leading-relaxed mb-3 max-w-xl">{store.bio}</p>}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {store.rating_avg && <span>★ {store.rating_avg.toFixed(1)} ({store.rating_count} {t.store.ratingSuffix})</span>}
              <span>{store.sales_count ?? 0} {t.store.salesLabel}</span>
              <span>{t.store.memberSince} {new Date(store.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* AD BANNER — مساحة إعلانية علوية */}
        <div className="mb-12 rounded-2xl border border-dashed border-white/10 bg-[#111118]/50 h-24 md:h-28 flex items-center justify-center text-gray-600 text-xs tracking-wide">
          {t.store.adBannerLabel}
        </div>

        {/* LISTINGS */}
        <h2 className="text-xl font-serif font-bold mb-6">{t.store.productsTitlePrefix} ({items.length})</h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((p, i) => (
              <Fragment key={p.id}>
                <Link href={`/product/${encodeURIComponent(p.slug)}`} className="group block">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#12121A] border border-white/5 group-hover:border-[#C9A84C]/30 transition-all duration-500">
                    {p.thumbnail_url
                      ? <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover opacity-65 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📦</div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080E] via-[#08080E]/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1.5">{p.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-black text-sm text-[#C9A84C]">${p.base_price?.toFixed(2)}</span>
                        {p.rating_avg && <span className="text-[10px] text-gray-500">★ {p.rating_avg.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
                {/* AD CARD — بطاقة إعلانية مدمجة كل 6 منتجات */}
                {(i + 1) % AD_EVERY === 0 && (
                  <div className="relative aspect-[4/5] rounded-2xl border border-dashed border-white/10 bg-[#111118]/50 flex flex-col items-center justify-center gap-1 text-gray-600">
                    <span className="text-[9px] tracking-widest uppercase text-gray-700">{t.store.adCardLabel}</span>
                    <span className="text-xs">{t.store.adBannerLabel}</span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-600 text-sm">{t.store.emptyText}</div>
        )}
      </main>
    </div>
  )
}
