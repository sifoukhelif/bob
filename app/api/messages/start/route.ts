import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { sellerId, listingId } = await req.json()
    if (!sellerId) return NextResponse.json({ error: 'sellerId required' }, { status: 400 })

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.id === sellerId) {
      return NextResponse.json({ error: 'cannot_message_self' }, { status: 422 })
    }

    let query = supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)

    query = listingId ? query.eq('listing_id', listingId) : query.is('listing_id', null)

    const { data: existing } = await query.maybeSingle()
    if (existing) return NextResponse.json({ conversationId: existing.id })

    const { data: created, error } = await supabase
      .from('conversations')
      .insert({ buyer_id: user.id, seller_id: sellerId, listing_id: listingId ?? null })
      .select('id')
      .single()

    if (error || !created) {
      return NextResponse.json({ error: 'تعذّر بدء المحادثة' }, { status: 500 })
    }

    return NextResponse.json({ conversationId: created.id })
  } catch (err) {
    console.error('[messages/start]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
