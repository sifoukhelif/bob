// app/dashboard/new/form.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'

type Category = { id: string; slug: string; name_ar: string | null; type: 'product' | 'service'; parent_id: string | null }

function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf('.')
  const ext = lastDot !== -1 ? name.slice(lastDot) : ''
  const base = lastDot !== -1 ? name.slice(0, lastDot) : name
  const cleanBase = base
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
  return `${cleanBase || 'file'}${ext.toLowerCase()}`
}

function buildCategoryGroups(categories: Category[], type: 'product' | 'service') {
  const ofType = categories.filter(c => c.type === type)
  const mains = ofType.filter(c => !c.parent_id)
  return mains.map(main => ({
    main,
    subs: ofType.filter(c => c.parent_id === main.id),
  })).filter(group => group.subs.length > 0)
}

export function NewListingForm({ storeId, categories }: { storeId: string; categories: Category[] }) {
  const router = useRouter()
  const [type, setType] = useState<'product' | 'service'>('product')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categoryGroups = buildCategoryGroups(categories, type)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setImage(f)
    setImagePreview(f ? URL.createObjectURL(f) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim() || title.trim().length < 3) {
      setError('عنوان المنتج يجب أن يكون 3 أحرف على الأقل')
      return
    }
    const priceNum = parseFloat(price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('أدخل سعراً صحيحاً')
      return
    }
    if (type === 'product' && !file) {
      setError('يجب رفع ملف المنتج الرقمي')
      return
    }

    setLoading(true)
    try {
      const sb = getBrowserClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        router.push('/login?redirectTo=/dashboard/new')
        return
      }

      let thumbnailUrl: string | null = null
      if (image) {
        const imgPath = `${user.id}/${crypto.randomUUID()}-${sanitizeFileName(image.name)}`
        const { error: imgError } = await sb.storage.from('listing-images').upload(imgPath, image)
        if (imgError) {
          console.error('Image upload error:', imgError)
          throw new Error(`تعذّر رفع الصورة: ${imgError.message}`)
        }
        const { data: publicUrlData } = sb.storage.from('listing-images').getPublicUrl(imgPath)
        thumbnailUrl = publicUrlData.publicUrl
      }

      const { data: listing, error: insertError } = await sb
        .from('listings')
        .insert({
          store_id: storeId,
          type,
          title: title.trim(),
          description: description.trim() || null,
          category_id: categoryId || null,
          base_price: priceNum,
          thumbnail_url: thumbnailUrl,
          status: 'pending_review',
        })
        .select('id')
        .single()

      if (insertError || !listing) {
        throw new Error('تعذّر إنشاء المنتج، حاول مرة أخرى')
      }

      if (type === 'product' && file) {
        const path = `${user.id}/${listing.id}/${sanitizeFileName(file.name)}`
        const { error: uploadError } = await sb.storage.from('listing-files').upload(path, file)
        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          throw new Error(`تعذّر رفع الملف: ${uploadError.message}`)
        }
        await sb.from('listing_files').insert({
          listing_id: listing.id,
          storage_path: path,
          original_name: file.name,
          file_size_bytes: file.size,
          mime_type: file.type || null,
        })
      }

      router.push('/dashboard?created=1')
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex rounded-xl bg-black/30 p-1">
        {(['product', 'service'] as const).map(t => (
          <button key={t} type="button" onClick={() => { setType(t); setCategoryId('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${type === t ? 'bg-[#C9A84C] text-[#08080E]' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'product' ? 'منتج رقمي' : 'خدمة'}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">صورة الغلاف</label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <img src={imagePreview} alt="معاينة" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 text-xs">
              بدون صورة
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors file:mr-3 file:bg-[#C9A84C] file:text-[#08080E] file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:text-xs file:font-bold file:cursor-pointer" />
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5">هذي الصورة تظهر للمشترين في المتجر والصفحة الرئيسية.</p>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">العنوان</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required minLength={3} maxLength={100}
          placeholder="مثال: قالب لوحة تحكم لمتجر إلكتروني"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">الوصف</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
          placeholder="اشرح ما يحصل عليه المشتري بالتفصيل"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">التصنيف</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors cursor-pointer">
            <option value="" style={{ backgroundColor: '#111118', color: '#F0EDE6' }}>اختر تصنيفاً</option>
            {categoryGroups.map(group => (
              <optgroup key={group.main.id} label={group.main.name_ar ?? group.main.slug} style={{ backgroundColor: '#111118', color: '#C9A84C' }}>
                {group.subs.map(sub => (
                  <option key={sub.id} value={sub.id} style={{ backgroundColor: '#111118', color: '#F0EDE6' }}>{sub.name_ar ?? sub.slug}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">السعر (USD)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" required dir="ltr"
            placeholder="29.00"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#C9A84C]/40 transition-colors" />
        </div>
      </div>

      {type === 'product' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">ملف المنتج</label>
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors file:mr-3 file:bg-[#C9A84C] file:text-[#08080E] file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:text-xs file:font-bold file:cursor-pointer" />
          <p className="text-[10px] text-gray-600 mt-1.5">هذا هو الملف الذي سيستلمه المشتري بعد الدفع.</p>
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">{error}</div>}

      <button type="submit" disabled={loading}
        className="w-full bg-[#C9A84C] text-[#08080E] py-3.5 rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
        {loading ? 'جارٍ الإرسال…' : 'إرسال للمراجعة'}
      </button>
    </form>
  )
}
