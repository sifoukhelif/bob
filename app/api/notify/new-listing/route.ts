// app/api/notify/new-listing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminNewListingNotification } from '@/lib/email/notifications'
import { createNotification } from '@/lib/notify-inapp'

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    // تحقق من هوية المتصل أولاً — يمنع إغراق بريد الأدمن من أي طرف خارجي
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: listing } = await admin
      .from('listings')
      .select('title, store_id, stores(name, owner_id)')
      .eq('id', listingId).maybeSingle()

    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // تأكد أن المتصل هو فعلاً مالك المتجر الذي يتبعه هذا المنتج
    const ownerId = (listing.stores as any)?.owner_id
    if (ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await sendAdminNewListingNotification({
      listingId,
      listingTitle: listing.title,
      sellerStoreName: (listing.stores as any)?.name ?? '',
    })

    // إشعار داخل الموقع لكل حسابات الأدمن (لا يوقف التدفق لو فشل)
    try {
      const { data: admins } = await admin.from('users').select('id').eq('role', 'admin')
      for (const a of admins ?? []) {
        await createNotification({
          userId: a.id,
          type: 'new_listing',
          title: 'منتج جديد بانتظار المراجعة',
          body: listing.title,
          link: '/admin/products',
        })
      }
    } catch (err) {
      console.error('[notify/new-listing] in-app notification error:', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify/new-listing] error:', err)
    return NextResponse.json({ ok: false }) // لا نكسر تجربة البائع لو فشل الإشعار
  }
}
