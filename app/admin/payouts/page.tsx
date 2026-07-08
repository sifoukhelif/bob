// app/admin/payouts/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'أرصدة البائعين | Admin' }

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'حوالة بنكية',
  payoneer: 'Payoneer',
  other: 'أخرى',
}

async function markPaid(formData: FormData) {
  'use server'
  const ids = formData.getAll('itemId') as string[]
  if (ids.length === 0) return
  const admin = createAdminClient()
  await admin.from('order_items')
    .update({ payout_status: 'paid', payout_paid_at: new Date().toISOString() })
    .in('id', ids)
  revalidatePath('/admin/payouts')
}

export default async function AdminPayoutsPage() {
  const admin = createAdminClient()

  const { data: pendingItems } = await admin
    .from('order_items')
    .select(`
      id, net_amount, created_at,
      listings ( title, store_id,
        stores ( id, name, owner_id,
          users:owner_id ( email, payout_method, payout_details )
        )
      )
    `)
    .eq('payout_status', 'pending')
    .gt('net_amount', 0)

  type Group = {
    storeId: string
    storeName: string
    email: string
    method: string | null
    details: string | null
    total: number
    itemIds: string[]
  }

  const groups = new Map<string, Group>()
  for (const item of pendingItems ?? []) {
    const listing = item.listings as any
    const store = listing?.stores as any
    const seller = store?.users as any
    if (!store) continue
    const key = store.id
    if (!groups.has(key)) {
      groups.set(key, {
        storeId: store.id,
        storeName: store.name,
        email: seller?.email ?? '—',
        method: seller?.payout_method ?? null,
        details: seller?.payout_details ?? null,
        total: 0,
        itemIds: [],
      })
    }
    const g = groups.get(key)!
    g.total += Number(item.net_amount ?? 0)
    g.itemIds.push(item.id)
  }

  const rows = Array.from(groups.values()).sort((a, b) => b.total - a.total)

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-1">أرصدة البائعين المستحقة</h1>
      <p className="text-gray-500 text-sm mb-8">{rows.length} بائع لديه مستحقات غير مدفوعة</p>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-gray-600 text-sm bg-[#111118] border border-white/5 rounded-2xl">
          لا توجد مستحقات معلّقة حالياً 🎉
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map(g => (
            <div key={g.storeId} className="bg-[#111118] border border-white/5 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div>
                  <div className="font-bold text-sm">{g.storeName}</div>
                  <div className="text-xs text-gray-500 font-mono">{g.email}</div>
                </div>
                <div className="text-2xl font-serif font-bold text-[#C9A84C]">
                  ${g.total.toFixed(2)}
                </div>
              </div>

              <div className="bg-black/30 rounded-xl px-4 py-3 mb-4 text-xs">
                <div className="text-gray-500 mb-1">وسيلة الاستلام</div>
                {g.method ? (
                  <>
                    <div className="font-bold mb-1">{METHOD_LABELS[g.method] ?? g.method}</div>
                    <div className="text-gray-400 whitespace-pre-wrap">{g.details}</div>
                  </>
                ) : (
                  <div className="text-red-400">⚠️ البائع لم يدخل بيانات استلام بعد</div>
                )}
              </div>

              <form action={markPaid}>
                {g.itemIds.map(id => (
                  <input key={id} type="hidden" name="itemId" value={id} />
                ))}
                <button type="submit"
                  className="bg-[#2ECC9A]/10 text-[#2ECC9A] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#2ECC9A]/20 transition-colors">
                  ✓ تم التحويل — تعليم كمدفوع
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
