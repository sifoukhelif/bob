// app/orders/[id]/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdBanner } from '@/components/ad-slot'
import { ReviewForm } from '@/components/review-form'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

type Params = Promise<{ id: string }>

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/orders/${id}`)

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,total_amount,currency,status,created_at,stripe_session_id,
      order_items(id,listing_id,unit_price,download_token,token_expires_at,
        listings(title,slug,thumbnail_url,stores(name,slug)),
        reviews(id,rating,comment))
    `)
    .eq('id', id)
    .eq('buyer_id', user.id) // يضمن أن المشتري لا يرى إلا طلباته الخاصة فقط
    .maybeSingle()

  if (!order) notFound()

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  const username = profile?.username ?? null
  const isCompleted = order.status === 'completed' || order.status === 'paid'
  const items = (order.order_items as any[]) ?? []

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <UserMenu email={user.email ?? ''} username={username} role={user.app_metadata?.role as string | undefined} />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        <Link href="/orders" className="text-xs text-[#C9A84C] hover:underline mb-6 inline-block">
          {t.orders.backToOrders}
        </Link>

        <h1 className="text-3xl font-serif font-bold mb-8">{t.orders.detailTitle}</h1>

        {/* ملخص الطلب */}
        <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-gray-500 mb-1">{t.orders.orderRef}</div>
            <div className="text-xs font-mono text-gray-300" dir="ltr">{order.id.slice(0, 8)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">{t.orders.orderDate}</div>
            <div className="text-xs text-gray-300">{new Date(order.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">{t.orders.statusLabel}</div>
            <div className={`text-xs font-bold ${isCompleted ? 'text-[#2ECC9A]' : 'text-gray-400'}`}>
              {order.status === 'paid' ? t.orders.paidStatus : order.status === 'completed' ? t.orders.completedStatus : order.status}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-1">{t.orders.totalLabel}</div>
            <div className="text-sm font-serif font-black text-[#C9A84C]">${order.total_amount?.toFixed(2)}</div>
          </div>
          {order.stripe_session_id && (
            <div className="col-span-2">
              <div className="text-[10px] text-gray-500 mb-1">{t.orders.paymentRef}</div>
              <div className="text-[10px] font-mono text-gray-500 truncate" dir="ltr">{order.stripe_session_id}</div>
            </div>
          )}
        </div>

        {/* مساحة إعلانية */}
        <AdBanner label={t.ads.banner} className="h-16 md:h-20 mb-6" />

        {/* المنتجات */}
        <h2 className="text-sm font-bold text-gray-400 mb-4">{t.orders.itemsTitle}</h2>
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const listing = item.listings
            const store = listing?.stores
            const expired = item.token_expires_at ? new Date(item.token_expires_at) < new Date() : true
            const existingReview = (item.reviews as any[])?.[0] ?? null

            return (
              <div key={item.id} className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                    {listing?.thumbnail_url
                      ? <img src={listing.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${encodeURIComponent(listing?.slug ?? '')}`} className="font-bold text-sm hover:text-[#C9A84C] transition-colors truncate block">
                      {listing?.title ?? t.orders.defaultProductName}
                    </Link>
                    {store && (
                      <Link href={`/store/${store.slug}`} className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors">
                        {t.orders.sellerLabel}: {store.name}
                      </Link>
                    )}
                    <div className="text-xs text-gray-600 mt-1">${item.unit_price?.toFixed(2)}</div>
                  </div>
                  {item.download_token && !expired ? (
                    <a href={`/api/download/${item.download_token}`}
                      className="bg-[#C9A84C] text-[#08080E] text-xs font-black px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                      {t.orders.downloadButton}
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-600 whitespace-nowrap">{t.orders.linkExpired}</span>
                  )}
                </div>

                {isCompleted && item.id && item.listing_id && (
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
            )
          })}
        </div>
      </main>
    </div>
  )
}
