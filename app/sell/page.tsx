// app/sell/page.tsx
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
export const metadata = { title: 'ابدأ البيع' }

const STEPS = [
  { n: '01', title: 'أنشئ متجرك', desc: 'اسم، رابط مخصص، ونبذة تعريفية — يستغرق دقيقتين.' },
  { n: '02', title: 'أضف منتجك أو خدمتك', desc: 'رفع الملفات، تحديد السعر، وكتابة الوصف.' },
  { n: '03', title: 'مراجعة سريعة', desc: 'يراجع فريقنا المنتج للتأكد من جودته قبل النشر.' },
  { n: '04', title: 'استلم أموالك', desc: 'تحويل مباشر عبر Stripe بعد كل عملية بيع، بعد خصم عمولة المنصة.' },
]

export default async function SellPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  let username: string | null = null

  let ctaHref = '/login?redirectTo=/sell'
  let ctaLabel = 'سجّل دخولك للبدء'
  if (user) {
    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle()
    const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
    username = profile?.username ?? null
    if (store) {
      ctaHref = '/dashboard'
      ctaLabel = 'اذهب إلى لوحة تحكم البائع ←'
    } else {
      ctaHref = '/become-seller'
      ctaLabel = 'فعّل حساب البائع الآن ←'
    }
  }

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Logo size="md" />
            <span className="text-xl font-bold tracking-widest uppercase hidden sm:block">DEGITALE</span>
          </Link>
          {user ? (
            <UserMenu email={user.email ?? ''} username={username} role={user.app_metadata?.role as string | undefined} />
          ) : (
            <Link href="/shop" className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">المتجر</Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-44 pb-28 flex flex-col items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#C9A84C]/8 blur-[140px] rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-[#C9A84C] text-[10px] font-black tracking-[0.3em] uppercase">
            للمبدعين والمستقلين
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.15] tracking-tight">
            حوّل خبرتك <span className="text-[#C9A84C] italic font-serif">إلى دخل</span>
          </h1>
          <p className="max-w-lg text-gray-400 text-lg mb-10 leading-relaxed font-light">
            بِع القوالب، الكتب الإلكترونية، الأكواد، أو قدّم خدماتك الاستشارية لآلاف المشترين المهتمين.
          </p>
          <Link href={ctaHref}
            className="bg-[#C9A84C] text-[#08080E] px-12 py-4 rounded-full font-black text-base hover:scale-105 hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] transition-all whitespace-nowrap">
            {ctaLabel}
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-3 gap-4 bg-[#111118] border border-white/5 rounded-3xl px-8 py-6">
          {[
            { num: '80%', label: 'تحتفظ به من كل عملية بيع' },
            { num: '48س', label: 'متوسط وقت مراجعة المنتج' },
            { num: '+3K', label: 'بائع موثق على المنصة' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-2xl md:text-3xl font-bold text-[#C9A84C]">{s.num}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <h2 className="text-3xl font-serif font-bold mb-12 text-center">كيف تبدأ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map(s => (
            <div key={s.n} className="bg-[#111118] border border-white/5 rounded-2xl p-6 flex gap-4">
              <div className="font-serif text-3xl font-black text-[#C9A84C]/40 shrink-0">{s.n}</div>
              <div>
                <h3 className="font-bold mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 bg-[#06060A] text-center text-xs text-gray-600">
        © 2026 DEGITALE — جميع الحقوق محفوظة
      </footer>
    </div>
  )
}
