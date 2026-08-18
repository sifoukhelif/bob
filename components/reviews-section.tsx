// components/reviews-section.tsx
'use client'
import { useState } from 'react'
import { ReviewForm } from './review-form'
import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/i18n'

type ExistingReview = { id: string; rating: number; comment: string | null }

export type EligiblePurchase = {
  orderItemId: string
  purchasedAt: string
  existingReview: ExistingReview | null
}

export type DisplayReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewerName: string
}

type Props = {
  listingId: string
  userId: string | null
  ratingAvg: number | null
  ratingCount: number
  reviews: DisplayReview[]
  eligiblePurchases: EligiblePurchase[]
  t: ReturnType<typeof getDictionary>
  locale: Locale
}

function StaticStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <span className="text-[#C9A84C] text-sm" dir="ltr">
      {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
    </span>
  )
}

export function ReviewsSection({
  listingId,
  userId,
  ratingAvg,
  ratingCount,
  reviews,
  eligiblePurchases,
  t,
  locale,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(6)

  return (
    <section className="mt-14 pt-10 border-t border-white/5">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-serif font-bold">
          {t.reviews.title} {ratingCount ? `(${ratingCount})` : ''}
        </h2>
        {ratingCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <StaticStars rating={ratingAvg ?? 0} />
            <span className="text-gray-400">
              {(ratingAvg ?? 0).toFixed(1)} · {ratingCount} {t.reviews.ratingsCountLabel}
            </span>
          </div>
        )}
      </div>

      {/* نماذج التقييم — وحدة منفصلة لكل عملية شراء غير مقيّمة أو مقيّمة سابقاً */}
      {userId && eligiblePurchases.length > 0 && (
        <div className="mb-10 space-y-5">
          <div className="text-xs text-gray-500">{t.reviews.writePromptLabel}</div>
          {eligiblePurchases.map((p) => (
            <div key={p.orderItemId}>
              <div className="text-[10px] text-gray-600 mb-1">
                {t.reviews.purchasedOnLabel} {new Date(p.purchasedAt).toLocaleDateString(locale)}
              </div>
              <ReviewForm
                orderItemId={p.orderItemId}
                listingId={listingId}
                buyerId={userId}
                existingReview={p.existingReview}
                t={t}
                locale={locale}
              />
            </div>
          ))}
        </div>
      )}

      {/* قائمة التقييمات المعروضة للجميع */}
      {reviews.length > 0 ? (
        <div className="space-y-5">
          {reviews.slice(0, visibleCount).map((r) => (
            <div key={r.id} className="border-b border-white/5 pb-5">
              <div className="flex items-center justify-between mb-1.5 gap-3">
                <span className="text-sm font-bold text-white">{r.reviewerName ?? t.reviews.anonymous}</span>
                <span className="text-[10px] text-gray-600 shrink-0">
                  {new Date(r.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
              <StaticStars rating={r.rating} />
              {r.comment && (
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
          {reviews.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((c) => c + 10)}
              className="text-xs text-[#C9A84C] hover:underline"
            >
              {t.reviews.showMoreLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600 text-sm bg-[#111118] border border-white/5 rounded-2xl">
          {t.reviews.noReviewsYet}
        </div>
      )}
    </section>
  )
}
