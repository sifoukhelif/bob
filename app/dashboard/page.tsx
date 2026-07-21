// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DeleteListingButton } from './delete-listing-button'
import { RevenueChart } from '@/components/revenue-chart'
import { AdBanner } from '@/components/ad-slot'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

export const metadata = { title: 'لوحة تحكم البائع' }

async function deleteListing(formData: FormData) {
  'use server'
  const { createServerClient } = await import('@/lib/supabase/server')
  const { revalidatePath } = await import('next/cache')
  const id = formData.get('id') as string
  const storeId = formData.get('storeId') as string
  const supabase = await createServerClient()

  await supabase.from('listing_files').delete().eq('listing_id', id)
  await supabase.from('listings').delete().eq('id', id).eq('store_id', storeId)

  revalidatePath('/dashboard')
}

export default async function DashboardPage({
  searchParams,
}: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    active:          { label: t.dashboard.statusActive,  color: 'bg-[#2ECC9A]/10 text-[#2ECC9A]' },
    pending_review:  { label: t.dashboard.statusPending, color: 'bg-[#E8A030]/10 text-[#E8A030]' },
    rejected:        { label: t.dashboard.statusRejected, color: 'bg-red-500/10 text-red-400' },
    paused:          { label: t.dashboard.statusPaused,  color: 'bg-white/10 text-gray-400' },
    draft:           { label: t.dashboard.statusDraft,   color: 'bg-white/10 text-gray-400' },
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard')

  const { data: store } = await supabase.from('stores').select('id,name,slug,bio,sales_count,rating_avg').eq('owner_id', user.id).maybeSingle()
  const role = user.app_metadata?.role as string | undefined
  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  const username = profile?.username ?? null

  if (!store) {
    if (role === 'admin') {
      return (
        <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="flex justify-center mb-4">
              <LanguageSwitcher current={locale} />
            </div>
            <div className="text-5xl mb-6">🏪</div>
            <h1 className="text-2xl font-serif font-bold mb-3">{t.dashboard.noStoreAdminTitle}</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {t.dashboard.noStoreAdminDesc}
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/become-seller" className="bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity">
                {t.dashboard.createStoreNow}
              </Link>
              <Link href="/admin" className="bg-white/5 border border-white/10 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                {t.dashboard.goToAdmin}
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

  // بيانات الأرباح — نستخدم admin client لأن order_items ليس له سياسة قراءة للبائع،
  // لكن الاستعلام مقيّد صراحة بمعرّفات منتجات مالكها الموثّق (store.id أعلاه)
  let totalRevenue = 0, monthRevenue = 0
  let revenuePoints: { date: string; amount: number }[] = []
  const listingIds = (listings ?? []).map(l => l.id)

  if (listingIds.length > 0) {
    const admin = createAdminClient()
    const { data: orderItems } = await admin
      .from('order_items')
      .select('net_amount, created_at')
      .in('listing_id', listingIds)
      .not('net_amount', 'is', null)

    const items = orderItems ?? []
    totalRevenue = items.reduce((s, o) => s + (o.net_amount ?? 0), 0)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    monthRevenue = items
      .filter(o => new Date(o.created_at) >= startOfMonth)
      .reduce((s, o) => s + (o.net_amount ?? 0), 0)

    const days: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      days[d.toISOString().slice(0, 10)] = 0
    }
    for (const o of items) {
      const key = new Date(o.created_at).toISOString().slice(0, 10)
      if (key in days) days[key] += (o.net_amount ?? 0)
    }
    revenuePoints = Object.entries(days).map(([date, amount]) => ({ date, amount }))
  }

  const bestSeller = (listings ?? []).reduce((best: any, l: any) =>
    (l.sales_count ?? 0) > (best?.sales_count ?? 0) ? l : best, null as any)

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
            <Link href="/dashboard/orders" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.sellerOrders.navLink}</Link>
            <Link href="/dashboard/store-settings" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.storeSettings.navLink}</Link>
            <Link href="/dashboard/payout-settings" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.dashboard.payoutSettingsLink}</Link>
            <Link href={`/store/${store.slug}`} className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.dashboard.viewStoreLink}</Link>
            <UserMenu email={user.email ?? ''} username={username} role={role} />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {welcome === '1' && (
          <div className="bg-[#2ECC9A]/10 border border-[#2ECC9A]/20 rounded-2xl px-5 py-4 mb-8 text-sm text-[#2ECC9A]">
            {t.dashboard.welcomePrefix}{store.name}{t.dashboard.welcomeSuffix}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">{store.name}</h1>
            <p className="text-gray-500 text-sm">degitale.com/store/{store.slug}</p>
          </div>
          <Link href="/dashboard/new"
            className="bg-[#C9A84C] text-[#08080E] px-6 py-3 rounded-full font-black text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
            {t.dashboard.addProductButton}
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: t.dashboard.statActive, value: activeCount, color: 'text-[#2ECC9A]' },
            { label: t.dashboard.statPending, value: pendingCount, color: 'text-[#E8A030]' },
            { label: t.dashboard.statSales, value: totalSales, color: 'text-[#C9A84C]' },
            { label: t.dashboard.statRating, value: store.rating_avg ? `${store.rating_avg.toFixed(1)}★` : '—', color: 'text-[#4F8EF7]' },
          ].map(k => (
            <div key={k.label} className="bg-[#111118] border border-white/5 rounded-2xl p-5">
              <div className={`text-2xl font-serif font-bold mb-1 ${k.color}`}>{k.value}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
            <div className="text-2xl font-serif font-bold mb-1 text-[#C9A84C]">${totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-gray-500">{t.dashboard.statTotalRevenue}</div>
          </div>
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
            <div className="text-2xl font-serif font-bold mb-1 text-[#2ECC9A]">${monthRevenue.toFixed(2)}</div>
            <div className="text-xs text-gray-500">{t.dashboard.statMonthRevenue}</div>
          </div>
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
            <div className="text-sm font-bold mb-1 truncate">{bestSeller?.title ?? t.dashboard.noBestSeller}</div>
            <div className="text-xs text-gray-500">{t.dashboard.statBestSeller}</div>
          </div>
        </div>

        <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 mb-10">
          <div className="text-sm font-semibold mb-4">{t.dashboard.revenueChartTitle}</div>
          <RevenueChart data={revenuePoints} />
        </div>

        {/* مساحة إعلانية */}
        <div className="mb-10">
          <AdBanner label={t.ads.banner} className="h-16 md:h-20" />
        </div>

        <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 text-sm font-semibold">{t.dashboard.myProductsTitle}</div>
          {listings && listings.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5 text-xs text-gray-500">
                <th className="text-right px-6 py-3 font-medium">{t.dashboard.colProduct}</th>
                <th className="text-right px-6 py-3 font-medium">{t.dashboard.colPrice}</th>
                <th className="text-right px-6 py-3 font-medium">{t.dashboard.colStatus}</th>
                <th className="text-right px-6 py-3 font-medium">{t.dashboard.colSales}</th>
                <th className="text-right px-6 py-3 font-medium">{t.dashboard.colViews}</th>
                <th className="text-right px-6 py-3 font-medium">{t.dashboard.colActions}</th>
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
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/dashboard/edit/${l.id}`} className="text-xs text-[#C9A84C] hover:underline whitespace-nowrap">
                            {t.dashboard.editLink}
                          </Link>
                          <DeleteListingButton
                            listingId={l.id}
                            storeId={store.id}
                            listingTitle={l.title}
                            deleteListing={deleteListing}
                            locale={locale}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-gray-600 text-sm">
              {t.dashboard.emptyText}{' '}
              <Link href="/dashboard/new" className="text-[#C9A84C] hover:underline">{t.dashboard.emptyCta}</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
