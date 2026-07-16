// components/wishlist-button.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'

type Props = {
  listingId: string
  userId: string | null
  initialSaved: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function WishlistButton({ listingId, userId, initialSaved, size = 'md', className = '' }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push('/login')
      return
    }

    const next = !saved
    setSaved(next) // تحديث فوري متفائل (optimistic) لتجربة سريعة

    startTransition(async () => {
      const sb = getBrowserClient()
      if (next) {
        const { error } = await sb.from('wishlists').insert({ user_id: userId, listing_id: listingId })
        if (error) setSaved(false) // تراجع لو فشل
      } else {
        const { error } = await sb.from('wishlists').delete().eq('user_id', userId).eq('listing_id', listingId)
        if (error) setSaved(true)
      }
      router.refresh()
    })
  }

  const dim = size === 'sm' ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-base'

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`${dim} rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
        saved
          ? 'bg-[#C9A84C] border-[#C9A84C] text-[#08080E]'
          : 'bg-black/40 border-white/10 text-white hover:border-[#C9A84C]/50'
      } ${className}`}
    >
      {saved ? '♥' : '♡'}
    </button>
  )
}
