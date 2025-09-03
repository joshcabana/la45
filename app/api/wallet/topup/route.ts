import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { requireEnv } from '@/lib/env'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId, tokens } = await req.json().catch(() => ({}))
  if (!priceId || !tokens) return NextResponse.json({ error: 'Missing priceId/tokens' }, { status: 400 })

  const StripeLib = (await import('stripe')).default
  const stripe = new StripeLib(requireEnv('STRIPE_SECRET_KEY'))
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/wallet?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/wallet?status=cancel`,
    client_reference_id: user.id,
    metadata: { tokens: String(tokens) },
  })

  return NextResponse.json({ id: session.id, url: session.url })
}
