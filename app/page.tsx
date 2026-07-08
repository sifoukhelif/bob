// app/page.tsx — الصفحة الرئيسية
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'

function formatCount(n: number): string {
  if (n >= 1000) return `+${Math.floor(n / 1000)}K`
  if (n > 0) return String(n)
  return '0'
}

export default async function Home() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined
  let username: string | null = null
  if (user) {
    const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
    username = profile?.username ?? null
  }

  let featuredProducts: any[] = []
  try {
    const { data } = await supabase
      .from('listings').select('id,title,slug,base_price,thumbnail_url,stores(name)')
      .eq('status', 'active').order('sales_count', { ascending: false }).limit(4)
    featuredProducts = data ?? []
  } catch { featuredProducts = [] }

  let productsLabel = '0'
  let sellersLabel = '0'
  let ratingLabel = 'جديد 🌱'

  try {
    const { count: productsCount } = await supabase
      .from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active')
    productsLabel = formatCount(productsCount ?? 0)

    const { count: sellersCount } = await supabase
      .from('stores').select('*', { count: 'exact', head: true })
    sellersLabel = formatCount(sellersCount ?? 0)

    const { data: ratedStores } = await supabase
      .from('stores').select('rating_avg,rating_count').gt('rating_count', 0)

    if (ratedStores && ratedStores.length > 0) {
      const totalWeight = ratedStores.reduce((s, r) => s + (r.rating_count ?? 0), 0)
      const weightedSum = ratedStores.reduce((s, r) => s + (r.rating_avg ?? 0) * (r.rating_count ?? 0), 0)
      if (totalWeight > 0) ratingLabel = `${(weightedSum / totalWeight).toFixed(1)}★`
    }
  } catch { /* نُبقي القيم الافتراضية عند أي خطأ بدل كسر الصفحة */ }

  const stats = [
    { num: productsLabel, label: 'منتج رقمي' },
    { num: sellersLabel,  label: 'بائع موثق' },
    { num: ratingLabel,   label: 'تقييم المنصة' },
  ]

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Logo size="md" />
            <span className="text-xl font-bold tracking-widest uppercase hidden lg:block">DEGITALE</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 shrink-0">
            <Link href="/shop"       className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">المتجر</Link>
            <Link href="/shop?type=service" className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">الخدمات</Link>
            <Link href="/sell"       className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">ابدأ البيع</Link>
            {user && <Link href="/orders" className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">طلباتي</Link>}
          </div>

          {/* شريط البحث */}
          <form action="/shop" method="get" className="hidden sm:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <input
                name="q"
                type="text"
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
            <Link href="/login"
              className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-all shrink-0 whitespace-nowrap">
              دخول
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-52 pb-36 flex flex-col items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#C9A84C]/8 blur-[140px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#4F8EF7]/4 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-[#C9A84C] text-[10px] font-black tracking-[0.3em] uppercase animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] inline-block" />
            مستقبل التجارة الرقمية الحصرية
          </div>

          <Image src="/logo.png" alt="DEGITALE" width={120} height={120} priority
            className="mb-8 rounded-3xl shadow-[0_0_50px_rgba(201,168,76,0.3)] animate-fade-up" style={{ animationDelay: '0.05s' }} />

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.15] tracking-tight animate-fade-up" style={{animationDelay:'0.1s'}}>
            امتلك أفضل
            <br />
            <span className="text-[#C9A84C] italic font-serif">الأصول الرقمية</span>
          </h1>

          <p className="max-w-xl text-gray-400 text-lg md:text-xl mb-14 leading-relaxed font-light animate-fade-up" style={{animationDelay:'0.18s'}}>
            الوجهة الأولى للمبدعين لبيع وشراء القوالب، الكتب الإلكترونية، والحلول البرمجية الحصرية.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm animate-fade-up" style={{animationDelay:'0.26s'}}>
            <Link href="/shop"
              className="w-full sm:w-auto bg-[#C9A84C] text-[#08080E] px-12 py-4 rounded-full font-black text-base hover:scale-105 hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] transition-all text-center whitespace-nowrap">
              تصفح المنتجات
            </Link>
            <Link href="/sell"
              className="w-full sm:w-auto px-12 py-4 rounded-full border border-white/10 font-bold text-base hover:bg-white/5 transition-all text-white text-center whitespace-nowrap">
              ابدأ البيع ←
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-3 gap-4 bg-[#111118] border border-white/5 rounded-3xl px-8 py-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-2xl md:text-3xl font-bold text-[#C9A84C]">{s.num}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-serif font-bold mb-2">أحدث الإصدارات</h2>
            <p className="text-gray-500 text-sm italic">مختارات حصرية تمت مراجعتها يدوياً</p>
          </div>
          <Link href="/shop" className="text-[#C9A84C] font-bold text-sm hover:underline whitespace-nowrap shrink-0">
            تصفح المتجر بالكامل ←
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? featuredProducts.map(p => (
            <Link key={p.id} href={`/product/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#12121A] border border-white/5 group-hover:border-[#C9A84C]/35 transition-all duration-500 shadow-xl">
                {p.thumbnail_url
                  ? <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover opacity-65 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">📦</div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-[#08080E] via-[#08080E]/25 to-transparent" />
                <div className="absolute bottom-6 left-5 right-5">
                  <div className="text-[9px] text-[#C9A84C] font-black uppercase tracking-widest mb-1.5 opacity-80">
                    {(p.stores as any)?.name ?? 'DEGITALE'}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-2 group-hover:text-[#C9A84C] transition-colors">
                    {p.title}
                  </h3>
                  <div className="font-serif font-black text-lg text-white">${p.base_price?.toFixed(2)}</div>
                </div>
              </div>
            </Link>
          )) : (
            <div className="col-span-full text-center py-20 text-gray-600 text-sm">
              لا توجد منتجات منشورة بعد.{' '}
              <Link href="/sell" className="text-[#C9A84C] hover:underline">كن أول بائع ←</Link>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-16 bg-[#06060A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#C9A84C] rounded flex items-center justify-center text-[#08080E] font-bold text-xs">D</div>
              <span className="font-bold tracking-widest uppercase text-sm">Degitale</span>
            </div>
            <span className="text-xs text-gray-600">© 2026 جميع الحقوق محفوظة</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
            {[['الشروط','/terms'],['الخصوصية','/privacy'],['الدعم','/contact']].map(([label,href]) => (
              <Link key={href} href={href} className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
