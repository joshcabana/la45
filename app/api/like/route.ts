import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'
import { requireEnv } from '@/lib/env'

const schema = z.object({
  call_id: z.string().uuid(),
  to_user: z.string().uuid(),
  choice: z.enum(['like', 'superlike', 'pass']),
})

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const supabase = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_KEY'))
  const { error } = await supabase.from('likes').insert({
    call_id: parsed.data.call_id,
    from_user: user.id,
    to_user: parsed.data.to_user,
    choice: parsed.data.choice,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Optional: check reciprocal like and create match
  return NextResponse.json({ ok: true })
}

