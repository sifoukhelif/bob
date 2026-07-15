// app/become-seller/done/page.tsx
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { BecomeSellerDoneClient } from './done-client'

export default async function BecomeSellerDone() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return <BecomeSellerDoneClient preparingText={t.becomeSellerDone.preparingText} />
}
