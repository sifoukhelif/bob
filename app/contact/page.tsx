// app/contact/page.tsx
import Link from 'next/link'
import { Logo } from '@/components/logo'
export const metadata = { title: 'الدعم' }

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center px-4">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">الرئيسية</Link>
        </div>
      </nav>

      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-6">💬</div>
        <h1 className="text-3xl font-serif font-bold mb-3">تواصل مع الدعم</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          لديك سؤال أو مشكلة في طلب أو منتج؟ راسلنا وسنرد عليك خلال 24 ساعة.
        </p>
        <a href="mailto:support@degitale.com"
          className="bg-[#C9A84C] text-[#08080E] px-8 py-3.5 rounded-full font-black text-sm hover:opacity-90 transition-opacity inline-block">
          support@degitale.com
        </a>
      </div>
    </div>
  )
}
