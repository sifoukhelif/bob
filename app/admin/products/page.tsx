// app/admin/products/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
export const metadata = { title: 'مراجعة المنتجات | Admin' }

async function approveProduct(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  await admin.from('listings').update({ status: 'active', published_at: new Date().toISOString() }).eq('id', id)
  if (user?.id) {
    await admin.from('admin_logs').insert({ admin_id: user.id, action: 'approve_product', target_type: 'listing', target_id: id })
  }
  revalidatePath('/admin/products')
}

async function rejectProduct(formData: FormData) {
  'use server'
  const id     = formData.get('id') as string
  const reason = formData.get('reason') as string
  const admin  = createAdminClient()
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  await admin.from('listings').update({ status: 'rejected', rejection_reason: reason }).eq('id', id)
  if (user?.id) {
    await admin.from('admin_logs').insert({ admin_id: user.id, action: 'reject_product', target_type: 'listing', target_id: id, metadata: { reason } })
  }
  revalidatePath('/admin/products')
}

export default async function AdminProductsPage() {
  const admin = createAdminClient()

  const { data: pending } = await admin
    .from('listings')
    .select('id,title,base_price,type,created_at,thumbnail_url,description,stores(name)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  const { data: recent } = await admin
    .from('listings')
    .select('id,title,status,created_at,rejection_reason,stores(name)')
    .in('status', ['active','rejected'])
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-1">مراجعة المنتجات</h1>
      <p className="text-gray-500 text-sm mb-8">{pending?.length ?? 0} منتج بانتظار الموافقة</p>

      {/* Pending */}
      {pending && pending.length > 0 ? (
        <div className="flex flex-col gap-4 mb-10">
          {pending.map(product => (
            <div key={product.id} className="bg-[#111118] border border-[#E8A030]/15 rounded-2xl p-5 flex gap-4 items-start">
              <div className="w-16 h-16 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden">
                {product.thumbnail_url
                  ? <img src={product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold mb-1 truncate">{product.title}</div>
                <div className="text-xs text-gray-500 mb-2">
                  {(product.stores as any)?.name} · ${product.base_price?.toFixed(2)} ·
                  {product.type === 'product' ? ' منتج رقمي' : ' خدمة'} ·
                  {new Date(product.created_at).toLocaleDateString('ar-SA')}
                </div>
                {product.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                )}
                <div className="flex gap-3 flex-wrap">
                  <form action={approveProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <button type="submit" className="bg-[#2ECC9A] text-[#08080E] text-xs font-black px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                      ✓ قبول ونشر
                    </button>
                  </form>
                  <form action={rejectProduct} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={product.id} />
                    <input type="text" name="reason" placeholder="سبب الرفض…" required
                      className="bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-full text-white placeholder-gray-600 outline-none focus:border-red-500/30 w-44" />
                    <button type="submit" className="bg-red-500/80 text-white text-xs font-black px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                      ✕ رفض
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111118] border border-white/5 rounded-2xl p-12 text-center text-gray-500 text-sm mb-10">
          ✓ لا توجد منتجات بانتظار المراجعة
        </div>
      )}

      {/* Recent decisions */}
      {recent && recent.length > 0 && (
        <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 text-sm font-semibold">آخر القرارات</div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-xs text-gray-500">
              <th className="text-right px-5 py-3 font-medium">المنتج</th>
              <th className="text-right px-5 py-3 font-medium">المتجر</th>
              <th className="text-right px-5 py-3 font-medium">الحالة</th>
              <th className="text-right px-5 py-3 font-medium">السبب</th>
            </tr></thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-5 py-3 text-sm truncate max-w-[180px]">{p.title}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{(p.stores as any)?.name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.status === 'active' ? 'bg-[#2ECC9A]/10 text-[#2ECC9A]' : 'bg-red-500/10 text-red-400'}`}>
                      {p.status === 'active' ? 'مقبول' : 'مرفوض'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                    {p.rejection_reason ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
