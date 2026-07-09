// app/page.tsx — الصفحة الرئيسية
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getServerLocale, getDictionary } from '@/lib/i18n'

function formatCount(n: number): string {
  if (n >= 1000) return `+${Math.floor(n / 1000)}K`
  if (n > 0) return String(n)
  return '0'
}

export default async function Home() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

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
  let ratingLabel = t.stats.new

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
    { num: productsLabel, label: t.stats.products },
    { num: sellersLabel,  label: t.stats.sellers },
    { num: ratingLabel,   label: t.stats.rating },
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
            <Link href="/shop"       className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.nav.shop}</Link>
            <Link href="/shop?type=service" className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.nav.services}</Link>
            <Link href="/sell"       className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.nav.sell}</Link>
            {user && <Link href="/orders" className="hover:text-[#C9A84C] transition-colors whitespace-nowrap">{t.nav.orders}</Link>}
          </div>

          {/* شريط البحث */}
          <form action="/shop" method="get" className="hidden sm:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <input
                name="q"
                type="text"
                placeholder={t.nav.searchPlaceholder}
                className="w-full bg-white/5 border border-white/10 rounded-full pr-4 pl-9 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors"
              />
              <button type="submit" aria-label="search"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C9A84C] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher current={locale} />
            {user ? (
              <UserMenu email={user.email ?? ''} username={username} role={role} />
            ) : (
              <Link href="/login"
                className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-all whitespace-nowrap">
                {t.nav.login}
              </Link>
            )}
          </div>
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
            {t.hero.badge}
          </div>

          <Image src="/logo.png" alt="DEGITALE" width={120} height={120} priority
            className="mb-8 rounded-3xl shadow-[0_0_50px_rgba(201,168,76,0.3)] animate-fade-up" style={{ animationDelay: '0.05s' }} />

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.15] tracking-tight animate-fade-up" style={{animationDelay:'0.1s'}}>
            {t.hero.titleLine1}
            <br />
            <span className="text-[#C9A84C] italic font-serif">{t.hero.titleLine2}</span>
          </h1>

          <p className="max-w-xl text-gray-400 text-lg md:text-xl mb-14 leading-relaxed font-light animate-fade-up" style={{animationDelay:'0.18s'}}>
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm animate-fade-up" style={{animationDelay:'0.26s'}}>
            <Link href="/shop"
              className="w-full sm:w-auto bg-[#C9A84C]
