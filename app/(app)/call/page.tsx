'use client'
import { useEffect, useState } from 'react'

export default function CallPage() {
  const [counter, setCounter] = useState(45)
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const roomName = params.get('room') ?? ''

  useEffect(() => {
    let mounted = true
    let room: import('livekit-client').Room | undefined

    ;(async () => {
      try {
        const res = await fetch('/api/livekit/token', { method: 'POST', body: JSON.stringify({ room: roomName }) })
        const { token } = await res.json()

        const { Room, createLocalVideoTrack, createLocalAudioTrack } = await import('livekit-client')
        room = new Room()
        // NEXT_PUBLIC_LIVEKIT_WS_URL must be set
        await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL as string, token)

        const cam = await createLocalVideoTrack()
        const mic = await createLocalAudioTrack()
        await room.localParticipant.publishTrack(cam)
        await room.localParticipant.publishTrack(mic)

        const id = setInterval(() => {
          if (!mounted) return
          setCounter((c) => (c > 0 ? c - 1 : 0))
        }, 1000)

        const { RoomEvent } = await import('livekit-client')
        room.on(RoomEvent.Disconnected, () => clearInterval(id))
      } catch (e) {
        console.error(e)
      }
    })()

    return () => {
      mounted = false
      try {
        room?.disconnect?.()
      } catch {}
    }
  }, [roomName])

  useEffect(() => {
    if (counter === 0) window.location.href = '/after'
  }, [counter])

  return (
    <section className="h-[calc(100dvh-4rem)] grid place-items-center">
      <div className="text-center">
        <div className="text-7xl font-serif">{counter}</div>
        <p className="mt-4 text-white/70">Say hi. You’ve got 45 seconds.</p>
      </div>
    </section>
  )
}
