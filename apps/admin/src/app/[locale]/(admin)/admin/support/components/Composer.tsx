'use client'

import { useState } from 'react'
import { Button, Textarea } from '@doska/ui'
import { Send, Headset, Reply, X } from 'lucide-react'

export type ReplyTarget = {
    id: number
    content: string
    author: string
}

/**
 * Reply composer for a support thread. Sends from the «Техподдержка» account
 * (handled server-side). Ctrl/⌘ + Enter sends. When `replyTo` is set the message
 * quotes it (rendered as a reply preview above the input).
 */
export function Composer({
    onSend,
    isPending,
    isError,
    replyTo,
    onCancelReply,
}: {
    onSend: (content: string) => void
    isPending: boolean
    isError: boolean
    replyTo?: ReplyTarget | null
    onCancelReply?: () => void
}) {
    const [draft, setDraft] = useState('')

    const handleSend = () => {
        const content = draft.trim()
        if (!content || isPending) return
        onSend(content)
        setDraft('')
    }

    return (
        <div className="border-t bg-background p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Headset className="h-3.5 w-3.5" />
                Ответ отправится от имени «Техподдержки»
            </div>

            {replyTo && (
                <div className="mb-2 flex items-start gap-2 rounded-lg border-l-2 border-primary bg-muted/50 py-1.5 pl-2 pr-1.5">
                    <Reply className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-primary">
                            В ответ на {replyTo.author}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {replyTo.content || 'Вложение'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        aria-label="Отменить ответ"
                        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
            <div className="flex items-end gap-2">
                <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                    placeholder="Написать ответ…  (Ctrl/⌘ + Enter)"
                    rows={2}
                    className="max-h-40 flex-1 resize-none"
                />
                <Button
                    onClick={handleSend}
                    disabled={!draft.trim() || isPending}
                    className="shrink-0"
                >
                    <Send className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">
                        {isPending ? 'Отправка…' : 'Отправить'}
                    </span>
                </Button>
            </div>
            {isError && (
                <p className="mt-1.5 text-xs text-destructive">
                    Не удалось отправить сообщение
                </p>
            )}
        </div>
    )
}
