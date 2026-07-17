// app/api/notify/new-listing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminNewListingNotification } from '@/lib/email/notifications'

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    const admin = createAdminClient()
    const { data: listing } = await admin
      .from('listings')
      .select('title, stores(name)')
      .eq('id', listingId).maybeSingle()

    if (listing) {
      await sendAdminNewListingNotification({
        listingId,
        listingTitle: listing.title,
        sellerStoreName: (listing.stores as any)?.name ?? '',
      })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify/new-listing] error:', err)
    return NextResponse.json({ ok: false }) // لا نكسر تجربة البائع لو فشل الإشعار
  }
}
