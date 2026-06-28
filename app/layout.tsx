// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, Cairo } from 'next/font/google'
import '@/styles/globals.css'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl"
      className={`${playfair.variable} ${dmSans.variable} ${cairo.variable} w-full overflow-x-hidden`}
      suppressHydrationWarning>
      <body className="font-cairo antialiased w-full bg-[#08080E] text-[#F0EDE6]">
        <div className="relative flex flex-col min-h-screen w-full">{children}</div>
      </body>
    </html>
  )
}
