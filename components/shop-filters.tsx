// components/shop-filters.tsx
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/i18n'

const SORT_OPTIONS = ['popular', 'newest', 'price_asc', 'price_desc', 'top_rated'] as const
type SortValue = typeof SORT_OPTIONS[number]

export function ShopFilters({ t }: { t: ReturnType<typeof getDictionary>; locale: Locale }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSort = (searchParams.get('sort') as SortValue) || 'popular'
  const [minPrice, setMinPrice] = useState(searchParams.get('min') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') ?? '')

  const sortLabels: Record<SortValue, string> = {
    popular: t.shop.sortPopular,
    newest: t.shop.sortNewest,
    price_asc: t.shop.sortPriceAsc,
    price_desc: t.shop.sortPriceDesc,
    top_rated: t.shop.sortTopRated,
  }

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    params.delete('page') // نرجع لأول صفحة عند تغيير الفلاتر
    router.push(`/shop?${params.toString()}`)
  }

  function handleApplyPrice() {
    updateParams({ min: minPrice || null, max: maxPrice || null })
  }

  function handleClear() {
    setMinPrice(''); setMaxPrice('')
    router.push('/shop')
  }

  const hasActiveFilters = !!(searchParams.get('min') || searchParams.get('max') || (currentSort !== 'popular'))

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* الفرز */}
      <select
        value={currentSort}
        onChange={(e) => updateParams({ sort: e.target.value === 'popular' ? null : e.target.value })}
        className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-[#C9A84C]/40 transition-colors cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt} value={opt} className="bg-[#111118]">{sortLabels[opt]}</option>
        ))}
      </select>

      {/* نطاق السعر */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
        <input
          type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
          placeholder={t.shop.minPricePlaceholder}
          className="w-16 bg-transparent text-xs text-white placeholder-gray-600 outline-none"
        />
        <span className="text-gray-600 text-xs">–</span>
        <input
          type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
          placeholder={t.shop.maxPricePlaceholder}
          className="w-16 bg-transparent text-xs text-white placeholder-gray-600 outline-none"
        />
        <button onClick={handleApplyPrice}
          className="text-[10px] font-bold text-[#C9A84C] hover:opacity-80 transition-opacity whitespace-nowrap">
          {t.shop.applyFilters}
        </button>
      </div>

      {hasActiveFilters && (
        <button onClick={handleClear} className="text-xs text-gray-500 hover:text-gray-300 underline">
          {t.shop.clearFilters}
        </button>
      )}
    </div>
  )
}
