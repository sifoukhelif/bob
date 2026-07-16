// app/orders/page.tsx
import { Fragment } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdBanner } from '@/components/ad-slot'
import { ReviewForm } from '@/components/review-form'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

export const metadata = { title: 'طلباتي' }

export default async function OrdersPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('id,total_amount,currency,status,created_at,order_items(id,listing_id,download_token,token_expires_at,listings(title,slug,thumbnail_url),reviews(id,rating,comment))')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  const username = profile?.username ?? null

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
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

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-3xl font-serif font-bold mb-8">{t.orders.title}</h1>

        {orders && orders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {orders.map((order, idx) => {
              const item = (order.order_items as any[])?.[0]
              const listing = item?.listings
              const expired = item?.token_expires_at ? new Date(item.token_expires_at) < new Date() : true
              const isCompleted = order.status === 'completed' || order.status === 'paid'
              const existingReview = (item?.reviews as any[])?.[0] ?? null

              return (
                <Fragment key={order.id}>
                  <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                        {listing?.thumbnail_url
                          ? <img src={listing.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          : '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{listing?.title ?? t.orders.defaultProductName}</div>
                        <div className="text-xs text-gray-500">
                          ${order.total_amount?.toFixed(2)} · {new Date(order.created_at).toLocaleDateString()} ·{' '}
                          <span className={isCompleted ? 'text-[#2ECC9A]' : 'text-gray-500'}>
                            {order.status === 'paid' ? t.orders.paidStatus : order.status === 'completed' ? t.orders.completedStatus : order.status}
                          </span>
                        </div>
                      </div>
                      {item?.download_token && !expired ? (
                        <a href={`/api/download/${item.download_token}`}
                          className="bg-[#C9A84C] text-[#08080E] text-xs font-black px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                          {t.orders.downloadButton}
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-600 whitespace-nowrap">{t.orders.linkExpired}</span>
                      )}
                    </div>

                    {isCompleted && item?.id && item?.listing_id && (
                      <ReviewForm
                        orderItemId={item.id}
                        listingId={item.listing_id}
                        buyerId={user.id}
                        existingReview={existingReview}
                        t={t}
                        locale={locale}
                      />
                    )}
                  </div>

                  {/* مساحة إعلانية — تظهر بعد أول طلبين */}
                  {idx === 1 && <AdBanner label={t.ads.banner} className="h-16 md:h-20" />}
                </Fragment>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-600 text-sm">
            {t.orders.emptyTitle}{' '}
            <Link href="/shop" className="text-[#C9A84C] hover:underline">{t.orders.emptyCta}</Link>
          </div>
        )}
      </main>
    </div>
  )
}
