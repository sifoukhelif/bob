// app/admin/blog/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'المدونة | Admin' }

async function togglePublish(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const currentlyPublished = formData.get('published') === 'true'
  const admin = createAdminClient()
  await admin.from('blog_posts').update({
    is_published: !currentlyPublished,
    published_at: !currentlyPublished ? new Date().toISOString() : null,
  }).eq('id', id)
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
}

async function deletePost(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('blog_posts').delete().eq('id', id)
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
}

export default async function AdminBlogPage() {
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('blog_posts')
    .select('id,title,slug,is_published,published_at,created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-1">المدونة</h1>
          <p className="text-gray-500 text-sm">{posts?.length ?? 0} مقال</p>
        </div>
        <Link href="/admin/blog/new"
          className="bg-[#C9A84C] text-[#08080E] px-5 py-2.5 rounded-full font-black text-sm hover:opacity-90 transition-opacity">
          + مقال جديد
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-xs text-gray-500">
              <th className="text-right px-5 py-3 font-medium">العنوان</th>
              <th className="text-right px-5 py-3 font-medium">الحالة</th>
              <th className="text-right px-5 py-3 font-medium">التاريخ</th>
              <th className="text-right px-5 py-3 font-medium">الإجراءات</th>
            </tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-5 py-3 font-medium truncate max-w-[280px]">{p.title}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.is_published ? 'bg-[#2ECC9A]/10 text-[#2ECC9A]' : 'bg-white/10 text-gray-400'}`}>
                      {p.is_published ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString('ar-SA')}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link href={`/admin/blog/edit/${p.id}`} className="text-xs text-[#C9A84C] hover:underline">تعديل ✏️</Link>
                      <form action={togglePublish}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="published" value={String(p.is_published)} />
                        <button type="submit" className="text-xs text-gray-400 hover:text-white transition-colors">
                          {p.is_published ? 'إلغاء النشر' : 'نشر'}
                        </button>
                      </form>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">حذف 🗑️</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#111118] border border-white/5 rounded-2xl p-12 text-center text-gray-500 text-sm">
          لا توجد مقالات بعد.{' '}
          <Link href="/admin/blog/new" className="text-[#C9A84C] hover:underline">أضف أول مقال ←</Link>
        </div>
      )}
    </div>
  )
}
