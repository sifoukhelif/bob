// app/admin/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { RevenueChart } from '@/components/revenue-chart'
export const metadata = { title: 'لوحة الأدمن' }

export default async function AdminDashboard() {
  const admin = createAdminClient()
  const [
    { count: totalUsers },
    { count: totalListings },
    { count: pendingCount },
    { data: recentOrders },
    { data: activeSellerStores },
  ] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('listings').select('*', { count: 'exact', head: true }).eq('status','active'),
    admin.from('listings').select('*', { count: 'exact', head: true }).eq('status','pending_review'),
    admin.from('orders').select('id,total_amount,status,created_at').order('created_at',{ascending:false}).limit(8),
    admin.from('listings').select('store_id').eq('status','active'),
  ])
  const { data: paidOrders } = await admin.from('orders').select('total_amount,created_at').eq('status','paid')
  const totalRevenue = (paidOrders ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const activeSellersCount = new Set((activeSellerStores ?? []).map(l => l.store_id)).size

  const days: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days[d.toISOString().slice(0, 10)] = 0
  }
  for (const o of paidOrders ?? []) {
    const key = new Date(o.created_at).toISOString().slice(0, 10)
    if (key in days) days[key] += (o.total_amount ?? 0)
  }
  const revenuePoints = Object.entries(days).map(([date, amount]) => ({ date, amount }))

  const kpis = [
    { label: 'المستخدمون',       value: (totalUsers   ?? 0).toLocaleString('ar-SA'), color: 'text-[#4F8EF7]' },
    { label: 'بائعون نشطون',     value: activeSellersCount.toLocaleString('ar-SA'),  color: 'text-[#8B7FD6]' },
    { label: 'المنتجات النشطة',  value: (totalListings ?? 0).toLocaleString('ar-SA'), color: 'text-[#2ECC9A]' },
    { label: 'بانتظار المراجعة', value: (pendingCount  ?? 0).toLocaleString('ar-SA'), color: 'text-[#E8A030]' },
    { label: 'إجمالي الإيرادات', value: `$${totalRevenue.toFixed(2)}`,                color: 'text-[#C9A84C]' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-1">لوحة التحكم</h1>
      <p className="text-gray-500 text-sm mb-8">مرحباً، مدير المنصة</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#111118] border border-white/5 rounded-2xl p-5">
            <div className={`text-2xl font-serif font-bold mb-1 ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 mb-8">
        <div className="text-sm font-semibold mb-4">الإيرادات — آخر 30 يوماً (المنصة بالكامل)</div>
        <RevenueChart data={revenuePoints} />
      </div>

      {(pendingCount ?? 0) > 0 && (
        <div className="bg-[#E8A030]/8 border border-[#E8A030]/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold">{pendingCount} منتج بانتظار مراجعتك</span>
          <a href="/admin/products" className="bg-[#E8A030] text-[#08080E] text-xs font-black px-4 py-2 rounded-full hover:opacity-90 transition-opacity">راجع الآن</a>
        </div>
      )}

      <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 text-sm font-semibold">آخر الطلبيات</div>
        {recentOrders && recentOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-xs text-gray-500">
              <th className="text-right px-6 py-3 font-medium">المعرّف</th>
              <th className="text-right px-6 py-3 font-medium">المبلغ</th>
              <th className="text-right px-6 py-3 font-medium">الحالة</th>
              <th className="text-right px-6 py-3 font-medium">التاريخ</th>
            </tr></thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-gray-400">{o.id.slice(0,8)}…</td>
                  <td className="px-6 py-3 font-bold text-[#C9A84C]">${o.total_amount?.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${o.status==='paid'?'bg-[#2ECC9A]/10 text-[#2ECC9A]':'bg-[#E8A030]/10 text-[#E8A030]'}`}>
                      {o.status === 'paid' ? 'مدفوع' : o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-600 text-sm">لا توجد طلبيات بعد</div>
        )}
      </div>
    </div>
  )
}
