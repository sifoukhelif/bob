// app/faq/page.tsx
import type { Metadata } from 'next'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { FaqContent } from './faq-content'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.faq.title, description: t.faq.subtitle }
}

export default async function FaqPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return <FaqContent locale={locale} t={t} />
}
