// app/dashboard/payout-settings/form.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'

type PayoutSettingsDict = {
  methodLabel: string; methodPlaceholder: string
  methodBank: string; methodPayoneer: string; methodOther: string
  detailsLabel: string; detailsPlaceholder: string; detailsHint: string
  errorMethodRequired: string; errorDetailsInvalid: string; errorSaveFailed: string
  genericError: string; savedSuccess: string
  saveButton: string; savingText: string
}

export function PayoutSettingsForm({
  t,
  initial,
}: {
  t: PayoutSettingsDict
  initial: { method: string; details: string }
}) {
  const router = useRouter()
  const [method, setMethod] = useState(initial.method)
  const [details, setDetails] = useState(initial.details)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const METHODS = [
    { value: 'bank_transfer', label: t.methodBank },
    { value: 'payoneer', label: t.methodPayoneer },
    { value: 'other', label: t.methodOther },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    if (!method) {
      setError(t.errorMethodRequired)
      return
    }
    if (!details.trim() || details.trim().length < 5) {
      setError(t.errorDetailsInvalid)
      return
    }

    setLoading(true)
    try {
      const sb = getBrowserClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        router.push('/login?redirectTo=/dashboard/payout-settings')
        return
      }

      const { error: updateError } = await sb
        .from('users')
        .update({ payout_method: method, payout_details: details.trim() })
        .eq('id', user.id)

      if (updateError) {
        throw new Error(t.errorSaveFailed)
      }

      setSaved(true)
    } catch (err: any) {
      setError(err.message ?? t.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
     <div>
        <label className="block text-xs text-gray-500 mb-1.5">{t.methodLabel}</label>
        <select value={method} onChange={e => setMethod(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors cursor-pointer">
          <option value="" style={{ backgroundColor: '#111118', color: '#F0EDE6' }}>{t.methodPlaceholder}</option>
          {METHODS.map(m => <option key={m.value} value={m.value} style={{ backgroundColor: '#111118', color: '#F0EDE6' }}>{m.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">{t.detailsLabel}</label>
        <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4}
          placeholder={t.detailsPlaceholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors resize-none" />
        <p className="text-[10px] text-gray-600 mt-1.5">{t.detailsHint}</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">{error}</div>}
      {saved && <div className="bg-[#2ECC9A]/10 border border-[#2ECC9A]/20 rounded-xl px-4 py-3 text-xs text-[#2ECC9A]">{t.savedSuccess}</div>}

      <button type="submit" disabled={loading}
        className="w-full bg-[#C9A84C] text-[#08080E] py-3.5 rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
        {loading ? t.savingText : t.saveButton}
      </button>
    </form>
  )
}
