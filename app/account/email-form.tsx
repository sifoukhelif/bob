// app/account/email-form.tsx
'use client'
import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/browser'

type EmailDict = {
  sectionTitle: string
  currentLabel: string; newLabel: string
  saveButton: string; savingText: string; successMessage: string
  errorGeneric: string; errorSameEmail: string
}

export function EmailForm({ t, currentEmail }: { t: EmailDict; currentEmail: string }) {
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setError(t.errorSameEmail)
      return
    }

    setLoading(true)
    try {
      const sb = getBrowserClient()
      const { error } = await sb.auth.updateUser({ email: newEmail.trim() })
      if (error) throw error
      setSaved(true)
      setNewEmail('')
    } catch {
      setError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#111118] border border-white/6 rounded-2xl p-6 max-w-md">
      <h2 className="text-sm font-bold text-gray-300 mb-4">{t.sectionTitle}</h2>
      <p className="text-xs text-gray-500 mb-4" dir="ltr">{t.currentLabel}: {currentEmail}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">{t.newLabel}</label>
          <input type="email" dir="ltr" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="new@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {saved && <p className="text-xs text-[#2ECC9A] leading-relaxed">{t.successMessage}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-50 mt-1">
          {loading ? t.savingText : t.saveButton}
        </button>
      </form>
    </div>
  )
}
