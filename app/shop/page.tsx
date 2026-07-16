// app/shop/page.tsx
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { AdBanner, AdCard } from '@/components/ad-slot'
import { ShopFilters } from '@/components/shop-filters'
import { Fragment } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'المتجر', description: 'اكتشف آلاف المنتجات والخدمات الرقمية' }

export default async function ShopPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; cat?: string; type?: string; page?: string; sort?: string; min?: string; max?: string }> }) {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const { q, cat, type, page, sort, min, max } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1'))
  const perPage = 12
  const from = (currentPage - 1) * perPage
  const to   = from + perPage - 1

  let products: any[] = [], count = 0, user: any = null, role: string | undefined, username: string | null = null
  try {
    const supabase = await createServerClient()
    const { data: userData } = await supabase.auth.getUser()
    user = userData.user
    role = user?.app_metadata?.role as string | undefined
    if (user) {
      const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
      username = profile?.username ?? null
    }
    const categoriesEmbed = cat ? 'categories!inner(slug)' : 'categories(slug)'
    let query = supabase.from('listings')
      .select(`id,title,slug,base_price,thumbnail_url,type,rating_avg,sales_count,created_at,stores(name),${categoriesEmbed}`, { count: 'exact' })
      .eq('status', 'active')
      .range(from, to)

    switch (sort) {
      case 'newest':     query = query.order('created_at', { ascending: false }); break
      case 'price_asc':  query = query.order('base_price', { ascending: true });  break
      case 'price_desc': query = query.order('base_price', { ascending: false }); break
      case 'top_rated':  query = query.order('rating_avg', { ascending: false, nullsFirst: false }); break
      default:            query = query.order('sales_count', { ascending: false })
    }

    if (q)    query = query.ilike('title', `%${q}%`)
    if (type) query = query.eq('type', type)
    if (cat)  query = query.eq('categories.slug', cat)
    if (min)  query = query.gte('base_price', parseFloat(min))
    if (max)  query = query.lte('base_price', parseFloat(max))
    const { data, count: c } = await query
    products = data ?? []; count = c ?? 0
  } catch {}

  const totalPages = Math.ceil(count / perPage)

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden lg:block">DEGITALE</span>
          </Link>

          <form action="/shop" method="get" className="hidden sm:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <input
                name="q"
                type="text"
                defaultValue={q}
                placeholder={t.nav.searchPlaceholder}
                className="w-full bg-white/5 border border-white/10 rounded-full pr-4 pl-9 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors"
              />
              <button type="submit" aria-label="search"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C9A84C] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher current={locale} />
            {user ? (
              <UserMenu email={user.email ?? ''} username={username} role={role} />
            ) : (
              <Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors">{t.shop.login}</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold mb-2">{t.shop.title}</h1>
          <p className="text-gray-500 text-sm mb-6">{count.toLocaleString()} {t.shop.itemsUnit}</p>
          {q && (
            <p className="text-xs text-gray-500 mb-4">
              {t.shop.searchingFor} <span className="text-[#C9A84C] font-bold">"{q}"</span>
              {' — '}
              <Link href="/shop" className="hover:underline">{t.shop.clearSearch}</Link>
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          <Link href="/shop" className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!cat && !type ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>{t.shop.filters.all}</Link>
          <Link href="/shop?type=service" className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${type === 'service' ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>{t.shop.filters.services}</Link>
          {['ui-ux-kits','ebooks','code-scripts'].map(c => (
            <Link key={c} href={`/shop?cat=${c}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${cat === c ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>
              {c === 'ui-ux-kits' ? t.shop.filters.ui : c === 'ebooks' ? t.shop.filters.ebooks : t.shop.filters.code}
            </Link>
          ))}
        </div>

        <ShopFilters t={t} locale={locale} />

        {/* مساحة إعلانية — أعلى نتائج المتجر */}
        <div className="mb-10">
          <AdBanner label={t.ads.banner} />
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
              {products.map((p, i) => (
                <Fragment key={p.id}>
                {i > 0 && i % 8 === 0 && (
                  <AdCard label={t.ads.banner} sublabel={t.ads.card} className="aspect-[4/5]" />
                )}
                <Link href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#12121A] border border-white/5 group-hover:border-[#C9A84C]/30 transition-all duration-500">
                    {p.thumbnail_url
                      ? <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover opacity-65 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📦</div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080E] via-[#08080E]/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-[9px] text-[#C9A84C] font-black uppercase tracking-widest mb-1 opacity-80">{(p.stores as any)?.name ?? 'DEGITALE'}</div>
                      <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1.5">{p.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-black text-sm text-[#C9A84C]">${p.base_price?.toFixed(2)}</span>
                        {p.rating_avg && <span className="text-[10px] text-gray-500">★ {p.rating_avg.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
                </Fragment>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(p => (
                  <Link key={p}
                    href={`/shop?${new URLSearchParams({ ...(q ? { q } : {}), ...(cat ? { cat } : {}), ...(type ? { type } : {}), ...(sort ? { sort } : {}), ...(min ? { min } : {}), ...(max ? { max } : {}), page: String(p) })}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${p === currentPage ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 text-gray-600">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-sm font-bold mb-1">{t.shop.noResultsTitle}</div>
            <div className="text-xs">{t.shop.noResultsSubtitle}</div>
          </div>
        )}
      </main>
    </div>
  )
}
