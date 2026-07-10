// lib/i18n/index.ts
import { ar } from './dictionaries/ar'
import { en } from './dictionaries/en'
import { fr } from './dictionaries/fr'

export const LOCALES = ['ar', 'en', 'fr'] as const
export type Locale = typeof LOCALES[number]
export const DEFAULT_LOCALE: Locale = 'ar'

const dictionaries = { ar, en, fr }

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
}

export function isRTL(locale: Locale) {
  return locale === 'ar'
}
