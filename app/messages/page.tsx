import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { redirect } from 'next/navigation'
import { AdBanner } from '@/components/ad-slot'

export default async function MessagesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/messages')

  const locale = await getServerLocale()
  const t = getDictionary(locale).messages

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`id,buyer_id,seller_id,last_message,last_message_at,buyer_unread_count,seller_unread_count,
      buyer:buyer_id(username,email,avatar_url), seller:seller_id(username,email,avatar_url)`)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-white mb-6">{t.title}</h1>
      <AdBanner label="مساحة إعلانية" className="mb-6" />

      {conversations && conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((c: any) => {
            const isBuyer = c.buyer_id === user.id
            const other = isBuyer ? c.seller : c.buyer
            const unread = isBuyer ? c.buyer_unread_count : c.seller_unread_count
            const otherName = other?.username ?? other?.email ?? '—'
            return (
              <Link key={c.id} href={`/messages/${c.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C9A84C]/40 transition-all">
                <span className="w-10 h-10 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center text-sm font-black overflow-hidden shrink-0">
                  {other?.avatar_url ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" /> : otherName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{otherName}</p>
                  <p className="text-xs text-gray-500 truncate">{c.last_message ?? t.noMessagesYet}</p>
                </div>
                {unread > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#C9A84C] text-[#08080E] text-[10px] font-black flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-600 text-sm">{t.emptyConversations}</div>
      )}
    </div>
  )
}
