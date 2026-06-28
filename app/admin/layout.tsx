// app/admin/layout.tsx — double protection: middleware + server-side check
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

const NAV = [
  { href: '/admin',          emoji: '◼', label: 'لوحة التحكم' },
  { href: '/admin/users',    emoji: '👥', label: 'المستخدمون' },
  { href: '/admin/products', emoji: '📦', label: 'المنتجات'   },
  { href: '/admin/settings', emoji: '⚙️', label: 'الإعدادات'  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/admin')
  if (user.app_metadata?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6] flex">
      <aside className="w-60 bg-[#0D0D14] border-l border-white/5 flex flex-col fixed h-full z-40">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C9A84C] rounded-lg flex items-center justify-center text-[#08080E] font-black text-sm">A</div>
            <div>
              <div className="font-bold text-sm">DEGITALE</div>
              <div className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-widest">Super Admin</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <span>{item.emoji}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <p className="text-[11px] text-gray-500 truncate" dir="ltr">{user.email}</p>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← العودة للموقع</Link>
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 mr-60 p-8 min-h-screen">{children}</main>
    </div>
  )
}
