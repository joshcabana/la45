import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/lib/env'

export const runtime = 'edge'

export async function POST() {
  const supabase = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_KEY'))

  const { data: waiting, error } = await supabase
    .from('queue')
    .select('user_id, enqueued_at')
    .eq('status', 'waiting')
    .order('enqueued_at', { ascending: true })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!waiting || waiting.length < 2) return NextResponse.json({ paired: 0 })

  let paired = 0
  const used = new Set<string>()

  for (let i = 0; i < waiting.length; i++) {
    const a = waiting[i]
    if (used.has(a.user_id)) continue

    const b = waiting.find((w) => w.user_id !== a.user_id && !used.has(w.user_id))
    if (!b) continue

    const room = `la45_${crypto.randomUUID().slice(0, 8)}`
    const { data: call, error: callErr } = await supabase
      .from('calls')
      .insert({ room_name: room })
      .select('id')
      .single()

    if (callErr || !call) continue

    await supabase.from('call_participants').insert([
      { call_id: call.id, user_id: a.user_id },
      { call_id: call.id, user_id: b.user_id },
    ])

    await supabase.from('queue').update({ status: 'matched' }).in('user_id', [a.user_id, b.user_id])

    used.add(a.user_id)
    used.add(b.user_id)
    paired++
  }

  return NextResponse.json({ paired })
}

