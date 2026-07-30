'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '@doska/shared'
import { adminKeys } from '@/hooks/queries/admin/keys'

/**
 * Realtime feed for the support inbox.
 *
 * Connects to the admin WS endpoint (`/admin/chats/ws`). The backend registers
 * the socket under the «Техподдержка» account, so every support message —
 * user→support and the echo of support→user replies — arrives here. On each
 * `new_message` we:
 *   - append it to the open thread cache (`adminKeys.chat`), deduped by id, so
 *     it shows instantly without a refetch flicker while the admin is typing;
 *   - invalidate the inbox list so previews/ordering/new chats refresh (cheap,
 *     low-volume surface).
 *
 * `activeChatId` is passed to the socket so the backend marks the user's
 * messages read and tracks presence; changing it reconnects (low frequency).
 */
export function useSupportSocket(activeChatId: number | null) {
    const token = useUserStore((s) => s.token)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!token) return
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) return

        let ws: WebSocket | null = null
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null
        let attempt = 0
        let disposed = false

        const connect = () => {
            if (disposed) return
            const base = apiUrl.replace(/^http/, 'ws')
            const params = new URLSearchParams({ token })
            if (activeChatId) params.set('chat_id', String(activeChatId))
            ws = new WebSocket(`${base}/admin/chats/ws?${params.toString()}`)

            ws.onopen = () => {
                attempt = 0
            }

            ws.onmessage = (event) => {
                let data: any
                try {
                    data = JSON.parse(event.data)
                } catch {
                    return
                }
                if (data?.type !== 'new_message' || !data.message) return
                const msg = data.message

                // Append to the open thread (dedup by id).
                queryClient.setQueryData(
                    adminKeys.chat(msg.chat_id),
                    (prev: any) => {
                        if (!prev) return prev
                        const messages = prev.messages ?? []
                        if (messages.some((m: any) => m.id === msg.id)) return prev
                        return {
                            ...prev,
                            messages: [...messages, msg],
                            last_message: msg,
                            last_message_at: msg.created_at,
                        }
                    },
                )

                // Refresh the inbox list (previews, ordering, brand-new chats).
                queryClient.invalidateQueries({
                    queryKey: adminKeys.supportChats(),
                })
            }

            ws.onclose = () => {
                if (disposed) return
                attempt += 1
                const delay = Math.min(1000 * 2 ** attempt, 15000)
                reconnectTimer = setTimeout(connect, delay)
            }

            ws.onerror = () => {
                ws?.close()
            }
        }

        connect()

        return () => {
            disposed = true
            if (reconnectTimer) clearTimeout(reconnectTimer)
            ws?.close()
        }
    }, [token, activeChatId, queryClient])
}
