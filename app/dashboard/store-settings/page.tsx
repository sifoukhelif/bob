// app/dashboard/store-settings/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { UserMenu } from '@/components/user-menu'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdBanner } from '@/components/ad-slot'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { StoreSettingsForm } from './form'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.storeSettings.title }
}

export default async function StoreSettingsPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard/store-settings')

  const { data: store } = await supabase
    .from('stores')
    .select('id,name,slug,bio,banner_url')
    .eq('owner_id', user.id).maybeSingle()

  if (!store) redirect('/dashboard')

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  const role = user.app_metadata?.role as string | undefined

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors whitespace-nowrap">
              {locale === 'ar' ? 'لوحتي ←' : locale === 'fr' ? 'Mon tableau de bord ←' : 'My Dashboard ←'}
            </Link>
            <UserMenu email={user.email ?? ''} username={profile?.username ?? null} role={role} />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-3xl font-serif font-bold mb-1">{t.storeSettings.title}</h1>
        <p className="text-gray-500 text-sm mb-2">{t.storeSettings.subtitle}</p>
        <Link href={`/store/${store.slug}`} className="text-xs text-[#C9A84C] hover:underline">
          {t.storeSettings.previewLink}
        </Link>

        <div className="mt-8">
          <StoreSettingsForm store={store} t={t.storeSettings} />
        </div>

        {/* مساحة إعلانية */}
        <div className="mt-10">
          <AdBanner label={t.ads.banner} className="h-16 md:h-20" />
        </div>
      </main>
    </div>
  )
}
