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

export async function sendBuyerOrderConfirmation(params: {
  buyerEmail: string
  listingTitle: string
  amount: number
  currency: string
  downloadUrl: string | null
}) {
  const resend = getResendClient()
  if (!resend) { console.log('[notify] Resend not configured, skipping buyer confirmation'); return }

  const priceLine = params.amount > 0
    ? `${params.amount.toFixed(2)} ${params.currency}`
    : (params.currency ? 'مجاناً / Free' : '')

  const downloadButton = params.downloadUrl
    ? `<p style="margin:24px 0;"><a href="${params.downloadUrl}" style="background:#C9A84C;color:#08080E;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">تحميل الآن / Download Now</a></p>`
    : `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders">${process.env.NEXT_PUBLIC_APP_URL}/orders</a></p>`

  // إيميل ثنائي اللغة (عربي/إنجليزي) لأن الـ webhook ما يعرف لغة واجهة المشتري المفضّلة
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.buyerEmail,
      subject: `✅ تم تأكيد طلبك: ${params.listingTitle} / Order Confirmed`,
      html: `
        <div style="font-family: sans-serif;">
          <div dir="rtl" style="text-align:right; margin-bottom: 24px;">
            <h2>تم تأكيد طلبك بنجاح ✅</h2>
            <p><strong>المنتج:</strong> ${params.listingTitle}</p>
            <p><strong>المبلغ المدفوع:</strong> ${priceLine}</p>
            <p>رابط التحميل صالح لمدة 48 ساعة. يمكنك أيضاً تحميل منتجك في أي وقت من صفحة "طلباتي".</p>
          </div>
          <hr style="border:none;border-top:1px solid #333;margin:16px 0;">
          <div dir="ltr" style="text-align:left;">
            <h2>Your order is confirmed ✅</h2>
            <p><strong>Product:</strong> ${params.listingTitle}</p>
            <p><strong>Amount paid:</strong> ${priceLine}</p>
            <p>The download link is valid for 48 hours. You can also download it anytime from your "Orders" page.</p>
          </div>
          ${downloadButton}
          <p style="color:#888; font-size:12px; margin-top:24px;">DEGITALE</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[notify] buyer confirmation email failed:', err)
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
