// components/notification-bell.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'
import { getDictionary, DEFAULT_LOCALE, type Locale } from '@/lib/i18n'

function readLocaleCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/)
  const value = match?.[1]
  return value === 'en' || value === 'fr' || value === 'ar' ? value : DEFAULT_LOCALE
}

type Notif = {
  id: string; type: string; title: string; body: string | null; link: string | null
  is_read: boolean; created_at: string
}

const POLL_INTERVAL_MS = 30_000

export function NotificationBell() {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setLocale(readLocaleCookie()) }, [])
  const t = getDictionary(locale).notifications

  async function fetchNotifs(uid: string) {
    const { data } = await getBrowserClient()
      .from('notifications')
      .select('id,type,title,body,link,is_read,created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifs(data)
  }

  useEffect(() => {
    let active = true
    getBrowserClient().auth.getUser().then(({ data }) => {
      if (!active || !data.user) return
      setUserId(data.user.id)
      fetchNotifs(data.user.id)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => fetchNotifs(userId), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [userId])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const unreadCount = notifs.filter(n => !n.is_read).length

  async function markAllRead() {
    if (!userId || unreadCount === 0) return
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    await getBrowserClient().from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
  }

  async function handleClickNotif(n: Notif) {
    if (!n.is_read) {
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
      await getBrowserClient().from('notifications').update({ is_read: true }).eq('id', n.id)
    }
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  function formatTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return t.timeJustNow
    if (mins < 60) return t.timeMinutesAgo.replace('{n}', String(mins))
    const hours = Math.floor(mins / 60)
    if (hours < 24) return t.timeHoursAgo.replace('{n}', String(hours))
    const days = Math.floor(hours / 24)
    return t.timeDaysAgo.replace('{n}', String(days))
  }

  if (!userId) return null

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#C9A84C]/40 transition-all shrink-0"
        aria-label={t.title}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C9A84C] text-[#08080E] text-[9px] font-black flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 max-w-[90vw] bg-[#15151D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-bold text-white">{t.title}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-[#C9A84C] hover:underline">{t.markAllRead}</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifs.length > 0 ? notifs.map(n => (
              <button key={n.id} onClick={() => handleClickNotif(n)}
                className={`w-full text-right px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-2 items-start ${!n.is_read ? 'bg-[#C9A84C]/5' : ''}`}>
                {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{n.title}</p>
                  {n.body && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] text-gray-600 mt-1">{formatTime(n.created_at)}</p>
                </div>
              </button>
            )) : (
              <div className="text-center py-10 text-gray-600 text-xs">{t.emptyText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
