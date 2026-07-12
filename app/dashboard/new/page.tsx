// app/dashboard/new/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NewListingForm } from './form'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

export const metadata = { title: 'إضافة منتج جديد' }

export default async function NewListingPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard/new')
  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle()
  if (!store) redirect('/become-seller')
  const { data: categories } = await supabase
    .from('categories')
    .select('id,slug,name_ar,type,parent_id')
    .eq('is_active', true)
    .order('position')

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">{t.newListing.backToDashboard}</Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} />
            <span className="font-bold tracking-widest uppercase text-sm">DEGITALE</span>
          </div>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-3xl font-serif font-bold mb-2">{t.newListing.title}</h1>
        <p className="text-gray-500 text-sm mb-10">{t.newListing.subtitle}</p>
        <NewListingForm storeId={store.id} categories={categories ?? []} locale={locale} />
      </main>
    </div>
  )
}
