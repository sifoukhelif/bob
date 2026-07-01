// app/account/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'إعدادات الحساب' }

function sanitizeUsername(raw: string) {
  const clean = raw.replace(/[^a-zA-Z0-9_ ]/g, '').trim()
  return clean.replace(/\s+/g, ' ').slice(0, 30)
}

async function updateUsername(formData: FormData) {
  'use server'
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/account')

  const raw = (formData.get('username') as string) ?? ''
  const clean = sanitizeUsername(raw)

  if (clean.length < 2) {
    redirect('/account?error=' + encodeURIComponent('اسم المستخدم يجب أن يكون حرفين على الأقل'))
  }

  const { error } = await supabase.from('users').update({ username: clean }).eq('id', user.id)
  if (error) {
    const message = error.code === '23505'
      ? 'هذا الاسم مستخدم بالفعل، جرّب اسماً آخر'
      : 'تعذّر حفظ الاسم، حاول مرة أخرى'
    redirect('/account?error=' + encodeURIComponent(message))
  }

  revalidatePath('/account')
  redirect('/account?success=1')
}

export default async function AccountPage({
  searchParams,
}: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/account')

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">الرئيسية</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-3xl font-serif font-bold mb-2">إعدادات الحساب</h1>
        <p className="text-gray-500 text-sm mb-10" dir="ltr">{user.email}</p>

        <form action={updateUsername} className="bg-[#111118] border border-white/6 rounded-2xl p-6 flex flex-col gap-4 max-w-md">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">اسم المستخدم</label>
            <input
              name="username"
              type="text"
              dir="ltr"
              defaultValue={profile?.username ?? ''}
              placeholder="Sif Khelif"
              minLength={2}
              maxLength={30}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors"
            />
            <p className="text-[10px] text-gray-600 mt-1.5">
              أحرف إنجليزية، أرقام، مسافات، وشرطة سفلية — يظهر هذا الاسم بدل بريدك في الموقع.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}
          {success === '1' && (
            <div className="bg-[#2ECC9A]/10 border border-[#2ECC9A]/20 rounded-xl px-4 py-3 text-xs text-[#2ECC9A]">
              ✅ تم حفظ اسم المستخدم بنجاح
            </div>
          )}

          <button type="submit"
            className="w-full bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity mt-2">
            حفظ التغييرات
          </button>
        </form>
      </main>
    </div>
  )
}
