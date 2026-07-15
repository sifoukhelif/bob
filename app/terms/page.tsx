// app/terms/page.tsx
import { LegalLayout } from '../legal-layout'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.terms.title }
}

export default async function TermsPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const { terms } = t

  return (
    <LegalLayout title={terms.title} homeLabel={t.account.homeLink}>
      <p>{terms.intro}</p>

      {terms.sections.map((section, i) => (
        <div key={i}>
          <h2 className="text-white font-bold mb-2">{section.title}</h2>
          <p>{section.body}</p>
          {'body2' in section && section.body2 && <p className="mt-2">{section.body2}</p>}
        </div>
      ))}

      <p className="text-gray-600 text-xs mt-4">{terms.footer}</p>
    </LegalLayout>
  )
}
