// app/contact/page.tsx
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { ContactForm } from '@/components/contact-form'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.contact.pageTitle }
}

export default async function ContactPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{t.contact.homeLink}</Link>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 pt-28 pb-24">
        <div className="text-center mb-8">
          <div className="text-5xl mb-6">💬</div>
          <h1 className="text-3xl font-serif font-bold mb-3">{t.contact.title}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{t.contact.subtitle}</p>
        </div>

        <ContactForm locale={locale} />

        <p className="text-center text-xs text-gray-600 mt-6">
          {t.contact.form.orEmailDirect}{' '}
          <a href="mailto:support@degitale.com" className="text-[#C9A84C] hover:underline" dir="ltr">
            support@degitale.com
          </a>
        </p>
      </div>
    </div>
  )
}
