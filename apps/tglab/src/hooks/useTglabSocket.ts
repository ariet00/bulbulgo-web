'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { tglabKeys } from '@/hooks/queries/keys'
import { eventToLog, useLiveStore } from '@/store/useLiveStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { LiveEvent } from '@/types'

/** Backoff between reconnects — the socket is a convenience, REST still works. */
const RECONNECT_MS = [1000, 2000, 5000, 10000, 30000]

function socketUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api/v1'
  const ws = base.replace(/^http/, 'ws')
  return `${ws}/tglab/ws?token=${encodeURIComponent(token)}`
}

/**
 * Keeps one socket open for the whole cabinet.
 *
 * Everything on it is an increment: task status and counters, log lines,
 * account and collection state. Lists themselves stay on REST + React Query —
 * the socket just tells them when they went stale.
 */
export function useTglabSocket() {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()
  const setConnected = useLiveStore((s) => s.setConnected)
  const appendLog = useLiveStore((s) => s.appendLog)
  const attempt = useRef(0)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!token) return
    let closed = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const handle = (event: LiveEvent) => {
      switch (event.type) {
        case 'task.log':
          appendLog(event.data.task_id, eventToLog(event))
          break
        case 'task.status':
        case 'task.progress':
          queryClient.invalidateQueries({ queryKey: tglabKeys.tasks })
          break
        case 'account.status':
          queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
          break
        case 'audience.progress':
          queryClient.invalidateQueries({ queryKey: tglabKeys.audiences })
          break
      }
    }

    const connect = () => {
      if (closed) return
      const socket = new WebSocket(socketUrl(token))
      socketRef.current = socket

      socket.onopen = () => {
        attempt.current = 0
        setConnected(true)
      }
      socket.onmessage = (message) => {
        try {
          handle(JSON.parse(message.data))
        } catch {
          /* a malformed frame must not kill the socket */
        }
      }
      socket.onclose = () => {
        setConnected(false)
        if (closed) return
        const delay = RECONNECT_MS[Math.min(attempt.current, RECONNECT_MS.length - 1)]
        attempt.current += 1
        timer = setTimeout(connect, delay)
      }
      socket.onerror = () => socket.close()
    }

    connect()
    return () => {
      closed = true
      if (timer) clearTimeout(timer)
      socketRef.current?.close()
      setConnected(false)
    }
  }, [token, queryClient, setConnected, appendLog])
}
