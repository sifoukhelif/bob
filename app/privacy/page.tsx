// app/privacy/page.tsx
import { LegalLayout } from '../legal-layout'
export const metadata = { title: 'سياسة الخصوصية' }

export default function PrivacyPage() {
  return (
    <LegalLayout title="سياسة الخصوصية">
      <p>نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه الصفحة البيانات التي نجمعها وكيفية استخدامها.</p>

      <div>
        <h2 className="text-white font-bold mb-2">البيانات التي نجمعها</h2>
        <p>البريد الإلكتروني، الاسم (اختياري)، وبيانات الطلبات والمعاملات اللازمة لتقديم الخدمة. لا نخزّن بيانات بطاقتك البنكية — تُعالَج جميع المدفوعات مباشرة عبر Stripe.</p>
      </div>

      <div>
        <h2 className="text-white font-bold mb-2">كيف نستخدم بياناتك</h2>
        <p>نستخدم بياناتك لتشغيل حسابك، معالجة الطلبات، تسليم المنتجات الرقمية، والتواصل معك بخصوص طلباتك.</p>
      </div>

      <div>
        <h2 className="text-white font-bold mb-2">مشاركة البيانات</h2>
        <p>لا نبيع بياناتك لأطراف ثالثة. نشارك الحد الأدنى من البيانات اللازمة مع مزودي الخدمة (Stripe للدفع، Resend للبريد، Supabase للتخزين) لتشغيل المنصة فقط.</p>
      </div>

      <div>
        <h2 className="text-white font-bold mb-2">حقوقك</h2>
        <p>يمكنك طلب الوصول إلى بياناتك أو تعديلها أو حذف حسابك بالتواصل معنا عبر صفحة الدعم.</p>
      </div>

      <p className="text-gray-600 text-xs mt-4">آخر تحديث: يونيو 2026. هذه السياسة نموذجية وتحتاج مراجعة قانونية متخصصة قبل الإطلاق الرسمي.</p>
    </LegalLayout>
  )
}
