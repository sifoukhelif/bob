// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendContactAdminNotification, sendContactUserConfirmation } from '@/lib/email/notifications'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'invalid_name' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'invalid_message' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
      user_id: user?.id ?? null,
    })

    if (error) {
      console.error('[contact] insert error:', error)
      return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }

    try {
      await sendContactAdminNotification({ name: name.trim(), email: email.trim(), subject: subject?.trim() || null, message: message.trim() })
      await sendContactUserConfirmation({ userEmail: email.trim(), name: name.trim() })
    } catch (err) {
      console.error('[contact] notification error:', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
