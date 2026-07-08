// app/admin/users/role-select.tsx
'use client'
import { useState } from 'react'

export function RoleSelect({
  userId,
  currentRole,
  changeRole,
}: {
  userId: string
  currentRole: string
  changeRole: (formData: FormData) => Promise<void>
}) {
  return (
    <form action={changeRole}>
      <input type="hidden" name="id" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        className="bg-white/5 border border-white/10 text-xs px-2 py-1.5 rounded-lg text-white outline-none cursor-pointer"
        onChange={e => (e.target.form as HTMLFormElement).requestSubmit()}
      >
        <option value="buyer" style={{ backgroundColor: '#111118', color: '#F0EDE6' }}>مشترٍ</option>
        <option value="seller" style={{ backgroundColor: '#111118', color: '#F0EDE6' }}>بائع</option>
        <option value="admin" style={{ backgroundColor: '#111118', color: '#F0EDE6' }}>أدمن</option>
      </select>
    </form>
  )
}
