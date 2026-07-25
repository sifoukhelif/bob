// lib/notify-inapp.ts
import { createAdminClient } from '@/lib/supabase/admin'

export async function createNotification(params: {
  userId: string
  type: 'order_confirmed' | 'sale' | 'new_listing' | string
  title: string
  body?: string | null
  link?: string | null
}) {
  const admin = createAdminClient()
  try {
    await admin.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      link: params.link ?? null,
    })
  } catch (err) {
    console.error('[notify-inapp] insert failed:', err)
  }
}
