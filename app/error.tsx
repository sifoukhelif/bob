// app/error.tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-serif font-black text-red-500 mb-4 leading-none">500</div>
        <h1 className="text-2xl font-serif font-bold mb-3">حدث خطأ <span className="text-red-400 italic">غير متوقع</span></h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">فريقنا أُبلغ تلقائياً. حاول مرة أخرى أو عد لاحقاً.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-[#C9A84C] text-[#08080E] px-8 py-3 rounded-full font-black text-sm hover:opacity-90 transition-opacity">حاول مرة أخرى</button>
          <Link href="/" className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors">الرئيسية</Link>
        </div>
      </div>
    </div>
  )
}
