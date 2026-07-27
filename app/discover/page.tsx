// app/discover/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdStrip } from '@/components/ad-slot'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { getTranslatedCategories } from '@/lib/translate'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.discover.title, description: t.discover.subtitle }
}

const CATEGORY_ICONS: Record<string, string> = {
  'business-productivity': '💼', 'code-scripts': '💻', 'gaming-interactive': '🎮',
  'consulting': '🧭', 'software-web-dev': '🌐', 'ui-ux-design': '🎨',
  'micro-services': '🛠️', 'audio-video': '🎬', 'ebooks': '📚', 'ui-ux-kits': '🧩',
}

function ProductCard({ p }: { p: any }) {
  return (
    <Link href={`/product/${p.slug}`} className="group block w-40 shrink-0">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#12121A] border border-white/5 group-hover:border-[#C9A84C]/30 transition-all duration-500 mb-2">
        {p.thumbnail_url
          ? <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
          : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📦</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080E] via-transparent to-transparent" />
      </div>
      <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-0.5">{p.title}</h3>
      <span className="font-serif font-black text-xs text-[#C9A84C]">${p.base_price?.toFixed(2)}</span>
    </Link>
  )
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">{children}</div>
}

export default async function DiscoverPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const supabase = await createServerClient()

  const productFields = 'id,title,slug,base_price,thumbnail_url,rating_avg,sales_count,created_at'

  const [{ data: topRated }, { data: bestSellers }, { data: newArrivals }, { data: mainCategories }, { data: stores }] = await Promise.all([
    supabase.from('listings').select(productFields).eq('status', 'active').order('rating_avg', { ascending: false, nullsFirst: false }).limit(12),
    supabase.from('listings').select(productFields).eq('status', 'active').order('sales_count', { ascending: false }).limit(12),
    supabase.from('listings').select(productFields).eq('status', 'active').order('created_at', { ascending: false }).limit(12),
    supabase.from('categories').select('id,slug,name_ar,type,parent_id').is('parent_id', null).eq('is_active', true).order('position'),
    supabase.from('stores').select('id,name,slug,logo_url,rating_avg,sales_count').order('sales_count', { ascending: false }).limit(8),
  ])

  const categories = await getTranslatedCategories(mainCategories ?? [], locale)

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{t.discover.homeLink}</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-24">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-[#C9A84C] text-[10px] font-black tracking-[0.3em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] inline-block" />
            {t.discover.badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{t.discover.title}</h1>
          <p className="text-gray-400 max-w-xl">{t.discover.subtitle}</p>
        </div>

        {/* TOP RATED */}
        {topRated && topRated.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-serif font-bold mb-5">{t.discover.topRatedTitle}</h2>
            <ScrollRow>{topRated.map(p => <ProductCard key={p.id} p={p} />)}</ScrollRow>
          </section>
        )}

        {/* CATEGORIES */}
        {categories.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-serif font-bold mb-5">{t.discover.categoriesTitle}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map(c => (
                <Link key={c.id} href={`/shop?cat=${c.slug}`}
                  className="bg-[#111118] border border-white/5 rounded-2xl p-5 text-center hover:border-[#C9A84C]/30 transition-colors">
                  <div className="text-2xl mb-2">{CATEGORY_ICONS[c.slug] ?? '✦'}</div>
                  <p className="text-xs font-bold text-gray-300 leading-snug">{c.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mb-14">
          <AdStrip label={t.ads.strip} className="w-full" />
        </div>

        {/* BEST SELLERS */}
        {bestSellers && bestSellers.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-serif font-bold mb-5">{t.discover.bestSellersTitle}</h2>
            <ScrollRow>{bestSellers.map(p => <ProductCard key={p.id} p={p} />)}</ScrollRow>
          </section>
        )}

        {/* NEW ARRIVALS */}
        {newArrivals && newArrivals.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-serif font-bold mb-5">{t.discover.newArrivalsTitle}</h2>
            <ScrollRow>{newArrivals.map(p => <ProductCard key={p.id} p={p} />)}</ScrollRow>
          </section>
        )}

        {/* FEATURED STORES */}
        {stores && stores.length > 0 && (
          <section>
            <h2 className="text-lg font-serif font-bold mb-5">{t.discover.featuredStoresTitle}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stores.map(s => (
                <Link key={s.id} href={`/store/${s.slug}`}
                  className="bg-[#111118] border border-white/5 rounded-2xl p-6 text-center hover:border-[#C9A84C]/30 transition-colors">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C] text-xl font-black mx-auto mb-3">
                    {s.logo_url ? <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" /> : s.name?.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-white truncate mb-1">{s.name}</p>
                  {s.rating_avg && <p className="text-[10px] text-gray-500">★ {s.rating_avg.toFixed(1)}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
