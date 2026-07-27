import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { MessageThread } from '@/components/message-thread'

type Params = Promise<{ id: string }>

export default async function ConversationPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/messages/${id}`)

  const { data: conversation } = await supabase
    .from('conversations')
    .select(`id,buyer_id,seller_id,
      buyer:buyer_id(username,email,avatar_url), seller:seller_id(username,email,avatar_url)`)
    .eq('id', id)
    .maybeSingle()

  if (!conversation) notFound()
  if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('id,body,sender_id,created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const isBuyer = conversation.buyer_id === user.id
  await supabase.from('messages').update({ is_read: true })
    .eq('conversation_id', id).neq('sender_id', user.id).eq('is_read', false)
  await supabase.from('conversations')
    .update(isBuyer ? { buyer_unread_count: 0 } : { seller_unread_count: 0 })
    .eq('id', id)

  const other = isBuyer ? conversation.seller : conversation.buyer
  const locale = await getServerLocale()
  const t = getDictionary(locale).messages

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a href="/messages" className="text-xs text-gray-500 hover:text-[#C9A84C]">{t.backToMessages}</a>
      <h1 className="text-lg font-bold text-white mt-2 mb-6" dir="ltr">
        {(other as any)?.username ?? (other as any)?.email ?? '—'}
      </h1>
      <MessageThread
        conversationId={id}
        currentUserId={user.id}
        initialMessages={messages ?? []}
        dict={t}
      />
    </div>
  )
}
