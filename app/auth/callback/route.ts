// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') || '/'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
    // الرابط منتهي الصلاحية أو استُخدم من قبل
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('رابط التأكيد منتهي الصلاحية، حاول تسجيل الدخول أو إنشاء حساب جديد')}`
    )
  }

  return NextResponse.redirect(`${origin}/login`)
}
