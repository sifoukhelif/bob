// lib/supabase/current-user.ts
import { createServerClient } from '@/lib/supabase/server'

export async function getCurrentUserWithProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, username: null as string | null, supabase }

  const { data: profile } = await supabase
    .from('users').select('username').eq('id', user.id).maybeSingle()

  return { user, username: profile?.username ?? null, supabase }
}
