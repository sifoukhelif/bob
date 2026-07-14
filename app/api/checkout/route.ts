// app/api/checkout/route.ts — Stripe 2024-06-20
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

async function getPlatformFeePercent(admin: ReturnType<typeof createAdminClient>): Promise<number> {
  let feePercent = parseInt(process.env.PLATFORM_FEE_PERCENT ?? '20')
  try {
    const { data: setting } = await admin.from('platform_settings')
      .select('value').eq('key', 'platform_fee_percent').maybeSingle()
    if (setting?.value != null) {
      const parsed = parseInt(JSON.parse(setting.value as string))
      if (!Number.isNaN(parsed)) feePercent = parsed
    }
  } catch { /* احتياط: يبقى على قيمة env */ }
  return feePercent
}

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: listing } = await supabase
      .from('listings')
      .select('id,slug,title,base_price,currency,thumbnail_url,stores(id,owner_id,users:owner_id(stripe_account_id))')
      .eq('id', listingId).eq('status', 'active').single()

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const store          = listing.stores as any
    const sellerStripeId = store?.users?.stripe_account_id as string | undefined
    const unitAmount     = Math.round((listing.base_price ?? 0) * 100)
    const origin         = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!
    // ترميز الـ slug عشان الروابط اللي فيها أحرف عربية/غير لاتينية تكون صالحة لـ Stripe
    const cancelUrl      = `${origin}/product/${encodeURIComponent(listing.slug)}`

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
      if (file) {
        const { data: signed } = await admin.storage
          .from('listing-files')
          .createSignedUrl(file.storage_path, 48 * 3600, { download: true })
        if (signed?.signedUrl) {
          await admin.from('order_items').update({
            download_token:   Buffer.from(signed.signedUrl).toString('base64'),
            token_expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          }).eq('id', order_item_id)
        }
      }
      return NextResponse.json({ url: `${origin}/checkout/success?order_item=${order_item_id}` })
    }

    if (unitAmount < 50) return NextResponse.json({ error: 'الحد الأدنى للسعر هو $0.50' }, { status: 422 })

    const admin = createAdminClient()
    const feePercent = await getPlatformFeePercent(admin)
    const appFee = Math.round(unitAmount * feePercent / 100)

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: (listing.currency ?? 'usd').toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: listing.title,
            images: listing.thumbnail_url ? [listing.thumbnail_url] : [],
          },
        },
        quantity: 1,
      }],
      customer_email: user.email,
      metadata: { buyerId: user.id, listingId: listing.id, storeId: store?.id ?? '' },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  cancelUrl,
    }

    // أضف Connect split فقط إذا عنده Stripe account (غير مفعّل حالياً — يُفعّل لاحقاً)
    if (sellerStripeId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: appFee,
        transfer_data: { destination: sellerStripeId },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
