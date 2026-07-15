// app/checkout/success/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.checkoutSuccess.pageTitle }
}

export const dynamic = 'force-dynamic'

async function findOrderItemBySession(sessionId: string, attempt = 0): Promise<any | null> {
  const admin = createAdminClient()
  const { data: order } = await admin.from('orders').select('id').eq('stripe_session_id', sessionId).maybeSingle()
  if (!order) {
    // الـ webhook قد يحتاج لحظات لمعالجة الدفع — أعد المحاولة قليلاً
    if (attempt < 5) {
      await new Promise(r => setTimeout(r, 1200))
      return findOrderItemBySession(sessionId, attempt + 1)
    }
    return null
  }
  const { data: item } = await admin.from('order_items')
    .select('id,download_token,listing_id,listings(title,thumbnail_url)')
    .eq('order_id', order.id).maybeSingle()
  return item
}

export default async function CheckoutSuccessPage({
  searchParams,
}: { searchParams: Promise<{ session_id?: string; order_item?: string }> }) {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const { session_id, order_item } = await searchParams

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let item: any | null = null
  let stillProcessing = false

  if (order_item) {
    const admin = createAdminClient()
    const { data } = await admin.from('order_items')
      .select('id,download_token,listing_id,listings(title,thumbnail_url)')
      .eq('id', order_item).maybeSingle()
    item = data
  } else if (session_id) {
    item = await findOrderItemBySession(session_id)
    if (!item) stillProcessing = true
  } else {
    redirect('/shop')
  }

  const listing = item?.listings as any
  const downloadHref = item?.download_token ? `/api/download/${item.download_token}` : null

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center px-4">
      <div className="relative w-full max-w-md text-center">
        {stillProcessing ? (
          <>
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-2xl font-serif font-bold mb-3">{t.checkoutSuccess.processingTitle}</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {t.checkoutSuccess.processingBodyPrefix}{' '}
              <Link href="/orders" className="text-[#C9A84C] hover:underline">{t.checkoutSuccess.ordersLink}</Link>{' '}
              {t.checkoutSuccess.processingBodySuffix}
            </p>
            <Link href="/orders" className="bg-[#C9A84C] text-[#08080E] px-8 py-3 rounded-full font-black text-sm hover:opacity-90 transition-opacity inline-block">
              {t.checkoutSuccess.viewOrdersButton}
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">✓</div>
            <h1 className="text-2xl font-serif font-bold mb-3">{t.checkoutSuccess.successTitlePrefix} <span className="text-[#2ECC9A] italic">{t.checkoutSuccess.successTitleHighlight}</span></h1>
            {listing?.title && (
              <p className="text-gray-400 text-sm mb-8">{t.checkoutSuccess.thankYouPrefix}{listing.title}{t.checkoutSuccess.thankYouSuffix}</p>
            )}
            <div className="flex flex-col gap-3">
              {downloadHref && (
                <a href={downloadHref}
                  className="bg-[#C9A84C] text-[#08080E] px-8 py-3.5 rounded-full font-black text-sm hover:opacity-90 transition-opacity">
                  {t.checkoutSuccess.downloadButton}
                </a>
              )}
              <Link href="/orders" className="bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 transition-colors">
                {t.checkoutSuccess.viewAllOrdersButton}
              </Link>
            </div>
            <p className="text-[10px] text-gray-600 mt-6">{t.checkoutSuccess.validityNote}</p>
          </>
        )}
      </div>
    </div>
  )
}
