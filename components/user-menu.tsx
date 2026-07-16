// components/user-menu.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'

export function UserMenu({ email, username, role }: { email: string; username?: string | null; role?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const displayName = username ?? email

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleSignOut() {
    setLoading(true)
    const sb = getBrowserClient()
    await sb.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const dashboardHref = role === 'seller' || role === 'admin' ? '/dashboard' : '/orders'
  const dashboardLabel = role === 'seller' || role === 'admin' ? 'لوحة البائع' : 'طلباتي'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-semibold hover:border-[#C9A84C]/40 transition-all shrink-0 whitespace-nowrap">
        <span className="w-6 h-6 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center text-xs font-black">
          {(displayName ?? '?').charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[120px] truncate" dir="ltr">{displayName}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 bg-[#15151D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-50">
          <div className="px-4 py-2.5 border-b border-white/5">
            <p className="text-sm text-white font-bold truncate" dir="ltr">{displayName}</p>
            <p className="text-xs text-gray-500 truncate" dir="ltr">{email}</p>
            {role && (
              <span className="inline-block mt-1 text-[10px] bg-[#C9A84C]/10 text-[#C9A84C] px-2 py-0.5 rounded-full font-bold">
                {role === 'admin' ? 'أدمن' : role === 'seller' ? 'بائع' : 'مشترٍ'}
              </span>
            )}
          </div>
          <Link href="/account" onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            إعدادات الحساب
          </Link>
          <Link href="/wishlist" onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            المفضلة
          </Link>
          {role === 'admin' && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
              لوحة الأدمن
            </Link>
          )}
          <Link href={dashboardHref} onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            {dashboardLabel}
          </Link>
          {role !== 'admin' && role === 'seller' && (
            <Link href="/orders" onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
              طلباتي
            </Link>
          )}
          <button onClick={handleSignOut} disabled={loading}
            className="w-full text-right px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
            {loading ? 'جارٍ الخروج…' : 'تسجيل الخروج'}
          </button>
        </div>
      )}
    </div>
  )
}
