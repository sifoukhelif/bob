// app/account/password-form.tsx
'use client'
import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/browser'

type PasswordDict = {
  sectionTitle: string
  currentLabel: string; newLabel: string; confirmLabel: string
  saveButton: string; savingText: string; successMessage: string
  errorCurrentWrong: string; errorMismatch: string; errorTooShort: string; errorGeneric: string
}

export function PasswordForm({ t, email }: { t: PasswordDict; email: string }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    if (next.length < 6) { setError(t.errorTooShort); return }
    if (next !== confirm) { setError(t.errorMismatch); return }

    setLoading(true)
    try {
      const sb = getBrowserClient()
      // نتحقق من كلمة المرور الحالية عبر محاولة تسجيل دخول فعلية بها، قبل تغييرها
      const { error: signInError } = await sb.auth.signInWithPassword({ email, password: current })
      if (signInError) { setError(t.errorCurrentWrong); setLoading(false); return }

      const { error: updateError } = await sb.auth.updateUser({ password: next })
      if (updateError) throw updateError

      setSaved(true)
      setCurrent(''); setNext(''); setConfirm('')
    } catch {
      setError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#111118] border border-white/6 rounded-2xl p-6 max-w-md">
      <h2 className="text-sm font-bold text-gray-300 mb-4">{t.sectionTitle}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">{t.currentLabel}</label>
          <input type="password" dir="ltr" value={current} onChange={e => setCurrent(e.target.value)} required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">{t.newLabel}</label>
          <input type="password" dir="ltr" value={next} onChange={e => setNext(e.target.value)} required minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">{t.confirmLabel}</label>
          <input type="password" dir="ltr" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {saved && <p className="text-xs text-[#2ECC9A]">{t.successMessage}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-50 mt-1">
          {loading ? t.savingText : t.saveButton}
        </button>
      </form>
    </div>
  )
}
