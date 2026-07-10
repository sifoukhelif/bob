// lib/i18n/server.ts
import { cookies } from 'next/headers'
import { LOCALES, DEFAULT_LOCALE, type Locale } from './index'

// يُستخدم فقط داخل Server Components — لا يجوز استيراده من أي Client Component
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get('locale')?.value
  return (LOCALES as readonly string[]).includes(value ?? '') ? (value as Locale) : DEFAULT_LOCALE
}
