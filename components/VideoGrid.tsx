'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import VideoTile from './VideoTile'

type Participant = {
  id: string
  cam?: MediaStreamTrack
  mic?: MediaStreamTrack
}

type RoomExports = typeof import('livekit-client')

export default function VideoGrid({ roomName }: { roomName: string }) {
  const [roomExports, setRoomExports] = useState<RoomExports | null>(null)
  const [participants, setParticipants] = useState<Record<string, Participant>>({})
  const [connected, setConnected] = useState(false)

  const localVideo = useRef<MediaStream | null>(null)
  const remoteStreams = useRef<Record<string, MediaStream>>({})

  useEffect(() => {
    ;(async () => {
      const mod = await import('livekit-client')
      setRoomExports(mod)
    })()
  }, [])

  useEffect(() => {
    if (!roomExports) return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let mounted = true
    const { Room, RoomEvent, createLocalVideoTrack, createLocalAudioTrack } = roomExports
    const room = new Room()

    ;(async () => {
      try {
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ room: roomName }),
        })
        if (!res.ok) return
        const { token } = await res.json()

        await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL as string, token)

        const cam = await createLocalVideoTrack()
        const mic = await createLocalAudioTrack()
        await room.localParticipant.publishTrack(cam)
        await room.localParticipant.publishTrack(mic)

        const ms = new MediaStream()
        ms.addTrack(cam.mediaStreamTrack)
        localVideo.current = ms

        setConnected(true)

        const upsert = (pid: string, fn: (p: Participant) => Participant) => {
          setParticipants((prev) => {
            const curr = prev[pid] ?? { id: pid }
            return { ...prev, [pid]: fn(curr) }
          })
        }

        room.on(RoomEvent.TrackSubscribed, (_track, publication, p) => {
          const track = publication.track
          if (!track) return
          if (track.kind === 'video') {
            const mst = (track as unknown as { mediaStreamTrack: MediaStreamTrack }).mediaStreamTrack
            upsert(p.identity, (prev) => ({ ...prev, cam: mst }))
          } else if (track.kind === 'audio') {
            const mst = (track as unknown as { mediaStreamTrack: MediaStreamTrack }).mediaStreamTrack
            upsert(p.identity, (prev) => ({ ...prev, mic: mst }))
          }
        })

        room.on(RoomEvent.TrackUnsubscribed, (_track, publication, p) => {
          if (publication.kind === 'video') {
            upsert(p.identity, (prev) => ({ ...prev, cam: undefined }))
          } else if (publication.kind === 'audio') {
            upsert(p.identity, (prev) => ({ ...prev, mic: undefined }))
          }
        })

        room.on(RoomEvent.ParticipantDisconnected, (p) => {
          setParticipants((prev) => {
            const copy = { ...prev }
            delete copy[p.identity]
            return copy
          })
        })
      } catch (e) {
        console.error(e)
      }
    })()

    return () => {
      mounted = false
      try {
        room.disconnect()
      } catch {}
    }
  }, [roomExports, roomName])

  const tiles = useMemo(() => {
    const others = Object.values(participants).map((p) => {
      const key = p.id
      if (!remoteStreams.current[key]) remoteStreams.current[key] = new MediaStream()
      const stream = remoteStreams.current[key]
      stream.getTracks().forEach((t) => stream.removeTrack(t))
      if (p.cam) stream.addTrack(p.cam)
      if (p.mic) stream.addTrack(p.mic)
      return <VideoTile key={key} stream={stream} label="Partner" />
    })
    const me = <VideoTile key="me" stream={localVideo.current ?? undefined} label="You" mirrored />
    return [me, ...others]
  }, [participants])

  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">{connected ? tiles : <div className="grid place-items-center text-white/70">Connecting…</div>}</div>
}
