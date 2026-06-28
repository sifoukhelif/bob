// app/product/[slug]/buy-box.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BuyBox({
  listingId, type, price, comparePrice,
}: { listingId: string; type: string; price: number; comparePrice: number | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBuy() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      const data = await res.json()

      if (res.status === 401) {
        router.push(`/login?redirectTo=/product/${listingId}`)
        return
      }
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'تعذّر بدء عملية الدفع')
      }
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ، حاول مرة أخرى')
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#111118] border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <span className="font-serif text-4xl font-black text-[#C9A84C]">
          {price === 0 ? 'مجاناً' : `$${price.toFixed(2)}`}
        </span>
        {comparePrice && (
          <span className="text-gray-500 text-lg line-through mb-1">${comparePrice.toFixed(2)}</span>
        )}
      </div>

      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-[#C9A84C] text-[#08080E] py-4 rounded-xl font-black text-base hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        {loading ? 'جارٍ التحويل…' : type === 'product' ? 'اشترِ الآن' : 'اطلب الخدمة'}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {['رابط تحميل آمن ومشفّر','صالح 48 ساعة بعد الشراء','ضمان استرداد 30 يوماً','دفع آمن عبر Stripe'].map(item => (
          <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-[#2ECC9A] text-xs">✓</span>{item}
          </div>
        ))}
      </div>
    </div>
  )
}
