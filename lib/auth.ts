import { routeHandlerClient } from './supabaseServer'

export async function getUser() {
  const supabase = routeHandlerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user || null
}
