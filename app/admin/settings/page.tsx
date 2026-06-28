// app/admin/settings/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
export const metadata = { title: 'إعدادات المنصة | Admin' }

async function saveSetting(formData: FormData) {
  'use server'
  const key   = formData.get('key') as string
  const value = formData.get('value') as string
  const admin = createAdminClient()
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  await admin.from('platform_settings').upsert({
    key,
    value: JSON.stringify(value),
    updated_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  })
  if (user?.id) {
    await admin.from('admin_logs').insert({
      admin_id: user.id,
      action: 'update_setting',
      target_type: 'setting',
      metadata: { key, value },
    })
  }
  revalidatePath('/admin/settings')
}

const SETTINGS_CONFIG = [
  { key: 'platform_fee_percent', label: 'عمولة المنصة (%)',          type: 'number',  desc: 'النسبة التي تأخذها المنصة من كل عملية بيع (الافتراضي: 20)' },
  { key: 'allow_new_sellers',    label: 'السماح بتسجيل بائعين جدد', type: 'boolean', desc: 'إيقاف هذا يمنع أي مستخدم من فتح متجر جديد' },
  { key: 'maintenance_mode',     label: 'وضع الصيانة',               type: 'boolean', desc: 'تفعيل هذا يعرض صفحة صيانة لجميع الزوار' },
  { key: 'max_file_size_mb',     label: 'الحد الأقصى لحجم الملف (MB)', type: 'number', desc: 'أقصى حجم مسموح للملفات الرقمية المرفوعة' },
]

export default async function AdminSettingsPage() {
  const admin = createAdminClient()
  const { data: settings } = await admin.from('platform_settings').select('key,value,updated_at').order('key')
  const settingsMap = new Map(settings?.map(s => [s.key, s.value]) ?? [])

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-1">إعدادات المنصة</h1>
      <p className="text-gray-500 text-sm mb-8">
        التغييرات تسري فوراً بدون الحاجة لإعادة رفع الكود
      </p>

      <div className="flex flex-col gap-4 max-w-lg">
        {SETTINGS_CONFIG.map(setting => {
          const raw     = settingsMap.get(setting.key)
          const current = raw != null ? JSON.parse(raw as string) : ''

          return (
            <div key={setting.key} className="bg-[#111118] border border-white/5 rounded-2xl p-5">
              <div className="font-semibold text-sm mb-1">{setting.label}</div>
              <div className="text-xs text-gray-500 mb-4">{setting.desc}</div>

              <form action={saveSetting} className="flex items-center gap-3">
                <input type="hidden" name="key" value={setting.key} />

                {setting.type === 'boolean' ? (
                  <select name="value" defaultValue={String(current)}
                    className="bg-white/5 border border-white/10 text-sm px-3 py-2 rounded-lg text-white outline-none flex-1 cursor-pointer">
                    <option value="true">مفعّل ✓</option>
                    <option value="false">موقوف ✗</option>
                  </select>
                ) : (
                  <input type="number" name="value" defaultValue={current}
                    className="bg-white/5 border border-white/10 text-sm px-3 py-2 rounded-lg text-white outline-none flex-1 focus:border-[#C9A84C]/40 transition-colors" />
                )}

                <button type="submit"
                  className="bg-[#C9A84C] text-[#08080E] text-xs font-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                  حفظ
                </button>
              </form>

              {raw != null && (
                <div className="text-[10px] text-gray-600 mt-2">
                  القيمة الحالية: <span className="text-[#C9A84C] font-mono">{current}</span>
                  {settings?.find(s => s.key === setting.key)?.updated_at && (
                    <span className="mr-2">
                      · آخر تعديل: {new Date(settings!.find(s => s.key === setting.key)!.updated_at).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Danger Zone */}
      <div className="mt-10 max-w-lg">
        <div className="border border-red-500/15 rounded-2xl p-5">
          <h2 className="font-semibold text-sm text-red-400 mb-1">منطقة الخطر</h2>
          <p className="text-xs text-gray-500 mb-4">
            هذه الإجراءات لا يمكن التراجع عنها. تأكد جيداً قبل المتابعة.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
              <span className="text-xs text-gray-400">مسح بيانات التجربة</span>
              <button disabled className="text-xs text-red-400 opacity-40 cursor-not-allowed">
                متاح قريباً
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
