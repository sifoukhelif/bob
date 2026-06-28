// app/api/download/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = Promise<{ token: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: item } = await admin.from('order_items')
    .select('id,download_token,token_expires_at,download_count,listing_id')
    .eq('download_token', token).maybeSingle()

  if (!item)
    return new NextResponse('<h1>رابط غير صالح</h1>', { status: 410, headers: { 'Content-Type': 'text/html' } })

  if (new Date() > new Date(item.token_expires_at))
    return new NextResponse('<h1>انتهت صلاحية الرابط</h1>', { status: 410, headers: { 'Content-Type': 'text/html' } })

  // فك تشفير الـ signed URL
  let signedUrl: string
  try {
    signedUrl = Buffer.from(item.download_token, 'base64').toString('utf-8')
  } catch {
    return new NextResponse('<h1>رابط تالف</h1>', { status: 410, headers: { 'Content-Type': 'text/html' } })
  }

  // تحديث عداد التحميل
  await admin.from('order_items')
    .update({ download_count: (item.download_count ?? 0) + 1 })
    .eq('id', item.id)

  return NextResponse.redirect(signedUrl, { status: 302 })
}
