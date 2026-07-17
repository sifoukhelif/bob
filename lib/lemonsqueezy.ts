// lib/lemonsqueezy.ts
// طبقة مساعدة للتكامل مع Lemon Squeezy — بديل Stripe لقسم "المنتجات الرقمية" فقط
// (الخدمات ممنوعة على Lemon Squeezy حسب شروط استخدامهم، تبقى بنظام يدوي).
//
// يعتمد على متغيّر واحد (Variant) عام يُنشأ يدوياً مرة واحدة بلوحة تحكم Lemon Squeezy
// (منتج اسمه مثلاً "DEGITALE Digital Product")، ثم كل عملية شراء تُحدَّد سعرها
// ديناميكياً عبر custom_price بدل الاعتماد على سعر المتغيّر الثابت.

import crypto from 'node:crypto'

const LS_API_BASE = 'https://api.lemonsqueezy.com/v1'

type CreateCheckoutParams = {
  unitAmountCents: number // السعر بالسنت (نفس منطق Stripe unit_amount)
  productName: string
  productImageUrl?: string | null
  buyerEmail?: string | null
  successUrl: string
  customData: Record<string, string>
}

export async function createLemonSqueezyCheckout(params: CreateCheckoutParams) {
  const storeId   = process.env.LEMONSQUEEZY_STORE_ID
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID
  const apiKey    = process.env.LEMONSQUEEZY_API_KEY
  if (!storeId || !variantId || !apiKey) {
    throw new Error('LEMONSQUEEZY_STORE_ID / LEMONSQUEEZY_VARIANT_ID / LEMONSQUEEZY_API_KEY غير مضبوطة')
  }

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          custom_price: params.unitAmountCents,
          product_options: {
            name: params.productName,
            media: params.productImageUrl ? [params.productImageUrl] : [],
            redirect_url: params.successUrl,
          },
          checkout_data: {
            email: params.buyerEmail ?? undefined,
            custom: params.customData,
          },
        },
        relationships: {
          store:   { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Lemon Squeezy checkout failed: ${res.status} ${errText}`)
  }

  const json = await res.json()
  const url = json?.data?.attributes?.url as string | undefined
  if (!url) throw new Error('Lemon Squeezy: لم يُرجع رابط دفع')
  return url
}

// يتحقق من توقيع الـ webhook (X-Signature header) بمقارنة HMAC-SHA256 آمنة زمنياً
export function verifyLemonSqueezySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret || !signatureHeader) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signatureHeader, 'utf8'))
  } catch {
    return false // أطوال مختلفة → توقيع غير صالح
  }
}
