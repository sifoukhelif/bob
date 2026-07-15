// app/product/[slug]/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { BuyBox } from './buy-box'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { safeDecodeSlug } from '@/lib/slug'
import { getTranslatedListing } from '@/lib/translate'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = safeDecodeSlug(rawSlug)
  const locale = await getServerLocale()
  const supabase  = await createServerClient()
  const { data }  = await supabase.from('listings').select('id,title,description,base_price,thumbnail_url')
    .eq('slug', slug).eq('status', 'active').single()
  if (!data) return { title: 'منتج غير موجود' }
  const translated = locale === 'ar' ? data : await getTranslatedListing(data.id, data, locale)
  const price  = data.base_price ? `$${data.base_price.toFixed(2)}` : 'مجاناً'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://degitale.com'
  return {
    title: `${translated.title} — ${price}`,
    description: translated.description?.slice(0, 155) ?? '',
    openGraph: {
      title: translated.title, description: `${price}`,
      images: data.thumbnail_url ? [{ url: data.thumbnail_url, width: 1200, height: 630 }] : [],
      url: `${appUrl}/product/${slug}`, siteName: 'DEGITALE',
    },
    twitter: { card: 'summary_large_image', title: translated.title, description: price,
      images: data.thumbnail_url ? [data.thumbnail_url] : [] },
    other: { 'og:price:amount': String(data.base_price ?? 0), 'og:price:currency': 'USD' },
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug: rawSlug } = await params
  const slug = safeDecodeSlug(rawSlug)
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const supabase  = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  let username: string | null = null
  if (user) {
    const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
    username = profile?.username ?? null
  }
  const { data: p, error: productError } = await supabase.from('listings')
    .select('id,title,slug,description,base_price,compare_price,currency,thumbnail_url,gallery_urls,sales_count,rating_avg,rating_count,type,tags,delivery_days,stores(id,name,slug,rating_avg,sales_count)')
    .eq('slug', slug).eq('status', 'active').single()

  if (productError) {
    console.error('[product-page] query error for slug:', slug, JSON.stringify(productError))
  }
  if (!p) {
    console.error('[product-page] no data returned for slug:', slug, 'raw:', rawSlug)
    notFound()
  }

  const translated = locale === 'ar'
    ? { title: p.title, description: p.description }
    : await getTranslatedListing(p.id, { title: p.title, description: p.description }, locale)

  const store   = p.stores as any
  const price   = p.base_price ?? 0
  const savings = p.compare_price ? Math.round((1 - price / p.compare_price) * 100) : null
  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-600 flex-1 min-w-0">
            <Link href="/shop" className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.nav.shop}</Link>
            <span>/</span>
            <span className="text-gray-400 truncate">{translated.title}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher current={locale} />
            {user ? (
              <UserMenu email={user.email ?? ''} username={username} role={user.app_metadata?.role as string | undefined} />
            ) : (
              <Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors">{t.product.login}</Link>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div className="lg:sticky lg:top-28">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#12121A] border border-white/5">
              {p.thumbnail_url
                ? <img src={p.thumbnail_url} alt={translated.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-7xl opacity-15">📦</div>
              }
              {savings && (
                <div className="absolute top-4 right-4 bg-[#2ECC9A] text-[#08080E] text-xs font-black px-3 py-1.5 rounded-full">
                  {t.product.save} {savings}%
                </div>
              )}
            </div>
            {p.tags && (p.tags as string[]).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(p.tags as string[]).map(tag => (
                  <span key={tag} className="bg-white/5 border border-white/10 text-gray-400 text-xs px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6">
            {store && (
              <Link href={`/store/${store.slug}`} className="flex items-center gap-3 w-fit group">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C] text-xs font-bold">
                  {store.name?.charAt(0) ?? 'S'}
                </div>
                <span className="text-sm text-gray-400 group-hover:text-[#C9A84C] transition-colors">{store.name}</span>
                <span className="text-xs text-gray-600">· {store.sales_count ?? 0} {t.product.sales}</span>
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight">{translated.title}</h1>
            {p.rating_avg && (
              <div className="flex items-center gap-2">
                <span className="text-[#C9A84C]">{'★'.repeat(Math.round(p.rating_avg))}</span>
                <span className="font-bold text-sm">{p.rating_avg.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({p.rating_count} {t.product.reviews})</span>
                <span className="text-xs text-gray-600">· {p.sales_count} {t.product.sales}</span>
              </div>
            )}
            {translated.description && (
              <p className="text-gray-400 leading-relaxed text-sm">{translated.description}</p>
            )}
            {p.type === 'service' && p.delivery_days && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-[#C9A84C]">⚡</span>
                {t.product.deliveryPrefix} {p.delivery_days} {t.product.deliveryUnit}
              </div>
            )}
            <BuyBox listingId={p.id} type={p.type} price={price} comparePrice={p.compare_price} locale={locale} />
          </div>
        </div>
      </main>
    </div>
  )
}
