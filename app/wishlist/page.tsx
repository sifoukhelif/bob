// app/wishlist/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdBanner } from '@/components/ad-slot'
import { WishlistButton } from '@/components/wishlist-button'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.wishlist.title }
}

export default async function WishlistPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/wishlist')

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  const username = profile?.username ?? null

  const { data: items } = await supabase
    .from('wishlists')
    .select('id,listing_id,listings(id,title,slug,base_price,thumbnail_url,rating_avg,status)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const validItems = (items ?? []).filter((w: any) => w.listings && w.listings.status === 'active')

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
            <Link href="/shop" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{t.orders.shopLink}</Link>
            <UserMenu email={user.email ?? ''} username={username} role={user.app_metadata?.role as string | undefined} />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-3xl font-serif font-bold mb-2">{t.wishlist.title}</h1>
        <p className="text-gray-500 text-sm mb-10">{t.wishlist.subtitle}</p>

        {validItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
              {validItems.map((w: any) => {
                const p = w.listings
                return (
                  <div key={w.id} className="relative group">
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistButton listingId={p.id} userId={user.id} initialSaved={true} size="sm" />
                    </div>
                    <Link href={`/product/${encodeURIComponent(p.slug)}`} className="block">
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#12121A] border border-white/5 group-hover:border-[#C9A84C]/30 transition-all duration-500">
                        {p.thumbnail_url
                          ? <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover opacity-65 group-hover:opacity-95 transition-opacity duration-700" />
                          : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📦</div>}
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
                  </div>
                )
              })}
            </div>

            {/* مساحة إعلانية */}
            <AdBanner label={t.ads.banner} />
          </>
        ) : (
          <div className="text-center py-24 text-gray-600 text-sm">
            <div className="text-5xl mb-4">♡</div>
            {t.wishlist.emptyTitle}{' '}
            <Link href="/shop" className="text-[#C9A84C] hover:underline">{t.wishlist.emptyCta}</Link>
          </div>
        )}
      </main>
    </div>
  )
}
