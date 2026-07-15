// app/faq/faq-content.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdBanner } from '@/components/ad-slot'
import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/i18n'

export function FaqContent({ locale, t }: { locale: Locale; t: ReturnType<typeof getDictionary> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const items = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
    { q: t.faq.q6, a: t.faq.a6 },
  ]

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-[#C9A84C] text-[10px] font-black tracking-[0.3em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] inline-block" />
            {t.faq.badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{t.faq.title}</h1>
          <p className="text-gray-500 text-sm">{t.faq.subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 mb-12">
          {items.map((item, i) => {
            const open = openIndex === i
            return (
              <div key={i} className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span className="font-bold text-sm">{item.q}</span>
                  <span className={`text-[#C9A84C] text-xl shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
                </button>
                {open && (
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">{item.a}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* مساحة إعلانية */}
        <AdBanner label={t.ads.banner} className="mb-12" />

        <div className="text-center bg-[#111118] border border-white/5 rounded-2xl p-8">
          <p className="text-gray-500 text-sm mb-4">
            {locale === 'ar' ? 'لم تجد إجابتك؟' : locale === 'fr' ? "Vous n'avez pas trouvé votre réponse ?" : "Didn't find your answer?"}
          </p>
          <a href="mailto:support@degitale.com"
            className="bg-[#C9A84C] text-[#08080E] px-8 py-3 rounded-full font-black text-sm hover:opacity-90 transition-opacity inline-block">
            support@degitale.com
          </a>
        </div>
      </main>
    </div>
  )
}
