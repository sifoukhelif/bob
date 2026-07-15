// app/legal-layout.tsx
import Link from 'next/link'
import { Logo } from '@/components/logo'

export function LegalLayout({ title, homeLabel, children }: { title: string; homeLabel: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{homeLabel}</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-3xl font-serif font-bold mb-8">{title}</h1>
        <div className="flex flex-col gap-5 text-sm text-gray-400 leading-relaxed">
          {children}
        </div>
      </main>
    </div>
  )
}
