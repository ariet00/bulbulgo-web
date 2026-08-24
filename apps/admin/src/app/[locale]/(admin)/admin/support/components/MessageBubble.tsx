'use client'

import { cn } from '@doska/shared'
import { Reply } from 'lucide-react'
import { clockTime } from './utils'

type Attachment = { url: string; type?: string }

type Message = {
    id: number
    content?: string | null
    created_at: string
    attachments?: Attachment[] | null
    parent?: { content?: string | null } | null
}

/**
 * One message row. `outgoing` = sent from the «Техподдержка» side (admin) →
 * right-aligned accented bubble; incoming (user) → left-aligned muted bubble.
 */
export function MessageBubble({
    message,
    outgoing,
    onReply,
}: {
    message: Message
    outgoing: boolean
    onReply?: () => void
}) {
    const images = (message.attachments ?? []).filter(
        (a) => (a.type ?? 'image') === 'image' && a.url,
    )

    return (
        <div
            className={cn(
                'group flex w-full items-center gap-1.5',
                outgoing ? 'justify-end' : 'justify-start',
            )}
        >
            {onReply && outgoing && (
                <button
                    type="button"
                    onClick={onReply}
                    aria-label="Ответить на сообщение"
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                >
                    <Reply className="h-4 w-4" />
                </button>
            )}
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[70%]',
                    outgoing
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md border bg-background',
                )}
            >
                {message.parent?.content && (
                    <div
                        className={cn(
                            'mb-1.5 border-l-2 pl-2 text-xs opacity-70',
                            outgoing
                                ? 'border-primary-foreground/50'
                                : 'border-muted-foreground/40',
                        )}
                    >
                        <span className="line-clamp-2">{message.parent.content}</span>
                    </div>
                )}

                {images.length > 0 && (
                    <div className="mb-1.5 grid grid-cols-2 gap-1.5">
                        {images.map((a, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={i}
                                src={a.url}
                                alt=""
                                className="h-28 w-full rounded-lg object-cover"
                            />
                        ))}
                    </div>
                )}

                {message.content && (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                    </p>
                )}

                <div
                    className={cn(
                        'mt-1 text-right text-[10px]',
                        outgoing
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground',
                    )}
                >
                    {clockTime(message.created_at)}
                </div>
            </div>

            {onReply && !outgoing && (
                <button
                    type="button"
                    onClick={onReply}
                    aria-label="Ответить на сообщение"
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                >
                    <Reply className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}
