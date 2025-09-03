// Minimal server-side user accessor. Replace with real Supabase auth helpers.
import { cookies } from 'next/headers'

type User = { id: string; email?: string | null }

export async function getUser(): Promise<User | null> {
  // TODO: wire up @supabase/auth-helpers-nextjs or your own session logic.
  // For now, check for a mock cookie 'la45_user'
  try {
    const c = await cookies()
    const id = c.get('la45_user')?.value
    if (!id) return null
    return { id }
  } catch {
    return null
  }
}

