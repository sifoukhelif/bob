// components/contact-seller-button.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export function ContactSellerButton({
  sellerId, listingId, locale, redirectPath,
}: { sellerId: string; listingId?: string | null; locale: Locale; redirectPath: string }) {
  const router = useRouter()
  const t = getDictionary(locale)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContactSeller() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/messages/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, listingId: listingId ?? null }),
      })
      const data = await res.json()
      if (res.status === 401) {
        router.push(`/login?redirectTo=${redirectPath}`)
        return
      }
      if (data.error === 'cannot_message_self') {
        setError(t.messages.cannotMessageSelf)
        setLoading(false)
        return
      }
      if (!res.ok || !data.conversationId) {
        throw new Error(t.messages.startConversationError)
      }
      router.push(`/messages/${data.conversationId}`)
    } catch (err: any) {
      setError(err.message ?? t.messages.startConversationError)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleContactSeller}
        disabled={loading}
        className="bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:border-[#C9A84C]/40 transition-all disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? t.messages.startingConversation : t.messages.contactSeller}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
