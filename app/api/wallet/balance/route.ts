import { NextResponse } from 'next/server'
import { routeHandlerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/auth'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = routeHandlerClient()
  const { data: w } = await supabase.from('wallets').select('balance_tokens').eq('user_id', user.id).maybeSingle()
  return NextResponse.json({ balance_tokens: w?.balance_tokens ?? 0 })
}

