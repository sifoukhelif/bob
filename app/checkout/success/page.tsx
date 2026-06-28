// app/checkout/success/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'تم الدفع بنجاح' }
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
            <h1 className="text-2xl font-serif font-bold mb-3">جارٍ تأكيد دفعتك…</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              قد يستغرق هذا بضع ثوانٍ. إذا لم تتحدث الصفحة، تحقق من{' '}
              <Link href="/orders" className="text-[#C9A84C] hover:underline">طلباتي</Link> بعد قليل.
            </p>
            <Link href="/orders" className="bg-[#C9A84C] text-[#08080E] px-8 py-3 rounded-full font-black text-sm hover:opacity-90 transition-opacity inline-block">
              عرض طلباتي
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">✓</div>
            <h1 className="text-2xl font-serif font-bold mb-3">تم الدفع <span className="text-[#2ECC9A] italic">بنجاح</span></h1>
            {listing?.title && (
              <p className="text-gray-400 text-sm mb-8">شكراً لشرائك «{listing.title}»</p>
            )}
            <div className="flex flex-col gap-3">
              {downloadHref && (
                <a href={downloadHref}
                  className="bg-[#C9A84C] text-[#08080E] px-8 py-3.5 rounded-full font-black text-sm hover:opacity-90 transition-opacity">
                  تحميل الملف الآن
                </a>
              )}
              <Link href="/orders" className="bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 transition-colors">
                عرض كل طلباتي
              </Link>
            </div>
            <p className="text-[10px] text-gray-600 mt-6">رابط التحميل صالح لمدة 48 ساعة من لحظة الشراء</p>
          </>
        )}
      </div>
    </div>
  )
}
