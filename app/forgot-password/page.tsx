// app/forgot-password/page.tsx
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { ForgotPasswordForm } from './form'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.forgotPassword.title }
}

export default async function ForgotPasswordPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return <ForgotPasswordForm locale={locale} t={t.forgotPassword} />
}
