import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { routeHandlerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/auth'

const schema = z.object({
  to: z.string().min(1),
  choice: z.enum(['like', 'superlike', 'pass']),
})

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const supabase = routeHandlerClient()

  const { error: likeErr } = await supabase.from('likes').insert({
    from_user: user.id,
    to_user: parsed.data.to,
    choice: parsed.data.choice,
  })
  if (likeErr) return NextResponse.json({ error: 'Failed to save' }, { status: 500 })

  const { data: reciprocal, error: recErr } = await supabase
    .from('likes')
    .select('id, choice')
    .eq('from_user', parsed.data.to)
    .eq('to_user', user.id)
    .in('choice', ['like', 'superlike'])
    .maybeSingle()

  if (recErr) return NextResponse.json({ matched: false }, { status: 200 })

  if (reciprocal) {
    const [a, b] = [user.id, parsed.data.to].sort()
    const { data: m, error: mErr } = await supabase
      .from('matches')
      .insert({ user_a: a, user_b: b })
      .select('id')
      .single()
    if (mErr && !String(mErr.message || '').includes('duplicate')) {
      return NextResponse.json({ error: 'Match create failed' }, { status: 500 })
    }
    let matchId = m?.id as string | undefined
    if (!matchId) {
      const { data: existing } = await supabase
        .from('matches')
        .select('id')
        .eq('user_a', a)
        .eq('user_b', b)
        .single()
      matchId = existing?.id
    }
    return NextResponse.json({ matched: true, match_id: matchId }, { status: 200 })
  }

  return NextResponse.json({ matched: false }, { status: 200 })
}
