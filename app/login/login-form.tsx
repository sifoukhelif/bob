// app/login/login-form.tsx
'use client'
import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/browser'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdBanner } from '@/components/ad-slot'
import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/i18n'

export function LoginForm({ locale, t }: { locale: Locale; t: ReturnType<typeof getDictionary> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const urlError = searchParams.get('error')
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(urlError ?? '')
  const [signupDone, setSignupDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const sb = getBrowserClient()
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(redirectTo); router.refresh()
      } else {
        const callbackUrl = `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
        const { data, error } = await sb.auth.signUp({
          email, password,
          options: { data: { role: 'buyer' }, emailRedirectTo: callbackUrl },
        })
        if (error) throw error
        if (data.session) {
          router.push(redirectTo); router.refresh()
        } else {
          setSignupDone(true)
        }
      }
    } catch (err: any) {
      setError(
        err.message === 'Email not confirmed'
          ? t.login.emailNotConfirmedError
          : err.message ?? t.login.genericError
      )
    } finally { setLoading(false) }
  }

  if (signupDone) {
    return (
      <div className="min-h-screen bg-[#08080E] flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm text-center">
          <div className="text-5xl mb-6">📩</div>
          <h1 className="text-xl font-serif font-bold mb-3">{t.login.checkEmailTitle}</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {t.login.checkEmailBodyPrefix} <span className="text-white" dir="ltr">{email}</span>. {t.login.checkEmailBodySuffix}
          </p>
          <button onClick={() => { setSignupDone(false); setMode('login') }}
            className="text-[#C9A84C] text-sm hover:underline">{t.login.backToLogin}</button>
        </div>
      </div>
    )
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
          <p className="text-gray-500 text-sm mt-2">{mode === 'login' ? t.login.welcomeBack : t.login.createAccount}</p>
        </div>
        <div className="bg-[#111118] border border-white/6 rounded-2xl p-6">
          <div className="flex rounded-xl bg-black/30 p-1 mb-6">
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === m ? 'bg-[#C9A84C] text-[#08080E]' : 'text-gray-500 hover:text-gray-300'}`}>
                {m === 'login' ? t.login.loginTab : t.login.signupTab}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{t.login.emailLabel}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{t.login.passwordLabel}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
            </div>
            {mode === 'login' && (
              <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors text-left -mt-2">
                {t.login.forgotPasswordLink}
              </Link>
            )}
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
              {loading ? t.login.loadingText : mode === 'login' ? t.login.loginButton : t.login.signupButton}
            </button>
          </form>
        </div>

        {/* مساحة إعلانية — تظهر لكل زائر حتى قبل تسجيل الدخول */}
        <div className="mt-6">
          <AdBanner label={t.ads.banner} className="h-16 md:h-20" />
        </div>
      </div>
    </div>
  )
}
