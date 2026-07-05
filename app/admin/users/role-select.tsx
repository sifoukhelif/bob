'use client'

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
        <option value="buyer">مشترٍ</option>
        <option value="seller">بائع</option>
        <option value="admin">أدمن</option>
      </select>
    </form>
  )
}
