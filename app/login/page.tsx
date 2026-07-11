// app/login/page.tsx
import { Suspense } from 'react'
import { LoginForm } from './login-form'
import { Logo } from '@/components/logo'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

export const metadata = { title: 'تسجيل الدخول' }

function LoginFallback() {
  return (
    <div className="min-h-screen bg-[#08080E] flex items-center justify-center px-4">
      <Logo size="md" className="rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.25)] animate-pulse" />
    </div>
  )
}

export default async function LoginPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm locale={locale} t={t} />
    </Suspense>
  )
}
