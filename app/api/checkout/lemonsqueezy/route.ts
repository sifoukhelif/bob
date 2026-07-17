// app/api/webhooks/lemonsqueezy/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSellerSaleNotification } from '@/lib/email/notifications'
import { verifyLemonSqueezySignature } from '@/lib/lemonsqueezy'

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
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature')

  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    console.error('[ls-webhook] signature failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = payload?.meta?.event_name as string | undefined
  if (eventName !== 'order_created') {
    return NextResponse.json({ received: true })
  }

  const customData = (payload?.meta?.custom_data ?? {}) as Record<string, string>
  const { buyerId, listingId, storeId, checkoutRef } = customData
  if (!buyerId || !listingId || !checkoutRef) {
    console.error('[ls-webhook] missing custom_data')
    return NextResponse.json({ error: 'Missing custom_data' }, { status: 422 })
  }

  const order = payload?.data?.attributes ?? {}
  const sessionId = `ls_${checkoutRef}`
  const admin = createAdminClient()

  // إيقاف معالجة مكررة (نفس فحص الـ Stripe webhook بالضبط)
  const { data: existing } = await admin.from('orders')
    .select('id').eq('stripe_session_id', sessionId).maybeSingle()
  if (existing) return NextResponse.json({ received: true, duplicate: true })

  // Lemon Squeezy يرسل المبالغ بالسنت (زي Stripe)، وحقل total هو الإجمالي المدفوع فعلياً
  const amount   = (order.total ?? 0) / 100
  const currency = (order.currency ?? 'USD').toUpperCase()

  const { data: result, error } = await admin.rpc('create_order_from_webhook', {
    p_buyer_id:       buyerId,
    p_listing_id:     listingId,
    p_amount:         amount,
    p_currency:       currency,
    p_stripe_session: sessionId,
    p_stripe_intent:  payload?.data?.id ?? '',
  })
  if (error) {
    console.error('[ls-webhook] DB error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
  const { order_item_id } = result as { order_id: string; order_item_id: string }

  // إشعار البائع بالبريد (لا يوقف التدفق لو فشل)
  try {
    const { data: listingInfo } = await admin
      .from('listings')
      .select('title, stores(owner_id, users:owner_id(email))')
      .eq('id', listingId).maybeSingle()
    const sellerEmail = (listingInfo?.stores as any)?.users?.email
    if (sellerEmail) {
      await sendSellerSaleNotification({
        sellerEmail,
        listingTitle: listingInfo?.title ?? '',
        amount,
        currency,
      })
    }
  } catch (err) {
    console.error('[ls-webhook] seller notification error:', err)
  }

  // حساب المبلغ الصافي المستحق للبائع (نظام التحويل اليدوي — بدون أي علاقة بـ Lemon Squeezy)
  try {
    const feePercent = await getPlatformFeePercent(admin)
    const netAmount = Math.round(amount * (1 - feePercent / 100) * 100) / 100
    await admin.from('order_items')
      .update({ net_amount: netAmount, payout_status: 'pending' })
      .eq('id', order_item_id)
  } catch (err) {
    console.error('[ls-webhook] payout calc error:', err)
  }

  // توليد رابط التحميل (نفس منطق Stripe webhook بالضبط)
  const { data: file } = await admin.from('listing_files')
    .select('storage_path').eq('listing_id', listingId)
    .order('version', { ascending: false }).maybeSingle()
  if (file) {
    const { data: signed } = await admin.storage
      .from('listing-files')
      .createSignedUrl(file.storage_path, 48 * 3600, { download: true })
    if (signed?.signedUrl) {
      await admin.from('order_items').update({
        download_token:   Buffer.from(signed.signedUrl).toString('base64url'),
        token_expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      }).eq('id', order_item_id)
    }
  }

  return NextResponse.json({ received: true })
}
