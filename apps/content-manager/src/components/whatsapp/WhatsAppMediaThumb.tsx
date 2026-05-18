'use client'

import React, { useEffect, useState } from 'react'

import { fetchWhatsAppMediaBlob } from '@doska/shared'
import { Loader2 } from 'lucide-react'

interface Props {
  accountId: number
  mediaId: string
  msgType: string
}

export function WhatsAppMediaThumb({ accountId, mediaId, msgType }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [type, setType] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let blobUrl: string | null = null
    fetchWhatsAppMediaBlob(accountId, mediaId)
      .then((blob) => {
        if (cancelled) return
        blobUrl = URL.createObjectURL(blob)
        setUrl(blobUrl)
        setType(blob.type)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'failed to load')
      })
    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [accountId, mediaId])

  if (error) {
    return (
      <span className="italic text-xs opacity-60">
        [{msgType}] — не удалось загрузить
      </span>
    )
  }
  if (!url) {
    return (
      <div className="flex items-center gap-2 text-xs opacity-60">
        <Loader2 className="h-3 w-3 animate-spin" /> {msgType}…
      </div>
    )
  }

  if (msgType === 'image' || type.startsWith('image/')) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt=""
        className="rounded max-h-60 max-w-full object-contain"
      />
    )
  }
  if (msgType === 'video' || type.startsWith('video/')) {
    return <video src={url} controls className="rounded max-h-60 max-w-full" />
  }
  if (msgType === 'audio' || type.startsWith('audio/')) {
    return <audio src={url} controls className="w-full" />
  }
  return (
    <a href={url} download className="text-xs underline opacity-80">
      [{msgType}] открыть
    </a>
  )
}
