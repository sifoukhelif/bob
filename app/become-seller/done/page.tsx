// app/become-seller/done/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'
import { Logo } from '@/components/logo'

export default function BecomeSellerDone() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      const sb = getBrowserClient()
      // يجدد الجلسة محلياً ليتضمن الـ JWT دور "seller" الجديد قبل دخول لوحة التحكم
      await sb.auth.refreshSession()
      router.replace('/dashboard?welcome=1')
    })()
  }, [router])

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center">
      <div className="text-center">
        <Logo size="md" className="rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.25)] mx-auto mb-6 animate-pulse" />
        <p className="text-sm text-gray-500">جارٍ تجهيز متجرك…</p>
      </div>
    </div>
  )
}
