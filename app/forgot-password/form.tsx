// app/forgot-password/form.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase/browser'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import type { Locale } from '@/lib/i18n'

type ForgotPasswordDict = {
  title: string; subtitle: string
  emailLabel: string; sendButton: string; sendingText: string
  successTitle: string; successBody: string
  backToLogin: string; errorGeneric: string
}

export function ForgotPasswordForm({ locale, t }: { locale: Locale; t: ForgotPasswordDict }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const sb = getBrowserClient()
      const callbackUrl = `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent('/reset-password')}`
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl })
      if (error) throw error
      // نعرض رسالة نجاح دايماً بغض النظر إذا البريد مسجّل أو لا، لعدم كشف وجود حسابات من عدمه
      setSent(true)
    } catch {
      setError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08080E] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#C9A84C]/5 blur-[120px] rounded-full" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-2">
          <LanguageSwitcher current={locale} />
        </div>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo size="md" />
            <span className="text-xl font-bold tracking-widest uppercase">DEGITALE</span>
          </Link>
        </div>

        {sent ? (
          <div className="bg-[#111118] border border-white/6 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">📩</div>
            <h1 className="text-lg font-serif font-bold mb-3">{t.successTitle}</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{t.successBody}</p>
            <Link href="/login" className="text-[#C9A84C] text-sm hover:underline">{t.backToLogin}</Link>
          </div>
        ) : (
          <div className="bg-[#111118] border border-white/6 rounded-2xl p-6">
            <h1 className="text-lg font-serif font-bold mb-1.5 text-center">{t.title}</h1>
            <p className="text-gray-500 text-sm text-center mb-6">{t.subtitle}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">{t.emailLabel}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
                {loading ? t.sendingText : t.sendButton}
              </button>
              <Link href="/login" className="text-center text-xs text-gray-500 hover:text-[#C9A84C] transition-colors">{t.backToLogin}</Link>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
