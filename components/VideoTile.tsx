'use client'
import { useEffect, useRef } from 'react'

type Props = { stream?: MediaStream; label?: string; mirrored?: boolean }

export default function VideoTile({ stream, label, mirrored }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.srcObject = stream ?? null
  }, [stream])

  return (
    <div className="relative rounded-lg overflow-hidden ring-1 ring-white/10 bg-white/5">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={label === 'You'}
        className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
      />
      {label ? (
        <div className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/60">{label}</div>
      ) : null}
    </div>
  )
}

