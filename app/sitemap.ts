// app/sitemap.ts
// يولّد sitemap.xml تلقائياً — يتحدّث مع كل منتج/متجر جديد بدون أي تدخل يدوي
import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://degitale.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient()

  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${APP_URL}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/sell`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/contact`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${APP_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${APP_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // المنتجات النشطة فقط
  const { data: listings } = await admin
    .from('listings')
    .select('slug, updated_at')
    .eq('status', 'active')

  const productPages: MetadataRoute.Sitemap = (listings ?? []).map((p) => ({
    url: `${APP_URL}/product/${encodeURIComponent(p.slug)}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // المتاجر
  const { data: stores } = await admin
    .from('stores')
    .select('slug, created_at')

  const storePages: MetadataRoute.Sitemap = (stores ?? []).map((s) => ({
    url: `${APP_URL}/store/${encodeURIComponent(s.slug)}`,
    lastModified: s.created_at ? new Date(s.created_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...storePages]
}
