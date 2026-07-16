// components/review-form.tsx
'use client'
import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/browser'
import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/i18n'

type Props = {
  orderItemId: string
  listingId: string
  buyerId: string
  existingReview: { id: string; rating: number; comment: string | null } | null
  t: ReturnType<typeof getDictionary>
  locale: Locale
}

export function ReviewForm({ orderItemId, listingId, buyerId, existingReview, t }: Props) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(!existingReview)

  async function handleSubmit() {
    if (rating < 1) return
    setSaving(true); setError('')
    try {
      const sb = getBrowserClient()
      const payload = { listing_id: listingId, buyer_id: buyerId, order_item_id: orderItemId, rating, comment: comment.trim() || null }
      const { error: dbError } = existingReview
        ? await sb.from('reviews').update({ rating, comment: payload.comment }).eq('id', existingReview.id)
        : await sb.from('reviews').insert(payload)
      if (dbError) throw dbError
      setDone(true); setEditing(false)
    } catch {
      setError(t.reviews.error)
    } finally {
      setSaving(false)
    }
  }

  if (!editing && (existingReview || done)) {
    return (
      <div className="mt-3 flex items-center gap-3 text-xs">
        <span className="text-gray-500">{t.reviews.alreadyReviewed}:</span>
        <span className="text-[#C9A84C]">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
        <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-[#C9A84C] underline">
          {t.reviews.editReview}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-3 bg-black/20 border border-white/5 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-2">{t.reviews.yourRating}</div>
      <div className="flex gap-1 mb-3" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl leading-none transition-colors"
            style={{ color: star <= (hoverRating || rating) ? '#C9A84C' : '#3a3a44' }}
            aria-label={`${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t.reviews.commentPlaceholder}
        rows={2}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors resize-none mb-3"
      />
      {error && <div className="text-[10px] text-red-400 mb-2">{error}</div>}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving || rating < 1}
          className="bg-[#C9A84C] text-[#08080E] text-xs font-black px-5 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {saving ? t.reviews.submitting : existingReview ? t.reviews.update : t.reviews.submit}
        </button>
        {existingReview && (
          <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-gray-300">
            {t.reviews.alreadyReviewed}
          </button>
        )}
      </div>
    </div>
  )
}
