// app/dashboard/delete-listing-button.tsx
'use client'
import { useState } from 'react'

export function DeleteListingButton({
  listingId,
  storeId,
  listingTitle,
  deleteListing,
}: {
  listingId: string
  storeId: string
  listingTitle: string
  deleteListing: (formData: FormData) => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 whitespace-nowrap">متأكد؟</span>
        <form
          action={async (formData) => {
            setLoading(true)
            await deleteListing(formData)
          }}
        >
          <input type="hidden" name="id" value={listingId} />
          <input type="hidden" name="storeId" value={storeId} />
          <button
            type="submit"
            disabled={loading}
            className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-lg font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'نعم، احذف'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
        >
          إلغاء
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-red-400 hover:underline whitespace-nowrap"
      title={`حذف ${listingTitle}`}
    >
      حذف 🗑️
    </button>
  )
}
