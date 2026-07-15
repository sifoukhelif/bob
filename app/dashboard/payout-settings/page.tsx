// app/dashboard/payout-settings/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PayoutSettingsForm } from './form'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.payoutSettings.title }
}

export default async function PayoutSettingsPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard/payout-settings')

  const { data: profile } = await supabase
    .from('users')
    .select('payout_method,payout_details')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">{t.payoutSettings.backToDashboard}</Link>
          <span className="font-bold tracking-widest uppercase text-sm">DEGITALE</span>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-3xl font-serif font-bold mb-2">{t.payoutSettings.title}</h1>
        <p className="text-gray-500 text-sm mb-10">{t.payoutSettings.subtitle}</p>
        <PayoutSettingsForm
          t={t.payoutSettings}
          initial={{
            method: profile?.payout_method ?? '',
            details: profile?.payout_details ?? '',
          }}
        />
      </main>
    </div>
  )
}
