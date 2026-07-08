// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

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
  const rawBody  = await req.text()
  const sig      = req.headers.get('stripe-signature') ?? ''
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[webhook] signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }
  const session = event.data.object as Stripe.Checkout.Session
  const meta    = session.metadata ?? {}
  const { buyerId, listingId, storeId } = meta
  if (!buyerId || !listingId) {
    console.error('[webhook] missing metadata')
    return NextResponse.json({ error: 'Missing metadata' }, { status: 422 })
  }
  const admin = createAdminClient()
  // إيقاف معالجة مكررة
  const { data: existing } = await admin.from('orders')
    .select('id').eq('stripe_session_id', session.id).maybeSingle()
  if (existing) return NextResponse.json({ received: true, duplicate: true })
  const amount   = (session.amount_total ?? 0) / 100
  const currency = session.currency?.toUpperCase() ?? 'USD'
  const { data: result, error } = await admin.rpc('create_order_from_webhook', {
    p_buyer_id:      buyerId,
    p_listing_id:    listingId,
    p_amount:        amount,
    p_currency:      currency,
    p_stripe_session: session.id,
    p_stripe_intent: session.payment_intent as string ?? '',
  })
  if (error) {
    console.error('[webhook] DB error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
  const { order_item_id } = result as { order_id: string; order_item_id: string }

  // حساب المبلغ الصافي المستحق للبائع (نظام التحويل اليدوي)
  try {
    const feePercent = await getPlatformFeePercent(admin)
    const netAmount = Math.round(amount * (1 - feePercent / 100) * 100) / 100
    await admin.from('order_items')
      .update({ net_amount: netAmount, payout_status: 'pending' })
      .eq('id', order_item_id)
  } catch (err) {
    console.error('[webhook] payout calc error:', err)
  }

  // توليد رابط التحميل
  const { data: file } = await admin.from('listing_files')
    .select('storage_path').eq('listing_id', listingId)
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
  return NextResponse.json({ received: true })
}
