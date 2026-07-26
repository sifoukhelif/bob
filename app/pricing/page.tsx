// app/pricing/page.tsx
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
  return { title: t.pricing.title, description: t.pricing.subtitle }
}

export default async function PricingPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const sellerPoints = [t.pricing.sellerPoint1, t.pricing.sellerPoint2, t.pricing.sellerPoint3, t.pricing.sellerPoint4]
  const buyerPoints = [t.pricing.buyerPoint1, t.pricing.buyerPoint2, t.pricing.buyerPoint3, t.pricing.buyerPoint4]
  const faqs = [
    { q: t.pricing.faq1q, a: t.pricing.faq1a },
    { q: t.pricing.faq2q, a: t.pricing.faq2a },
    { q: t.pricing.faq3q, a: t.pricing.faq3a },
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
            <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{t.pricing.homeLink}</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* HERO */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-[#C9A84C] text-[10px] font-black tracking-[0.3em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] inline-block" />
            {t.pricing.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">{t.pricing.title}</h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg leading-relaxed">{t.pricing.subtitle}</p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[#111118] border border-white/5 rounded-3xl p-8 md:p-10">
            <h2 className="text-sm font-bold text-gray-400 mb-4">{t.pricing.sellerCardTitle}</h2>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-serif font-black text-[#C9A84C]">{t.pricing.sellerCommission}</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">{t.pricing.sellerCommissionLabel}</p>
            <ul className="flex flex-col gap-3">
              {sellerPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-[#2ECC9A] mt-0.5">✓</span>{p}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#111118] border border-white/5 rounded-3xl p-8 md:p-10">
            <h2 className="text-sm font-bold text-gray-400 mb-4">{t.pricing.buyerCardTitle}</h2>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-serif font-black text-white">{t.pricing.buyerFree}</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">{t.pricing.buyerFreeLabel}</p>
            <ul className="flex flex-col gap-3">
              {buyerPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-[#2ECC9A] mt-0.5">✓</span>{p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* مساحة إعلانية */}
        <div className="mb-16">
          <AdBanner label={t.ads.banner} />
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-serif font-bold mb-8 text-center">{t.pricing.faqTitle}</h2>
        <div className="flex flex-col gap-4 mb-20 max-w-2xl mx-auto">
          {faqs.map((f, i) => (
            <div key={i} className="bg-[#111118] border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold mb-2">{f.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-[#111118] border border-white/5 rounded-3xl p-10">
          <h2 className="text-2xl font-serif font-bold mb-6">{t.pricing.ctaTitle}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sell"
              className="w-full sm:w-auto bg-[#C9A84C] text-[#08080E] px-10 py-3.5 rounded-full font-black text-sm hover:opacity-90 transition-opacity text-center">
              {t.pricing.ctaSell}
            </Link>
            <Link href="/shop"
              className="w-full sm:w-auto px-10 py-3.5 rounded-full border border-white/10 font-bold text-sm hover:bg-white/5 transition-all text-center">
              {t.pricing.ctaShop}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
