// components/cookie-consent.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/i18n'

const COOKIE_NAME = 'cookie_consent'

function readConsentCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match?.[1] ?? null
}

function setConsentCookie(value: 'accepted' | 'declined') {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=31536000; SameSite=Lax`
}

export function CookieConsent({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false)
  const t = getDictionary(locale).cookieConsent

  useEffect(() => {
    if (!readConsentCookie()) setVisible(true)
  }, [])

  function handle(choice: 'accepted' | 'declined') {
    setConsentCookie(choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-[#111118] border border-white/10 rounded-2xl shadow-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-xs text-gray-400 leading-relaxed flex-1">
          {t.message}{' '}
          <Link href="/privacy" className="text-[#C9A84C] hover:underline whitespace-nowrap">{t.privacyLink}</Link>
        </p>
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => handle('declined')}
            className="flex-1 md:flex-none px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-gray-400 hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            {t.decline}
          </button>
          <button
            onClick={() => handle('accepted')}
            className="flex-1 md:flex-none bg-[#C9A84C] text-[#08080E] px-5 py-2 rounded-full text-xs font-black hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
