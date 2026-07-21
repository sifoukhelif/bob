// app/dashboard/store-settings/form.tsx
'use client'
import { useState, useRef } from 'react'
import { getBrowserClient } from '@/lib/supabase/browser'

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

type Store = { id: string; name: string; bio: string | null; banner_url: string | null }
type Dict = {
  bannerLabel: string; bannerHint: string; changeBanner: string
  nameLabel: string; bioLabel: string
  saveButton: string; saving: string; savedSuccess: string; errorGeneric: string
}

export function StoreSettingsForm({ store, t }: { store: Store; t: Dict }) {
  const [name, setName] = useState(store.name)
  const [bio, setBio] = useState(store.bio ?? '')
  const [bannerUrl, setBannerUrl] = useState(store.banner_url)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      const sb = getBrowserClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) throw new Error('unauthorized')

      let finalBannerUrl = bannerUrl
      if (bannerFile) {
        const path = `${user.id}/banner-${crypto.randomUUID()}-${sanitizeFileName(bannerFile.name)}`
        const { error: uploadError } = await sb.storage.from('listing-images').upload(path, bannerFile)
        if (uploadError) throw uploadError
        const { data: publicUrlData } = sb.storage.from('listing-images').getPublicUrl(path)
        finalBannerUrl = publicUrlData.publicUrl
      }

      const { error: updateError } = await sb.from('stores')
        .update({ name: name.trim(), bio: bio.trim() || null, banner_url: finalBannerUrl })
        .eq('id', store.id)
      if (updateError) throw updateError

      setBannerUrl(finalBannerUrl)
      setBannerFile(null)
      setSaved(true)
    } catch {
      setError(t.errorGeneric)
    } finally {
      setSaving(false)
    }
  }

  const displayBanner = previewUrl ?? bannerUrl

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* الغلاف */}
      <div>
        <label className="block text-sm font-semibold mb-2">{t.bannerLabel}</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full aspect-[4/1] rounded-2xl overflow-hidden bg-[#111118] border border-white/10 cursor-pointer group"
        >
          {displayBanner ? (
            <img src={displayBanner} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">🖼️</div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-bold">{t.changeBanner}</span>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileSelect} className="hidden" />
        <p className="text-xs text-gray-600 mt-2">{t.bannerHint}</p>
      </div>

      {/* الاسم */}
      <div>
        <label className="block text-sm font-semibold mb-2">{t.nameLabel}</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full bg-[#111118] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors"
        />
      </div>

      {/* النبذة */}
      <div>
        <label className="block text-sm font-semibold mb-2">{t.bioLabel}</label>
        <textarea
          value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
          className="w-full bg-[#111118] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/40 transition-colors resize-none"
        />
      </div>

      {error && <div className="text-xs text-red-400">{error}</div>}
      {saved && <div className="text-xs text-[#2ECC9A]">{t.savedSuccess}</div>}

      <button
        type="submit" disabled={saving}
        className="bg-[#C9A84C] text-[#08080E] py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 self-start px-8"
      >
        {saving ? t.saving : t.saveButton}
      </button>
    </form>
  )
}
