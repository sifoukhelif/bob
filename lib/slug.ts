// lib/slug.ts
// يُستخدم لفك ترميز slugs عربية قادمة من params.slug بأمان،
// حتى لو مرّرها Next.js App Router مرمّزة مرتين (double URL-encoding).
// راجع الدرس الموثّق بخصوص /product/[slug] — نفس المشكلة تتكرر بأي صفحة
// ديناميكية تبني params من نص عربي (store/[slug] وغيرها لاحقاً).
export function safeDecodeSlug(raw: string): string {
  let decoded = raw
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch {
      break
    }
  }
  return decoded
}
