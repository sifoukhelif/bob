// app/dashboard/orders/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.sellerOrders.title }
}

export default async function SellerOrdersPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard/orders')

  // نتأكد من ملكية المتجر بجلسة المستخدم الموثّقة، قبل ما نستخدم admin client لجلب بيانات المشترين
  const { data: store } = await supabase.from('stores').select('id,name').eq('owner_id', user.id).maybeSingle()
  if (!store) redirect('/dashboard')

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  const role = user.app_metadata?.role as string | undefined

  // admin client هنا آمن لأن كل استعلام مقيّد صراحة بـ store.id المتحقّق منه أعلاه من جلسة موثوقة، مو من أي مدخل خارجي
  const admin = createAdminClient()
  const { data: myListingIds } = await admin.from('listings').select('id').eq('store_id', store.id)
  const listingIds = (myListingIds ?? []).map(l => l.id)

  let rows: any[] = []
  if (listingIds.length > 0) {
    const { data } = await admin
      .from('order_items')
      .select('id,unit_price,created_at,listings(title),orders(status,buyer_id,users:buyer_id(email))')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })
      .limit(200)
    rows = data ?? []
  }

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.sellerOrders.backToDashboard}</Link>
            <UserMenu email={user.email ?? ''} username={profile?.username ?? null} role={role} />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl font-serif font-bold mb-8">{t.sellerOrders.title}</h1>

        <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
          {rows.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5 text-xs text-gray-500">
                <th className="text-right px-6 py-3 font-medium">{t.sellerOrders.colProduct}</th>
                <th className="text-right px-6 py-3 font-medium">{t.sellerOrders.colBuyer}</th>
                <th className="text-right px-6 py-3 font-medium">{t.sellerOrders.colAmount}</th>
                <th className="text-right px-6 py-3 font-medium">{t.sellerOrders.colDate}</th>
                <th className="text-right px-6 py-3 font-medium">{t.sellerOrders.colStatus}</th>
              </tr></thead>
              <tbody>
                {rows.map((row) => {
                  const order = row.orders as any
                  const amount = row.unit_price ?? 0
                  const statusLabel = amount === 0
                    ? t.sellerOrders.statusFree
                    : order?.status === 'paid' || order?.status === 'completed'
                      ? t.sellerOrders.statusPaid
                      : t.sellerOrders.statusPending
                  return (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-3 font-medium truncate max-w-[220px]">{(row.listings as any)?.title}</td>
                      <td className="px-6 py-3 text-gray-400" dir="ltr">{order?.users?.email ?? '—'}</td>
                      <td className="px-6 py-3 text-[#C9A84C] font-bold">{amount > 0 ? `$${amount.toFixed(2)}` : '—'}</td>
                      <td className="px-6 py-3 text-gray-500 text-xs">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-bold bg-white/10 text-gray-300">{statusLabel}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-gray-600 text-sm">{t.sellerOrders.emptyText}</div>
          )}
        </div>
      </main>
    </div>
  )
}
