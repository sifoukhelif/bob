// app/admin/users/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { RoleSelect } from './role-select'

export const metadata = { title: 'إدارة المستخدمين | Admin' }

async function changeRole(formData: FormData) {
  'use server'
  const id   = formData.get('id') as string
  const role = formData.get('role') as string
  const admin = createAdminClient()
  await admin.from('users').update({ role: role as any }).eq('id', id)
  await admin.auth.admin.updateUserById(id, { app_metadata: { role } })
  revalidatePath('/admin/users')
}

async function banUser(formData: FormData) {
  'use server'
  const id     = formData.get('id') as string
  const reason = formData.get('reason') as string
  const admin  = createAdminClient()
  await admin.from('users').update({ is_banned: true, banned_reason: reason }).eq('id', id)
  revalidatePath('/admin/users')
}

async function unbanUser(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('users').update({ is_banned: false, banned_reason: null }).eq('id', id)
  revalidatePath('/admin/users')
}

export default async function AdminUsersPage() {
  const admin = createAdminClient()
  const { data: users } = await admin
    .from('users')
    .select('id,full_name,email,role,is_banned,banned_reason,created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  // جلب الإيميلات من auth
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 200 })
  const emailMap = new Map<string, string | undefined>(
    authData?.users.map((u): [string, string | undefined] => [u.id, u.email]) ?? []
  )

  const ROLE_LABELS: Record<string, string> = { buyer: 'مشترٍ', seller: 'بائع', admin: 'أدمن' }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-1">إدارة المستخدمين</h1>
      <p className="text-gray-500 text-sm mb-8">{users?.length ?? 0} مستخدم مسجّل</p>
      <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-gray-500">
              <th className="text-right px-5 py-3 font-medium">المستخدم</th>
              <th className="text-right px-5 py-3 font-medium">الدور</th>
              <th className="text-right px-5 py-3 font-medium">الحالة</th>
              <th className="text-right px-5 py-3 font-medium">تاريخ الانضمام</th>
              <th className="text-right px-5 py-3 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                {/* User info */}
                <td className="px-5 py-3">
                  <div className="font-medium text-sm">{user.full_name ?? '—'}</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {emailMap.get(user.id) ?? user.email ?? user.id.slice(0, 12) + '…'}
                  </div>
                </td>

                {/* Role selector */}
                <td className="px-5 py-3">
                  <RoleSelect userId={user.id} currentRole={user.role ?? 'buyer'} changeRole={changeRole} />
                </td>

                {/* Status badge */}
                <td className="px-5 py-3">
                  {user.is_banned ? (
                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full font-bold">محظور</span>
                  ) : (
                    <span className="text-xs bg-[#2ECC9A]/10 text-[#2ECC9A] px-2 py-1 rounded-full font-bold">نشط</span>
                  )}
                </td>

                {/* Join date */}
                <td className="px-5 py-3 text-xs text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('ar-SA')}
                </td>

                {/* Ban / Unban */}
                <td className="px-5 py-3">
                  {user.is_banned ? (
                    <form action={unbanUser} className="inline">
                      <input type="hidden" name="id" value={user.id} />
                      <button type="submit"
                        className="text-xs text-[#2ECC9A] hover:underline whitespace-nowrap">
                        رفع الحظر
                      </button>
                    </form>
                  ) : (
                    <form action={banUser} className="inline-flex items-center gap-2">
                      <input type="hidden" name="id" value={user.id} />
                      <input type="text" name="reason" placeholder="سبب الحظر"
                        className="bg-white/5 border border-white/10 text-xs px-2 py-1 rounded-lg w-28 text-white placeholder-gray-600 outline-none focus:border-red-500/30" />
                      <button type="submit"
                        className="text-xs text-red-400 hover:underline whitespace-nowrap">
                        حظر
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="text-center py-12 text-gray-600 text-sm">لا يوجد مستخدمون بعد</div>
        )}
      </div>
    </div>
  )
}
