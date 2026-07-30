// app/admin/blog/new/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'مقال جديد | Admin' }

function slugify(input: string): string {
  return input.trim().toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function createPost(formData: FormData) {
  'use server'
  const admin = createAdminClient()

  const title = (formData.get('title') as string)?.trim()
  let slug = (formData.get('slug') as string)?.trim()
  const excerpt = (formData.get('excerpt') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const authorName = (formData.get('author_name') as string)?.trim() || 'DEGITALE'
  const isPublished = formData.get('is_published') === 'on'
  const coverFile = formData.get('cover_image') as File | null

  if (!title || title.length < 3) redirect('/admin/blog/new?error=' + encodeURIComponent('العنوان قصير جداً'))
  if (!content || content.length < 10) redirect('/admin/blog/new?error=' + encodeURIComponent('المحتوى قصير جداً'))
  if (!slug) slug = slugify(title)
  else slug = slugify(slug)
  if (!slug) redirect('/admin/blog/new?error=' + encodeURIComponent('الرابط (slug) غير صالح'))

  let coverImageUrl: string | null = null
  if (coverFile && coverFile.size > 0) {
    const path = `blog/${crypto.randomUUID()}-${coverFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
    const { error: uploadError } = await admin.storage.from('listing-images').upload(path, coverFile)
    if (!uploadError) {
      const { data: publicUrlData } = admin.storage.from('listing-images').getPublicUrl(path)
      coverImageUrl = publicUrlData.publicUrl
    }
  }

  const { error } = await admin.from('blog_posts').insert({
    title, slug, excerpt, content,
    author_name: authorName,
    cover_image_url: coverImageUrl,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  })

  if (error) {
    const message = error.code === '23505' ? 'رابط (slug) مستخدم بالفعل، جرّب رابط آخر' : 'تعذّر إنشاء المقال'
    redirect('/admin/blog/new?error=' + encodeURIComponent(message))
  }

  redirect('/admin/blog')
}

export default async function NewBlogPostPage({
  searchParams,
}: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div className="max-w-2xl">
      <Link href="/admin/blog" className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors mb-4 inline-block">← المدونة</Link>
      <h1 className="text-3xl font-serif font-bold mb-8">مقال جديد</h1>

      <form action={createPost} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">العنوان</label>
          <input name="title" type="text" required minLength={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">الرابط (slug) — اختياري، يُولَّد تلقائياً من العنوان لو تركته فاضياً</label>
          <input name="slug" type="text" dir="ltr" placeholder="my-post-title"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">مقتطف قصير (يظهر بقائمة المدونة)</label>
          <input name="excerpt" type="text" maxLength={200}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">المحتوى</label>
          <textarea name="content" required minLength={10} rows={14}
            placeholder="اكتب المقال هنا. كل سطر فاضي يفصل بين فقرة وثانية."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 resize-y" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">صورة الغلاف (اختياري)</label>
          <input name="cover_image" type="file" accept="image/jpeg,image/png,image/webp"
            className="w-full text-sm text-gray-400 file:bg-white/5 file:border file:border-white/10 file:text-white file:rounded-xl file:px-4 file:py-2 file:mr-3 file:text-xs file:font-bold file:cursor-pointer" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">اسم الكاتب</label>
          <input name="author_name" type="text" defaultValue="DEGITALE"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40" />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" name="is_published" className="w-4 h-4 accent-[#C9A84C]" />
          انشر المقال فوراً (وإلا يُحفظ كمسودة)
        </label>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">{error}</div>}

        <button type="submit"
          className="w-full bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity mt-2">
          حفظ المقال
        </button>
      </form>
    </div>
  )
}
