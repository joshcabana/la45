'use client'
import { useEffect, useState } from 'react'
import VideoGrid from '@/components/VideoGrid'

export const dynamic = 'force-dynamic'

export default function CallPage() {
  const [roomName, setRoomName] = useState<string>('')
  const [partnerId, setPartnerId] = useState<string>('')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      setRoomName(p.get('room') ?? '')
      setPartnerId(p.get('to') ?? '')
    }
  }, [])
  const [counter, setCounter] = useState(45)

  useEffect(() => {
    const id = setInterval(() => setCounter((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (counter === 0) {
      const url = `/after?to=${encodeURIComponent(partnerId)}`
      window.location.replace(url)
    }
  }, [counter, partnerId])

  return (
    <section className="h-[calc(100dvh-4rem)] p-3 md:p-6">
      <div className="h-full rounded-xl ring-1 ring-white/10 p-3 md:p-4 bg-white/5 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="font-serif text-xl">LA45</div>
          <div className="text-3xl font-serif tabular-nums">{counter}</div>
          <div aria-hidden className="w-10" />
        </div>
        <div className="mt-3 flex-1">
          <VideoGrid roomName={roomName} />
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/10">Mute</button>
          <button className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/10">Hide Camera</button>
          <a href="/after" className="px-4 py-2 rounded-md bg-white text-black hover:opacity-90">End early</a>
        </div>
      </div>
    </section>
  )
}
