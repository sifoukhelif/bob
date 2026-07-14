// lib/translate.ts
// ترجمة فورية لعنوان/وصف المنتج عبر Claude، مع تخزين مؤقت دائم بقاعدة البيانات
// بحيث لا تُترجم نفس النسخة أكثر من مرة واحدة لكل لغة.
import { createAdminClient } from './supabase/admin'

type Translatable = { title: string; description: string | null }

const LANGUAGE_NAMES: Record<'en' | 'fr', string> = { en: 'English', fr: 'French' }

export async function getTranslatedListing(
  listingId: string,
  original: Translatable,
  locale: 'en' | 'fr'
): Promise<Translatable> {
  const admin = createAdminClient()

  // 1) تحقق من وجود ترجمة مخزّنة مسبقاً
  const { data: cached } = await admin
    .from('listing_translations')
    .select('title, description')
    .eq('listing_id', listingId)
    .eq('locale', locale)
    .maybeSingle()

  if (cached) return cached

  // 2) لا توجد ترجمة مخزّنة — تُرجم الآن فورياً
  try {
    const translated = await translateWithClaude(original, locale)

    // 3) خزّن النتيجة بالكاش (upsert يمنع تكرار الترجمة لاحقاً)
    await admin.from('listing_translations').upsert(
      {
        listing_id: listingId,
        locale,
        title: translated.title,
        description: translated.description,
      },
      { onConflict: 'listing_id,locale' }
    )

    return translated
  } catch (err) {
    // لو فشلت الترجمة لأي سبب (مفتاح API مفقود، خطأ شبكة...)
    // نعرض النص الأصلي بدل كسر الصفحة بالكامل
    console.error('[translate] failed for listing', listingId, locale, err)
    return original
  }
}

async function translateWithClaude(
  original: Translatable,
  locale: 'en' | 'fr'
): Promise<Translatable> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const languageName = LANGUAGE_NAMES[locale]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:
        `You are a professional e-commerce translator for a digital products marketplace. ` +
        `Translate the given product title and description from Arabic to ${languageName}. ` +
        `Keep the tone natural and commercial. Preserve any numbers, prices, or product names as-is. ` +
        `Respond ONLY with valid minified JSON in exactly this shape, nothing else, no markdown fences: ` +
        `{"title":"...","description":"..."}`,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            title: original.title,
            description: original.description ?? '',
          }),
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Claude API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text: string = data.content?.[0]?.text ?? ''
  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)

  return {
    title: parsed.title || original.title,
    description: parsed.description || original.description,
  }
}

// تحذف أي ترجمات مخزّنة لمنتج معيّن — تُستدعى عند تعديل البائع للعنوان/الوصف
// حتى لا تبقى ترجمة قديمة غير متطابقة مع النص الجديد
export async function invalidateListingTranslations(listingId: string) {
  const admin = createAdminClient()
  await admin.from('listing_translations').delete().eq('listing_id', listingId)
}
