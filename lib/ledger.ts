import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/lib/env'

export async function addTokens(userId: string, delta: number, reason: string, stripePI?: string) {
  const supabase = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_KEY'))

  const { data: w } = await supabase.from('wallets').select('balance_tokens').eq('user_id', userId).single()
  const balance = w?.balance_tokens ?? 0
  const newBalance = balance + delta

  const { error: upsertErr } = await supabase.from('wallets').upsert({ user_id: userId, balance_tokens: newBalance })
  if (upsertErr) throw upsertErr

  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: userId,
    delta_tokens: delta,
    reason,
    stripe_payment_intent: stripePI ?? null,
  })
  if (txErr) throw txErr

  return newBalance
}

