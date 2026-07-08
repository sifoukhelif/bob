// app/shop/page.tsx
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'المتجر', description: 'اكتشف آلاف المنتجات والخدمات الرقمية' }

export default async function ShopPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; cat?: string; type?: string; page?: string }> }) {
  const { q, cat, type, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1'))
  const perPage = 12
  const from = (currentPage - 1) * perPage
  const to   = from + perPage - 1

  let products: any[] = [], count = 0, user: any = null, role: string | undefined, username: string | null = null
  try {
    const supabase = await createServerClient()
    const { data: userData } = await supabase.auth.getUser()
    user = userData.user
    role = user?.app_metadata?.role as string | undefined
    if (user) {
      const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
      username = profile?.username ?? null
    }
    const categoriesEmbed = cat ? 'categories!inner(slug)' : 'categories(slug)'
    let query = supabase.from('listings')
      .select(`id,title,slug,base_price,thumbnail_url,type,rating_avg,sales_count,stores(name),${categoriesEmbed}`, { count: 'exact' })
      .eq('status', 'active')
      .order('sales_count', { ascending: false })
      .range(from, to)
    if (q)    query = query.ilike('title', `%${q}%`)
    if (type) query = query.eq('type', type)
    if (cat)  query = query.eq('categories.slug', cat)
    const { data, count: c } = await query
    products = data ?? []; count = c ?? 0
  } catch {}

  const totalPages = Math.ceil(count / perPage)

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden lg:block">DEGITALE</span>
          </Link>

          <form action="/shop" method="get" className="hidden sm:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <input
                name="q"
                type="text"
                defaultValue={q}
                placeholder="ابحث عن منتج…"
                className="w-full bg-white/5 border border-white/10 rounded-full pr-4 pl-9 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors"
              />
              <button type="submit" aria-label="بحث"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C9A84C] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          {user ? (
            <UserMenu email={user.email ?? ''} username={username} role={role} />
          ) : (
            <Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors shrink-0">دخول</Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold mb-2">المتجر</h1>
          <p className="text-gray-500 text-sm mb-6">{count.toLocaleString('ar-SA')} منتج وخدمة</p>
          {q && (
            <p className="text-xs text-gray-500 mb-4">
              نتائج البحث عن: <span className="text-[#C9A84C] font-bold">"{q}"</span>
              {' — '}
              <Link href="/shop" className="hover:underline">إلغاء البحث</Link>
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          <Link href="/shop" className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!cat && !type ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>الكل</Link>
          <Link href="/shop?type=service" className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${type === 'service' ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>خدمات</Link>
          {['ui-ux-kits','ebooks','code-scripts'].map(c => (
            <Link key={c} href={`/shop?cat=${c}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${cat === c ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>
              {c === 'ui-ux-kits' ? 'واجهات UI' : c === 'ebooks' ? 'كتب' : 'أكواد'}
            </Link>
          ))}
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
              {products.map(p => (
                <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#12121A] border border-white/5 group-hover:border-[#C9A84C]/30 transition-all duration-500">
                    {p.thumbnail_url
                      ? <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover opacity-65 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📦</div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080E] via-[#08080E]/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-[9px] text-[#C9A84C] font-black uppercase tracking-widest mb-1 opacity-80">{(p.stores as any)?.name ?? 'DEGITALE'}</div>
                      <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1.5">{p.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-black text-sm text-[#C9A84C]">${p.base_price?.toFixed(2)}</span>
                        {p.rating_avg && <span className="text-[10px] text-gray-500">★ {p.rating_avg.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(p => (
                  <Link key={p}
                    href={`/shop?${new URLSearchParams({ ...(q ? { q } : {}), ...(cat ? { cat } : {}), ...(type ? { type } : {}), page: String(p) })}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${p === currentPage ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 text-gray-600">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-sm">لا توجد نتائج — جرب كلمة بحث أخرى</div>
          </div>
        )}
      </main>
    </div>
  )
}
