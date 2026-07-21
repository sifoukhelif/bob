// app/api/checkout/route.ts — Lemon Squeezy (بديل Stripe لقسم المنتجات الرقمية)
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSellerSaleNotification, sendBuyerOrderConfirmation } from '@/lib/email/notifications'
import { createLemonSqueezyCheckout } from '@/lib/lemonsqueezy'

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: listing } = await supabase
      .from('listings')
      .select('id,slug,title,base_price,currency,thumbnail_url,type,stores(id,owner_id,users:owner_id(email))')
      .eq('id', listingId).eq('status', 'active').single()

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    // الخدمات ممنوعة على Lemon Squeezy (شروط استخدامهم) — تُحوَّل لتدفق يدوي بدل بوابة دفع تلقائية
    if (listing.type === 'service') {
      return NextResponse.json({ error: 'service_manual_only' }, { status: 422 })
    }

    const store          = listing.stores as any
    const unitAmount     = Math.round((listing.base_price ?? 0) * 100)
    const origin         = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

    // منتجات مجانية: تُنشأ كطلب مباشرة بدون المرور بـ Stripe
    if (unitAmount === 0) {
      const admin = createAdminClient()
      const { data: result, error } = await admin.rpc('create_order_from_webhook', {
        p_buyer_id:       user.id,
        p_listing_id:     listing.id,
        p_amount:         0,
        p_currency:       (listing.currency ?? 'USD').toUpperCase(),
        p_stripe_session: `free_${listing.id}_${user.id}_${Date.now()}`,
        p_stripe_intent:  '',
      })
      if (error) return NextResponse.json({ error: 'تعذّر إتمام الطلب' }, { status: 500 })
      const { order_item_id } = result as { order_item_id: string }

      // منتجات مجانية: لا مبلغ مستحق للبائع
      await admin.from('order_items')
        .update({ net_amount: 0, payout_status: 'paid' })
        .eq('id', order_item_id)

      const { data: file } = await admin.from('listing_files')
        .select('storage_path').eq('listing_id', listing.id)
        .order('version', { ascending: false }).maybeSingle()
      let downloadToken: string | null = null
      if (file) {
        const { data: signed } = await admin.storage
          .from('listing-files')
          .createSignedUrl(file.storage_path, 48 * 3600, { download: true })
        if (signed?.signedUrl) {
          downloadToken = Buffer.from(signed.signedUrl).toString('base64url')
          await admin.from('order_items').update({
            download_token:   downloadToken,
            token_expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          }).eq('id', order_item_id)
        }
      }
      // إشعار البائع (منتج مجاني أيضاً يستحق إشعاراً، لا مبلغ لكن عملية بيع/تحميل فعلية)
      try {
        const sellerEmail = (listing.stores as any)?.users?.email
        if (sellerEmail) {
          await sendSellerSaleNotification({
            sellerEmail, listingTitle: listing.title, amount: 0,
            currency: (listing.currency ?? 'USD').toUpperCase(),
          })
        }
      } catch (err) { console.error('[checkout] seller notification error:', err) }

      // إشعار المشتري بتأكيد الطلب (البريد متوفر مباشرة من جلسته، بدون استعلام إضافي)
      try {
        if (user.email) {
          await sendBuyerOrderConfirmation({
            buyerEmail: user.email,
            listingTitle: listing.title,
            amount: 0,
            currency: (listing.currency ?? 'USD').toUpperCase(),
            downloadUrl: downloadToken ? `${origin}/api/download/${downloadToken}` : null,
          })
        }
      } catch (err) { console.error('[checkout] buyer confirmation error:', err) }

      return NextResponse.json({ url: `${origin}/checkout/success?order_item=${order_item_id}` })
    }

    if (unitAmount < 50) return NextResponse.json({ error: 'الحد الأدنى للسعر هو $0.50' }, { status: 422 })

    // مرجع فريد نولّده نحن ونمرره لـ Lemon Squeezy عبر custom_data، ونستخدمه كـ "معرّف جلسة"
    // بنفس عمود stripe_session_id الموجود أصلاً — يخلينا نعيد استخدام صفحة النجاح والـ RPC بدون أي تعديل عليهم.
    const checkoutRef = crypto.randomUUID()
    const sessionId    = `ls_${checkoutRef}`

    const checkoutUrl = await createLemonSqueezyCheckout({
      unitAmountCents: unitAmount,
      productName: listing.title,
      productImageUrl: listing.thumbnail_url,
      buyerEmail: user.email,
      successUrl: `${origin}/checkout/success?session_id=${sessionId}`,
      customData: {
        buyerId: user.id,
        listingId: listing.id,
        storeId: store?.id ?? '',
        checkoutRef,
      },
    })

    return NextResponse.json({ url: checkoutUrl })
  } catch (err: any) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
