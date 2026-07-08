// proxy.ts — Next.js 16 network boundary (formerly middleware.ts)
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  // نستخدم getUser() بدل getSession() — يتحقق من صلاحية الجلسة فعلياً
  // عبر سيرفر Supabase Auth، بدل الاكتفاء بقراءة الكوكيز المحلية فقط
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined
  // مستخدم محظور: يُمنع من كل المسارات المحمية ويُعاد توجيهه لصفحة الحظر
  if (user && pathname !== '/banned' && !pathname.startsWith('/api/webhooks')) {
    const { data: profile } = await supabase
      .from('users').select('is_banned').eq('id', user.id).maybeSingle()
    if (profile?.is_banned) {
      return NextResponse.redirect(new URL('/banned', request.url))
    }
  }
  // /admin — admin only
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login?redirectTo=/admin', request.url))
    if (role !== 'admin') return NextResponse.redirect(new URL('/', request.url))
  }
  // /dashboard — seller + admin
  if (pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login?redirectTo=/dashboard', request.url))
    if (role !== 'seller' && role !== 'admin')
      return NextResponse.redirect(new URL('/become-seller', request.url))
  }
  // /checkout /orders — any authenticated user
  if (pathname.startsWith('/checkout') || pathname.startsWith('/orders')) {
    if (!user)
      return NextResponse.redirect(new URL(`/login?redirectTo=${pathname}`, request.url))
  }
  return response
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp|ico|woff2)).*)',],
}
