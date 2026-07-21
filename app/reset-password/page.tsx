// app/reset-password/page.tsx
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { ResetPasswordForm } from './form'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.resetPassword.title }
}

export default async function ResetPasswordPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return <ResetPasswordForm locale={locale} t={t.resetPassword} />
}
