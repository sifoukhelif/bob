// lib/translate.ts
// ترجمة فورية لعنوان/وصف المنتج عبر MyMemory (خدمة ترجمة مجانية بالكامل، بلا مفتاح API)
// مع تخزين مؤقت دائم بقاعدة البيانات، بحيث لا تُترجم نفس النسخة أكثر من مرة واحدة لكل لغة.
import { createAdminClient } from './supabase/admin'

type Translatable = { title: string; description: string | null }

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
    const translated = await translateFree(original, locale)

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
    // لو فشلت الترجمة لأي سبب (الخدمة معطّلة، تجاوز الحد اليومي المجاني...)
    // نعرض النص الأصلي بدل كسر الصفحة بالكامل
    console.error('[translate] failed for listing', listingId, locale, err)
    return original
  }
}

async function translateFree(
  original: Translatable,
  locale: 'en' | 'fr'
): Promise<Translatable> {
  const [title, description] = await Promise.all([
    translateText(original.title, locale),
    original.description ? translateText(original.description, locale) : Promise.resolve(null),
  ])
  return { title, description }
}

// MyMemory Translation API — مجانية بالكامل، بلا مفتاح API
// الحد المجاني: 5000 حرف/يوم لكل IP تقريباً (كافٍ جداً بفضل نظام الكاش أعلاه)
async function translateText(text: string, target: 'en' | 'fr'): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|${target}`
  const res = await fetch(url, { headers: { 'User-Agent': 'DEGITALE/1.0' } })

  if (!res.ok) throw new Error(`MyMemory API error ${res.status}`)

  const data = await res.json()

  // MyMemory يرجع 200 دائماً حتى عند الخطأ، لذا نتحقق من responseStatus الداخلي
  if (data?.responseStatus && data.responseStatus !== 200) {
    throw new Error(`MyMemory error: ${data.responseDetails ?? 'unknown'}`)
  }

  const translated = data?.responseData?.translatedText
  if (!translated || typeof translated !== 'string') {
    throw new Error('MyMemory: no translation returned')
  }

  return translated
}

// تحذف أي ترجمات مخزّنة لمنتج معيّن — احتياطي لاستخدام يدوي مستقبلي (مثل زر "أعد الترجمة" بلوحة الأدمن)
// (الحذف التلقائي عند التعديل يتم فعلياً عبر trigger بقاعدة البيانات، راجع migration 006)
export async function invalidateListingTranslations(listingId: string) {
  const admin = createAdminClient()
  await admin.from('listing_translations').delete().eq('listing_id', listingId)
}
