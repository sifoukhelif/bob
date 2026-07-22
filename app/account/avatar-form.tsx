// app/account/avatar-form.tsx
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

type AvatarDict = {
  sectionTitle: string; changeButton: string; uploading: string; saved: string
  errorUpload: string; errorType: string; errorSize: string
}

export function AvatarForm({ t, userId, initialAvatarUrl, initialInitial }: {
  t: AvatarDict; userId: string; initialAvatarUrl: string | null; initialInitial: string
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setSaved(false)

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(t.errorType)
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t.errorSize)
      return
    }

    setUploading(true)
    try {
      const sb = getBrowserClient()
      const path = `${userId}/avatar-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
      const { error: uploadError } = await sb.storage.from('listing-images').upload(path, file)
      if (uploadError) throw uploadError

      const { data: publicUrlData } = sb.storage.from('listing-images').getPublicUrl(path)
      const newUrl = publicUrlData.publicUrl

      const { error: updateError } = await sb.from('users').update({ avatar_url: newUrl }).eq('id', userId)
      if (updateError) throw updateError

      setAvatarUrl(newUrl)
      setSaved(true)
    } catch {
      setError(t.errorUpload)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="bg-[#111118] border border-white/6 rounded-2xl p-6 max-w-md">
      <h2 className="text-sm font-bold text-gray-300 mb-4">{t.sectionTitle}</h2>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C] text-2xl font-black shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : initialInitial}
        </div>
        <div>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors disabled:opacity-50">
            {uploading ? t.uploading : t.changeButton}
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
      {saved && <p className="text-xs text-[#2ECC9A] mt-3">{t.saved}</p>}
    </div>
  )
}
