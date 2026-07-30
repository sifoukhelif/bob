// app/admin/blog/edit/[id]/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'تعديل مقال | Admin' }

function slugify(input: string): string {
  return input.trim().toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function updatePost(formData: FormData) {
  'use server'
  const admin = createAdminClient()
  const id = formData.get('id') as string

  const title = (formData.get('title') as string)?.trim()
  let slug = (formData.get('slug') as string)?.trim()
  const excerpt = (formData.get('excerpt') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const authorName = (formData.get('author_name') as string)?.trim() || 'DEGITALE'
  const isPublished = formData.get('is_published') === 'on'
  const coverFile = formData.get('cover_image') as File | null
  const keepExistingCover = formData.get('keep_cover') === 'on'

  if (!title || title.length < 3) redirect(`/admin/blog/edit/${id}?error=` + encodeURIComponent('العنوان قصير جداً'))
  if (!content || content.length < 10) redirect(`/admin/blog/edit/${id}?error=` + encodeURIComponent('المحتوى قصير جداً'))
  if (!slug) redirect(`/admin/blog/edit/${id}?error=` + encodeURIComponent('الرابط (slug) مطلوب'))
  slug = slugify(slug)

  const update: Record<string, any> = {
    title, slug, excerpt, content, author_name: authorName,
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  }

  if (!keepExistingCover && coverFile && coverFile.size > 0) {
    const path = `blog/${crypto.randomUUID()}-${coverFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
    const { error: uploadError } = await admin.storage.from('listing-images').upload(path, coverFile)
    if (!uploadError) {
      const { data: publicUrlData } = admin.storage.from('listing-images').getPublicUrl(path)
      update.cover_image_url = publicUrlData.publicUrl
    }
  }

  const { data: existing } = await admin.from('blog_posts').select('is_published').eq('id', id).maybeSingle()
  if (isPublished && !existing?.is_published) update.published_at = new Date().toISOString()

  const { error } = await admin.from('blog_posts').update(update).eq('id', id)
  if (error) {
    const message = error.code === '23505' ? 'رابط (slug) مستخدم بالفعل، جرّب رابط آخر' : 'تعذّر تحديث المقال'
    redirect(`/admin/blog/edit/${id}?error=` + encodeURIComponent(message))
  }

  redirect('/admin/blog')
}

export default async function EditBlogPostPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params
  const { error } = await searchParams
  const admin = createAdminClient()
  const { data: post } = await admin.from('blog_posts').select('*').eq('id', id).maybeSingle()
  if (!post) notFound()

  return (
    <div className="max-w-2xl">
      <Link href="/admin/blog" className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors mb-4 inline-block">← المدونة</Link>
      <h1 className="text-3xl font-serif font-bold mb-8">تعديل: {post.title}</h1>

      <form action={updatePost} className="flex flex-col gap-5">
        <input type="hidden" name="id" value={post.id} />

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">العنوان</label>
          <input name="title" type="text" required minLength={3} defaultValue={post.title}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">الرابط (slug)</label>
          <input name="slug" type="text" dir="ltr" required defaultValue={post.slug}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">مقتطف قصير</label>
          <input name="excerpt" type="text" maxLength={200} defaultValue={post.excerpt ?? ''}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">المحتوى</label>
          <textarea name="content" required minLength={10} rows={14} defaultValue={post.content}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 resize-y" />
        </div>

        {post.cover_image_url && (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">📄 الصورة الحالية</label>
            <img src={post.cover_image_url} alt="" className="w-40 h-24 object-cover rounded-xl border border-white/10 mb-2" />
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input type="checkbox" name="keep_cover" defaultChecked className="w-3.5 h-3.5 accent-[#C9A84C]" />
              احتفظ بهذي الصورة (فك التحديد لرفع صورة جديدة أدناه)
            </label>
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">{post.cover_image_url ? 'صورة غلاف جديدة (اختياري)' : 'صورة الغلاف (اختياري)'}</label>
          <input name="cover_image" type="file" accept="image/jpeg,image/png,image/webp"
            className="w-full text-sm text-gray-400 file:bg-white/5 file:border file:border-white/10 file:text-white file:rounded-xl file:px-4 file:py-2 file:mr-3 file:text-xs file:font-bold file:cursor-pointer" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">اسم الكاتب</label>
          <input name="author_name" type="text" defaultValue={post.author_name}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" name="is_published" defaultChecked={post.is_published} className="w-4 h-4 accent-[#C9A84C]" />
          منشور
        </label>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">{error}</div>}

        <button type="submit"
          className="w-full bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity mt-2">
          حفظ التعديلات
        </button>
      </form>
    </div>
  )
}
