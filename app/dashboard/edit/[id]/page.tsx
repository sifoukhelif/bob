// app/dashboard/edit/[id]/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { EditListingForm } from './form'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { getTranslatedCategories } from '@/lib/translate'

export const metadata = { title: 'تعديل المنتج' }

export default async function EditListingPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = await getServerLocale()
  const t = getDictionary(locale)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/dashboard/edit/${id}`)
  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle()
  if (!store) redirect('/become-seller')
  const { data: listing } = await supabase
    .from('listings')
    .select('id,store_id,type,title,description,category_id,base_price,status,thumbnail_url')
    .eq('id', id)
    .eq('store_id', store.id)
    .maybeSingle()
  if (!listing) notFound()
  const { data: categoriesRaw } = await supabase
    .from('categories')
    .select('id,slug,name_ar,type,parent_id')
    .eq('is_active', true)
    .order('position')
  const categories = await getTranslatedCategories(categoriesRaw ?? [], locale)
  const { data: existingFile } = await supabase
    .from('listing_files')
    .select('original_name')
    .eq('listing_id', id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">{t.editListing.backToDashboard}</Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} />
            <span className="font-bold tracking-widest uppercase text-sm">DEGITALE</span>
          </div>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-3xl font-serif font-bold mb-2">{t.editListing.title}</h1>
        <p className="text-gray-500 text-sm mb-10">{t.editListing.subtitle}</p>
        <EditListingForm
          listingId={listing.id}
          storeId={store.id}
          categories={categories}
          initial={{
            type: listing.type,
            title: listing.title,
            description: listing.description ?? '',
            categoryId: listing.category_id ?? '',
            price: String(listing.base_price ?? ''),
            thumbnailUrl: listing.thumbnail_url ?? null,
          }}
          existingFileName={existingFile?.original_name ?? null}
          locale={locale}
        />
      </main>
    </div>
  )
}
