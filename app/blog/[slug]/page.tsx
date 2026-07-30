// app/blog/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdStrip } from '@/components/ad-slot'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'
import { safeDecodeSlug } from '@/lib/slug'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = safeDecodeSlug(rawSlug)
  const supabase = await createServerClient()
  const { data } = await supabase.from('blog_posts').select('title,excerpt').eq('slug', slug).eq('is_published', true).maybeSingle()
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  if (!data) return { title: t.blog.notFoundTitle }
  return { title: data.title, description: data.excerpt ?? undefined }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug: rawSlug } = await params
  const slug = safeDecodeSlug(rawSlug)
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const supabase = await createServerClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('id,title,content,cover_image_url,author_name,published_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!post) notFound()

  const paragraphs = post.content.split(/\n\s*\n/).filter(Boolean)

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <Link href="/blog" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{t.blog.backToBlog}</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-8">
          <span>{t.blog.byAuthor} {post.author_name}</span>
          {post.published_at && (
            <>
              <span>·</span>
              <span>{t.blog.publishedOn} {new Date(post.published_at).toLocaleDateString()}</span>
            </>
          )}
        </div>

        {post.cover_image_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-10 bg-[#111118]">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="flex flex-col gap-5 text-gray-300 leading-relaxed mb-14">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </article>

        <AdStrip label={t.ads.strip} className="w-full" />
      </main>
    </div>
  )
}
