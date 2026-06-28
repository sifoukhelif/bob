// app/not-found.tsx
import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-serif font-black text-[#C9A84C] mb-4 leading-none">404</div>
        <h1 className="text-2xl font-serif font-bold mb-3">الصفحة غير <span className="text-[#C9A84C] italic">موجودة</span></h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          الصفحة التي تبحث عنها تم نقلها أو حذفها أو لم تكن موجودة أصلاً.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-[#C9A84C] text-[#08080E] px-8 py-3 rounded-full font-black text-sm hover:opacity-90 transition-opacity">الرئيسية</Link>
          <Link href="/shop" className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors">المتجر</Link>
        </div>
      </div>
    </div>
  )
}
