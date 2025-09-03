'use client'
import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

export default function AfterPage() {
  const [toUser, setToUser] = useState<string>('partner')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      setToUser(p.get('to') ?? 'partner')
    }
  }, [])

  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<string>('')

  async function choose(choice: 'like' | 'superlike' | 'pass') {
    setBusy(choice)
    const res = await fetch('/api/like', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to: toUser, choice }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(null)
    if (!res.ok) return setMsg(data.error || 'Something went wrong.')
    if (data.matched) {
      window.location.href = `/match/${data.match_id}`
    } else {
      setMsg('Choice saved. We’ll let you know if it’s mutual.')
      setTimeout(() => (window.location.href = '/queue'), 1200)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-serif text-3xl">How did it feel?</h1>
      <p className="mt-2 text-white/70">
        Your intro with <span className="text-gold">{toUser}</span>.
      </p>
      <div className="mt-8 grid gap-3">
        <button
          onClick={() => choose('like')}
          disabled={busy !== null}
          className="px-5 py-3 rounded-md bg-white text-black hover:opacity-90 disabled:opacity-60"
        >
          Like
        </button>
        <button
          onClick={() => choose('superlike')}
          disabled={busy !== null}
          className="px-5 py-3 rounded-md border border-gold text-gold hover:bg-gold hover:text-black disabled:opacity-60"
        >
          Superlike (3 tokens)
        </button>
        <button
          onClick={() => choose('pass')}
          disabled={busy !== null}
          className="px-5 py-3 rounded-md border border-white/20 hover:bg-white/10 disabled:opacity-60"
        >
          Pass
        </button>
      </div>
      <p className="mt-6 text-sm text-white/70">{msg}</p>
      <div className="mt-10">
        <a className="text-white/70 underline" href="/queue">
          Back to queue
        </a>
      </div>
    </section>
  )
}
