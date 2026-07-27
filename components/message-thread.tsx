'use client'
import { useState, useEffect, useRef } from 'react'
import { getBrowserClient } from '@/lib/supabase/browser'

type Msg = { id: string; body: string; sender_id: string; created_at: string }

export function MessageThread({
  conversationId, currentUserId, initialMessages, dict,
}: {
  conversationId: string
  currentUserId: string
  initialMessages: Msg[]
  dict: any
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const channel = getBrowserClient()
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => prev.some(m => m.id === (payload.new as any).id) ? prev : [...prev, payload.new as Msg])
      })
      .subscribe()

    return () => { getBrowserClient().removeChannel(channel) }
  }, [conversationId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  async function handleSend() {
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setText('')
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, body }),
      })
      const data = await res.json()
      if (data.message) {
        setMessages(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message])
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[60vh] border border-white/10 rounded-2xl bg-white/5">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-xs mt-8">{dict.noMessagesYet}</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_id === currentUserId ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
              m.sender_id === currentUserId ? 'bg-[#C9A84C] text-[#08080E]' : 'bg-white/10 text-white'
            }`}>
              {m.body}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 p-3 border-t border-white/5">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          placeholder={dict.newMessagePlaceholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-[#C9A84C]/40"
        />
        <button onClick={handleSend} disabled={sending || !text.trim()}
          className="bg-[#C9A84C] text-[#08080E] text-sm font-bold px-4 py-2 rounded-full disabled:opacity-50">
          {sending ? dict.sending : dict.send}
        </button>
      </div>
    </div>
  )
}
