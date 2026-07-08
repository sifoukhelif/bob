// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, Cairo } from 'next/font/google'
import '@/styles/globals.css'
import { getServerLocale, isRTL } from '@/lib/i18n'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const dmSans   = DM_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['300','400','500','600'], display: 'swap' })
const cairo    = Cairo({ subsets: ['arabic'], variable: '--font-cairo', weight: ['300','400','500','600','700','800'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'DEGITALE | سوق الأصول الرقمية', template: '%s | DEGITALE' },
  description: 'منصة حصرية لبيع وشراء المنتجات والخدمات الرقمية المتطورة',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://degitale.com'),
  openGraph: { siteName: 'DEGITALE', type: 'website', locale: 'ar_SA' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, themeColor: '#08080E',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale()
  const dir = isRTL(locale) ? 'rtl' : 'ltr'
  const bodyFontClass = locale === 'ar' ? 'font-cairo' : 'font-sans'

  return (
    <html lang={locale} dir={dir}
      className={`${playfair.variable} ${dmSans.variable} ${cairo.variable} w-full overflow-x-hidden`}
      suppressHydrationWarning>
      <body className={`${bodyFontClass} antialiased w-full bg-[#08080E] text-[#F0EDE6]`}>
        <div className="relative flex flex-col min-h-screen w-full">{children}</div>
      </body>
    </html>
  )
}
