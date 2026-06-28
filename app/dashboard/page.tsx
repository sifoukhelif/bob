// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'

export const metadata = { title: 'لوحة تحكم البائع' }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:          { label: 'منشور',       color: 'bg-[#2ECC9A]/10 text-[#2ECC9A]' },
  pending_review:  { label: 'قيد المراجعة', color: 'bg-[#E8A030]/10 text-[#E8A030]' },
  rejected:        { label: 'مرفوض',        color: 'bg-red-500/10 text-red-400' },
  paused:          { label: 'متوقف',        color: 'bg-white/10 text-gray-400' },
  draft:           { label: 'مسودة',        color: 'bg-white/10 text-gray-400' },
}

export default async function DashboardPage({
  searchParams,
}: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard')

  const { data: store } = await supabase.from('stores').select('id,name,slug,bio,sales_count,rating_avg').eq('owner_id', user.id).maybeSingle()
  const role = user.app_metadata?.role as string | undefined
  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  const username = profile?.username ?? null

  if (!store) {
    // الأدمن قد لا يملك متجراً أبداً ولا يُفترض إجباره على إنشاء واحد —
    // نعرض له حالة واضحة بدل تحويله لـ /become-seller (الذي يحوّله بدوره
    // مباشرة إلى /dashboard لأنه أدمن، فتنتج حلقة تحويل لا نهائية)
    if (role === 'admin') {
      return (
        <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-6">🏪</div>
            <h1 className="text-2xl font-serif font-bold mb-3">لا يوجد متجر مرتبط بحسابك</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              حسابك أدمن، ولا يملك متجراً تلقائياً. يمكنك إنشاء متجر لتبيع كأي بائع آخر، أو الذهاب لوحة الأدمن لإدارة المنصة.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/become-seller" className="bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity">
                أنشئ متجراً الآن
              </Link>
              <Link href="/admin" className="bg-white/5 border border-white/10 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                الذهاب إلى لوحة الأدمن
              </Link>
            </div>
          </div>
        </div>
      )
    }
    redirect('/become-seller')
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('id,title,slug,status,base_price,sales_count,view_count,created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  const activeCount  = listings?.filter(l => l.status === 'active').length ?? 0
  const pendingCount = listings?.filter(l => l.status === 'pending_review').length ?? 0
  const totalSales   = listings?.reduce((s, l) => s + (l.sales_count ?? 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/store/${store.slug}`} className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors whitespace-nowrap">عرض متجري العام ←</Link>
            <UserMenu email={user.email ?? ''} username={username} role={role} />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {welcome === '1' && (
          <div className="bg-[#2ECC9A]/10 border border-[#2ECC9A]/20 rounded-2xl px-5 py-4 mb-8 text-sm text-[#2ECC9A]">
            🎉 تم تفعيل متجرك «{store.name}» بنجاح! أضف أول منتج لك للبدء بالبيع.
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">{store.name}</h1>
            <p className="text-gray-500 text-sm">degitale.com/store/{store.slug}</p>
          </div>
          <Link href="/dashboard/new"
            className="bg-[#C9A84C] text-[#08080E] px-6 py-3 rounded-full font-black text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
            + أضف منتجاً جديداً
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'منتجات منشورة', value: activeCount, color: 'text-[#2ECC9A]' },
            { label: 'بانتظار المراجعة', value: pendingCount, color: 'text-[#E8A030]' },
            { label: 'إجمالي المبيعات', value: totalSales, color: 'text-[#C9A84C]' },
            { label: 'التقييم', value: store.rating_avg ? `${store.rating_avg.toFixed(1)}★` : '—', color: 'text-[#4F8EF7]' },
          ].map(k => (
            <div key={k.label} className="bg-[#111118] border border-white/5 rounded-2xl p-5">
              <div className={`text-2xl font-serif font-bold mb-1 ${k.color}`}>{k.value}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 text-sm font-semibold">منتجاتي</div>
          {listings && listings.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5 text-xs text-gray-500">
                <th className="text-right px-6 py-3 font-medium">المنتج</th>
                <th className="text-right px-6 py-3 font-medium">السعر</th>
                <th className="text-right px-6 py-3 font-medium">الحالة</th>
                <th className="text-right px-6 py-3 font-medium">المبيعات</th>
                <th className="text-right px-6 py-3 font-medium">المشاهدات</th>
              </tr></thead>
              <tbody>
                {listings.map(l => {
                  const st = STATUS_LABELS[l.status] ?? STATUS_LABELS.draft
                  return (
                    <tr key={l.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-3 font-medium truncate max-w-[220px]">{l.title}</td>
                      <td className="px-6 py-3 text-[#C9A84C] font-bold">${l.base_price?.toFixed(2) ?? '0.00'}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-400">{l.sales_count ?? 0}</td>
                      <td className="px-6 py-3 text-gray-400">{l.view_count ?? 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-gray-600 text-sm">
              لم تضف أي منتج بعد.{' '}
              <Link href="/dashboard/new" className="text-[#C9A84C] hover:underline">أضف أول منتج لك ←</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
