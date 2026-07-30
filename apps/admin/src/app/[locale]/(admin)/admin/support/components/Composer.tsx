'use client'

import { useState } from 'react'
import { Button, Textarea } from '@doska/ui'
import { Send, Headset } from 'lucide-react'

/**
 * Reply composer for a support thread. Sends from the «Техподдержка» account
 * (handled server-side). Ctrl/⌘ + Enter sends.
 */
export function Composer({
    onSend,
    isPending,
    isError,
}: {
    onSend: (content: string) => void
    isPending: boolean
    isError: boolean
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
