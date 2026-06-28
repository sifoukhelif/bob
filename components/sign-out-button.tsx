// components/sign-out-button.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const sb = getBrowserClient()
    await sb.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleSignOut} disabled={loading}
      className={className ?? 'text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50'}>
      {loading ? 'جارٍ الخروج…' : 'تسجيل الخروج'}
    </button>
  )
}
