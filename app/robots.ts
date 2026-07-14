// app/robots.ts
import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://degitale.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/account',
          '/orders',
          '/checkout',
          '/api/',
          '/login',
          '/banned',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
