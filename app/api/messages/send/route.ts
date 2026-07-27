import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notify-inapp'

export async function POST(req: NextRequest) {
  try {
    const { conversationId, body } = await req.json()
    if (!conversationId || !body?.trim()) {
      return NextResponse.json({ error: 'conversationId and body required' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: conversation } = await supabase
      .from('conversations')
      .select('id,buyer_id,seller_id')
      .eq('id', conversationId)
      .maybeSingle()

    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, body: body.trim() })
      .select('id,body,sender_id,created_at')
      .single()

    if (error || !message) {
      return NextResponse.json({ error: 'تعذّر إرسال الرسالة' }, { status: 500 })
    }

    try {
      const recipientId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id
      await createNotification({
        userId: recipientId,
        type: 'new_message',
        title: 'رسالة جديدة',
        body: body.trim().slice(0, 80),
        link: `/messages/${conversationId}`,
      })
    } catch (err) {
      console.error('[messages/send] notification error:', err)
    }

    return NextResponse.json({ message })
  } catch (err) {
    console.error('[messages/send]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
