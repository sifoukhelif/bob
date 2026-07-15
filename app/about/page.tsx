// app/about/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdBanner } from '@/components/ad-slot'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.about.title, description: t.about.subtitle }
}

export default async function AboutPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const trustPoints = [
    { title: t.about.trust1Title, text: t.about.trust1Text, icon: '🔒' },
    { title: t.about.trust2Title, text: t.about.trust2Text, icon: '🔗' },
    { title: t.about.trust3Title, text: t.about.trust3Text, icon: '⚡' },
  ]

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">
              {locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home'}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* HERO */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-[#C9A84C] text-[10px] font-black tracking-[0.3em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] inline-block" />
            {t.about.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">{t.about.title}</h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg leading-relaxed">{t.about.subtitle}</p>
        </div>

        {/* MISSION */}
        <div className="bg-[#111118] border border-white/5 rounded-3xl p-8 md:p-12 mb-12 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4 text-[#C9A84C]">{t.about.missionTitle}</h2>
          <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">{t.about.missionText}</p>
        </div>

        {/* مساحة إعلانية */}
        <div className="mb-16">
          <AdBanner label={t.ads.banner} />
        </div>

        {/* HOW IT WORKS */}
        <h2 className="text-2xl font-serif font-bold mb-8 text-center">{t.about.howItWorksTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-8">
            <div className="text-3xl mb-4">🛒</div>
            <h3 className="text-lg font-bold mb-2">{t.about.buyerStepTitle}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t.about.buyerStepText}</p>
          </div>
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-8">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-lg font-bold mb-2">{t.about.sellerStepTitle}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t.about.sellerStepText}</p>
          </div>
        </div>

        {/* TRUST */}
        <h2 className="text-2xl font-serif font-bold mb-8 text-center">{t.about.trustTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {trustPoints.map((p) => (
            <div key={p.title} className="text-center">
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="text-sm font-bold mb-2">{p.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-[#111118] border border-white/5 rounded-3xl p-10">
          <h2 className="text-2xl font-serif font-bold mb-6">{t.about.ctaTitle}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/shop"
              className="w-full sm:w-auto bg-[#C9A84C] text-[#08080E] px-10 py-3.5 rounded-full font-black text-sm hover:opacity-90 transition-opacity text-center">
              {t.about.ctaShop}
            </Link>
            <Link href="/sell"
              className="w-full sm:w-auto px-10 py-3.5 rounded-full border border-white/10 font-bold text-sm hover:bg-white/5 transition-all text-center">
              {t.about.ctaSell}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
