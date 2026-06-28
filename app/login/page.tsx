// app/login/page.tsx
import { Suspense } from 'react'
import { LoginForm } from './login-form'
import { Logo } from '@/components/logo'

export const metadata = { title: 'تسجيل الدخول' }

function LoginFallback() {
  return (
    <div className="min-h-screen bg-[#08080E] flex items-center justify-center px-4">
      <Logo size="md" className="rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.25)] animate-pulse" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
