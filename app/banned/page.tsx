// app/banned/page.tsx
import { createServerClient } from '@/lib/supabase/server'
export const metadata = { title: 'الحساب محظور' }

export default async function BannedPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  let reason: string | null = null
  if (user) {
    const { data } = await supabase.from('users').select('banned_reason').eq('id', user.id).maybeSingle()
    reason = data?.banned_reason ?? null
  }

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-serif font-bold mb-3">حسابك <span className="text-red-400 italic">محظور</span></h1>
        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          تم تقييد الوصول لحسابك على DEGITALE.
        </p>
        {reason && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 mb-6">
            السبب: {reason}
          </div>
        )}
        <p className="text-gray-600 text-xs leading-relaxed">
          إذا كنت تعتقد أن هذا خطأ، يمكنك التواصل مع الدعم عبر صفحة{' '}
          <a href="/contact" className="text-[#C9A84C] hover:underline">الدعم</a>.
        </p>
      </div>
    </div>
  )
}
