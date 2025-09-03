'use client'
import { useState } from 'react'

export default function QueuePage() {
  const [joining, setJoining] = useState(false)
  const [ok, setOk] = useState<{ cam?: boolean; mic?: boolean }>({})

  async function checkDevices() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setOk({ cam: true, mic: true })
    } catch {
      setOk({ cam: false, mic: false })
    }
  }

  async function joinQueue() {
    setJoining(true)
    const res = await fetch('/api/queue/join', { method: 'POST' })
    setJoining(false)
    if (res.ok) {
      fetch('/api/matchmaker', { method: 'POST' }).catch(() => {})
      alert('You are in the queue. We will connect you shortly.')
    } else {
      alert('Unable to join queue.')
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h2 className="font-serif text-3xl">Get ready</h2>
      <ul className="mt-6 space-y-2 text-white/70">
        <li>• Find a quiet, well‑lit place</li>
        <li>• Keep it respectful</li>
        <li>• Report or leave anytime</li>
      </ul>

      <div className="mt-8">
        <button onClick={checkDevices} className="px-4 py-2 border rounded-md">
          Check camera & mic
        </button>
        <div className="mt-3 text-sm">
          Camera: {ok.cam === undefined ? '—' : ok.cam ? 'OK' : 'Blocked'} ·
          Microphone: {ok.mic === undefined ? '—' : ok.mic ? 'OK' : 'Blocked'}
        </div>
      </div>

      <button
        onClick={joinQueue}
        disabled={joining}
        className="mt-8 w-full px-5 py-3 bg-white text-black rounded-md hover:opacity-90 disabled:opacity-60"
      >
        {joining ? 'Joining…' : 'Join the queue'}
      </button>
    </section>
  )
}

