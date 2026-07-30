// app/blog/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AdBanner } from '@/components/ad-slot'
import { getServerLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  return { title: t.blog.title, description: t.blog.subtitle }
}

export const dynamic = 'force-dynamic'

export default async function BlogListPage() {
  const locale = await getServerLocale()
  const t = getDictionary(locale)
  const supabase = await createServerClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image_url,author_name,published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#08080E] text-[#F0EDE6]">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08080E]/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold tracking-widest uppercase text-sm hidden sm:block">DEGITALE</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <Link href="/" className="text-xs text-gray-400 hover:text-[#C9A84C] transition-colors">{t.blog.homeLink}</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 text-[#C9A84C] text-[10px] font-black tracking-[0.3em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] inline-block" />
            {t.blog.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">{t.blog.title}</h1>
          <p className="max-w-xl mx-auto text-gray-400 text-lg">{t.blog.subtitle}</p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {posts.map(p => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden hover:border-[#C9A84C]/30 transition-all duration-500 h-full">
                  <div className="aspect-video bg-[#0D0D14] overflow-hidden">
                    {p.cover_image_url
                      ? <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📝</div>}
                  </div>
                  <div className="p-6">
                    <h2 className="text-lg font-serif font-bold mb-2 leading-snug">{p.title}</h2>
                    {p.excerpt && <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{p.excerpt}</p>}
                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                      <span>{t.blog.byAuthor} {p.author_name}</span>
                      {p.published_at && <span>{new Date(p.published_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111118] border border-white/5 rounded-2xl mb-14">
            <h2 className="text-lg font-bold mb-2">{t.blog.emptyTitle}</h2>
            <p className="text-gray-500 text-sm">{t.blog.emptyText}</p>
          </div>
        )}

        <AdBanner label={t.ads.banner} />
      </main>
    </div>
  )
}
