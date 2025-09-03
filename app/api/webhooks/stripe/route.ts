import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { addTokens } from '@/lib/ledger'
import { requireEnv } from '@/lib/env'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!
  const buf = Buffer.from(await req.arrayBuffer())
  const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'))
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, requireEnv('STRIPE_WEBHOOK_SECRET'))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id as string
    const intent = session.payment_intent as string
    const tokens = Number(session.metadata?.tokens ?? 0)
    if (userId && tokens > 0) {
      await addTokens(userId, tokens, 'topup', intent)
    }
  }

  return NextResponse.json({ received: true })
}
