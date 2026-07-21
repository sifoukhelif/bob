// app/reset-password/form.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase/browser'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import type { Locale } from '@/lib/i18n'

type ResetPasswordDict = {
  title: string; subtitle: string
  newPasswordLabel: string; confirmPasswordLabel: string
  saveButton: string; savingText: string
  successMessage: string; goToLogin: string
  errorMismatch: string; errorTooShort: string; errorGeneric: string; errorLinkExpired: string
}

export function ResetPasswordForm({ locale, t }: { locale: Locale; t: ResetPasswordDict }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [validSession, setValidSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const sb = getBrowserClient()
    sb.auth.getSession().then(({ data }) => {
      setValidSession(!!data.session)
      setChecking(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError(t.errorTooShort); return }
    if (password !== confirmPassword) { setError(t.errorMismatch); return }

    setLoading(true)
    try {
      const sb = getBrowserClient()
      const { error } = await sb.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
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

        <div className="bg-[#111118] border border-white/6 rounded-2xl p-6">
          {checking ? (
            <p className="text-center text-sm text-gray-500 py-4">…</p>
          ) : !validSession ? (
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-sm text-red-400 mb-6">{t.errorLinkExpired}</p>
              <Link href="/forgot-password" className="text-[#C9A84C] text-sm hover:underline">{t.goToLogin}</Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-sm text-[#2ECC9A] mb-2">{t.successMessage}</p>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-serif font-bold mb-1.5 text-center">{t.title}</h1>
              <p className="text-gray-500 text-sm text-center mb-6">{t.subtitle}</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{t.newPasswordLabel}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} dir="ltr"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">{t.confirmPasswordLabel}</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} dir="ltr"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
                  {loading ? t.savingText : t.saveButton}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
