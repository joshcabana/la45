import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { requireEnv } from '@/lib/env'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { priceId, tokens } = await req.json()
  if (!priceId) return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })

  const StripeLib = (await import('stripe')).default
  const stripe = new StripeLib(requireEnv('STRIPE_SECRET_KEY'))
  const origin = new URL(req.url).origin
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: user.id,
    metadata: { tokens: String(tokens ?? 0) },
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/wallet`,
    cancel_url: `${origin}/wallet`,
  })
  return NextResponse.json({ id: session.id })
}

