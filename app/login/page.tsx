'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClientComponentClient()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (!error) setSent(true)
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl">Sign in</h1>
      {sent ? (
        <p className="mt-4 text-white/70">Check your email for a magic link.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 rounded bg-white/10 ring-1 ring-white/10"
            placeholder="you@example.com"
          />
          <button className="px-4 py-2 rounded bg-white text-black">Send link</button>
        </form>
      )}
    </section>
  )
}
