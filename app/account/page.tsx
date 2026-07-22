// app/account/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { revalidatePath } from 'next/cache'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { AvatarForm } from './avatar-form'
import { PasswordForm } from './password-form'
import { EmailForm } from './email-form'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.account.pageTitle }
}

function sanitizeUsername(raw: string) {
  const clean = raw.replace(/[^a-zA-Z0-9_ ]/g, '').trim()
  return clean.replace(/\s+/g, ' ').slice(0, 30)
}

async function updateUsername(formData: FormData) {
  'use server'
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/account')

  const raw = (formData.get('username') as string) ?? ''
  const clean = sanitizeUsername(raw)

  if (clean.length < 2) {
    redirect('/account?error=' + encodeURIComponent(t.account.errorTooShort))
  }

  const { error } = await supabase.from('users').update({ username: clean }).eq('id', user.id)
  if (error) {
    const message = error.code === '23505'
      ? t.account.errorTaken
      : t.account.errorSaveFailed
    redirect('/account?error=' + encodeURIComponent(message))
  }

  revalidatePath('/account')
  redirect('/account?success=1')
}

export default async function AccountPage({
  searchParams,
}: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const { error, success } = await searchParams
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/account')

  const { data: profile } = await supabase.from('users').select('username,avatar_url').eq('id', user.id).maybeSingle()
  const initial = (profile?.username || user.email || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{t.account.homeLink}</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-28 pb-24 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">{t.account.title}</h1>
          <p className="text-gray-500 text-sm" dir="ltr">{user.email}</p>
        </div>

        <AvatarForm t={t.account.avatar} userId={user.id} initialAvatarUrl={profile?.avatar_url ?? null} initialInitial={initial} />

        <div className="bg-[#111118] border border-white/6 rounded-2xl p-6 max-w-md">
          <h2 className="text-sm font-bold text-gray-300 mb-4">{t.account.usernameSectionTitle}</h2>
          <form action={updateUsername} className="flex flex-col gap-4">
            <div>
              <input
                name="username"
                type="text"
                dir="ltr"
                defaultValue={profile?.username ?? ''}
                placeholder={t.account.usernamePlaceholder}
                minLength={2}
                maxLength={30}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-1.5">{t.account.usernameHint}</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}
            {success === '1' && (
              <div className="bg-[#2ECC9A]/10 border border-[#2ECC9A]/20 rounded-xl px-4 py-3 text-xs text-[#2ECC9A]">
                {t.account.successMessage}
              </div>
            )}

            <button type="submit"
              className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
              {t.account.saveButton}
            </button>
          </form>
        </div>

        <PasswordForm t={t.account.password} email={user.email ?? ''} />

        <EmailForm t={t.account.email} currentEmail={user.email ?? ''} />

        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 max-w-md">
          <h2 className="text-sm font-bold text-red-400 mb-2">{t.account.dangerZone.title}</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">{t.account.dangerZone.text}</p>
          <Link href="/contact" className="text-xs text-red-400 hover:underline font-bold">{t.account.dangerZone.cta}</Link>
        </div>
      </main>
    </div>
  )
}
