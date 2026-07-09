// components/language-switcher.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Locale } from '@/lib/i18n'

const LABELS: Record<Locale, string> = { ar: 'AR', en: 'EN', fr: 'FR' }

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function switchTo(locale: Locale) {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`
    setOpen(false)
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
      >
        🌐 {LABELS[current]}
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-[#111118] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 min-w-[100px]">
          {(Object.keys(LABELS) as Locale[]).map(loc => (
            <button
              key={loc}
              type="button"
              onClick={() => switchTo(loc)}
              className={`w-full text-right px-4 py-2.5 text-xs font-bold transition-colors ${loc === current ? 'text-[#C9A84C] bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {LABELS[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
