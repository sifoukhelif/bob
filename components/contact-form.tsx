// components/contact-form.tsx
'use client'
import { useState } from 'react'
import { getDictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export function ContactForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).contact.form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) { setError(t.errorNameTooShort); return }
    if (message.trim().length < 10) { setError(t.errorMessageTooShort); return }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) throw new Error(t.errorGeneric)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-lg font-bold text-white mb-2">{t.successTitle}</h2>
        <p className="text-gray-500 text-sm">{t.successBody}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111118] border border-white/8 rounded-2xl p-6 flex flex-col gap-4 text-right">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">{t.nameLabel}</label>
        <input value={name} onChange={e => setName(e.target.value)} required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">{t.emailLabel}</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">{t.subjectLabel}</label>
        <input value={subject} onChange={e => setSubject(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">{t.messageLabel}</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5}
          placeholder={t.messagePlaceholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/40 resize-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:scale-[1.02] transition-all disabled:opacity-50">
        {loading ? t.sendingText : t.sendButton}
      </button>
    </form>
  )
}
