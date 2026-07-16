// lib/email/notifications.ts
// إشعارات بريدية أساسية: بائع عند بيع منتجه، وأدمن عند منتج جديد بانتظار المراجعة.
// تصميم آمن: أي فشل في الإرسال يُسجَّل فقط بالـ console ولا يكسر تدفق الشراء/النشر أبداً.
import { getResendClient, FROM_ADDRESS } from './resend'

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL

export async function sendSellerSaleNotification(params: {
  sellerEmail: string
  listingTitle: string
  amount: number
  currency: string
}) {
  const resend = getResendClient()
  if (!resend) { console.log('[notify] Resend not configured, skipping seller notification'); return }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.sellerEmail,
      subject: `🎉 عملية بيع جديدة: ${params.listingTitle}`,
      html: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right;">
          <h2>مبروك! تم بيع منتجك للتو</h2>
          <p><strong>المنتج:</strong> ${params.listingTitle}</p>
          <p><strong>المبلغ:</strong> ${params.amount.toFixed(2)} ${params.currency}</p>
          <p>يمكنك متابعة كل مبيعاتك وأرباحك من لوحة التحكم الخاصة بك.</p>
          <p style="color:#888; font-size:12px; margin-top:24px;">DEGITALE</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[notify] seller sale email failed:', err)
  }
}

export async function sendAdminNewListingNotification(params: {
  listingId: string
  listingTitle: string
  sellerStoreName: string
}) {
  const resend = getResendClient()
  if (!resend) { console.log('[notify] Resend not configured, skipping admin notification'); return }
  if (!ADMIN_EMAIL) { console.log('[notify] ADMIN_NOTIFICATION_EMAIL not set, skipping admin notification'); return }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: `📥 منتج جديد بانتظار المراجعة: ${params.listingTitle}`,
      html: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right;">
          <h2>منتج جديد ينتظر مراجعتك</h2>
          <p><strong>المنتج:</strong> ${params.listingTitle}</p>
          <p><strong>المتجر:</strong> ${params.sellerStoreName}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/products">راجع المنتج الآن ←</a></p>
          <p style="color:#888; font-size:12px; margin-top:24px;">DEGITALE</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[notify] admin new-listing email failed:', err)
  }
}
