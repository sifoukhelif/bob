// app/privacy/page.tsx
import { LegalLayout } from '../legal-layout'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.privacy.title }
}

export default async function PrivacyPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const { privacy } = t

  return (
    <LegalLayout title={privacy.title} homeLabel={t.account.homeLink}>
      <p>{privacy.intro}</p>

      {privacy.sections.map((section, i) => (
        <div key={i}>
          <h2 className="text-white font-bold mb-2">{section.title}</h2>
          <p>{section.body}</p>
          {'body2' in section && section.body2 && <p className="mt-2">{section.body2}</p>}
          {'list' in section && section.list && (
            <ul className="list-disc pr-5 mt-2 space-y-1">
              {section.list.map((item, j) => {
                const dashIndex = item.indexOf(' — ')
                if (dashIndex === -1) return <li key={j}>{item}</li>
                return (
                  <li key={j}>
                    <strong>{item.slice(0, dashIndex)}</strong>{item.slice(dashIndex)}
                  </li>
                )
              })}
            </ul>
          )}
          {'closing' in section && section.closing && <p className="mt-2">{section.closing}</p>}
        </div>
      ))}

      <p className="text-gray-600 text-xs mt-4">{privacy.footer}</p>
    </LegalLayout>
  )
}
