'use client'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

type Pack = { label: string; tokens: number; priceId: string | null }

const packs: Pack[] = [
  { label: 'Small', tokens: 100, priceId: process.env.NEXT_PUBLIC_PRICE_SMALL ?? null },
  { label: 'Standard', tokens: 300, priceId: process.env.NEXT_PUBLIC_PRICE_STANDARD ?? null },
  { label: 'Popular', tokens: 800, priceId: process.env.NEXT_PUBLIC_PRICE_POPULAR ?? null },
  { label: 'Best', tokens: 2000, priceId: process.env.NEXT_PUBLIC_PRICE_BEST ?? null },
]

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/wallet/balance')
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance_tokens ?? 0)
      }
    })()
  }, [])

  async function buy(p: Pack) {
    if (!p.priceId) return alert('Price not configured.')
    const res = await fetch('/api/wallet/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ priceId: p.priceId, tokens: p.tokens }),
    })
    if (!res.ok) return alert('Checkout failed')
    const data = await res.json()
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    if (!stripe) return
    const { error } = await stripe.redirectToCheckout({ sessionId: data.id })
    if (error) alert(error.message)
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl">Wallet</h1>
      <p className="mt-2 text-white/70">
        Balance: <span className="text-gold">{balance}</span> tokens
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {packs.map((p) => (
          <div key={p.label} className="p-4 rounded-lg ring-1 ring-white/10 bg-white/5">
            <div className="font-serif text-xl">{p.label}</div>
            <div className="mt-2 text-white/70">{p.tokens} tokens</div>
            <button
              onClick={() => buy(p)}
              className="mt-4 w-full px-4 py-2 rounded-md bg-white text-black hover:opacity-90"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

