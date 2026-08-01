'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAdminChat, useReplyToChat } from '@/hooks/queries/admin'
import { Avatar, AvatarFallback, Button, Skeleton } from '@doska/ui'
import { ArrowLeft, MessageCircle, ExternalLink } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { Composer, type ReplyTarget } from './Composer'
import {
    displayName,
    initials,
    supportId,
    type SupportChat,
} from './utils'

type Props = {
    chatId: number
    onBack: () => void
}

export function ConversationView({ chatId, onBack }: Props) {
    const { data: chat, isLoading } = useAdminChat(chatId)
    const reply = useReplyToChat(chatId)
    const scrollRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null)

    const messages = chat?.messages ?? []
    const sid = chat ? supportId(chat as SupportChat) : null
    const user = chat
        ? sid === chat.initiator_id
            ? chat.receiver
            : chat.initiator
        : null

    // Keep pinned to the newest message as the thread grows (send / incoming WS).
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' })
    }, [messages.length, chatId])

    // Drop any pending reply target when switching to another conversation.
    useEffect(() => {
        setReplyTo(null)
    }, [chatId])

    const handleSend = (content: string) => {
        reply.mutate({ content, parentId: replyTo?.id })
        setReplyTo(null)
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b p-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="shrink-0 lg:hidden"
                    aria-label="Назад"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                {isLoading ? (
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ) : (
                    <>
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="text-xs font-medium">
                                {initials(user)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                                {displayName(user)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                Обращение #{chatId}
                                {user?.phone ? ` · ${user.phone}` : ''}
                            </p>
                        </div>
                        {user?.id != null && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                            >
                                <Link
                                    href={`/admin/users/${user.id}`}
                                    title="Открыть профиль пользователя"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span className="hidden sm:inline">Профиль</span>
                                </Link>
                            </Button>
                        )}
                    </>
                )}
            </div>

            <div
                ref={scrollRef}
                className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-muted/30 p-4"
            >
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className={i % 2 ? 'flex justify-end' : 'flex justify-start'}
                            >
                                <Skeleton className="h-12 w-48 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <MessageCircle className="h-8 w-8 opacity-40" />
                        <p className="text-sm">В этом обращении пока нет сообщений</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg: any) => {
                            const outgoing = sid != null && msg.sender_id === sid
                            return (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    outgoing={outgoing}
                                    onReply={() =>
                                        setReplyTo({
                                            id: msg.id,
                                            content: msg.content ?? '',
                                            author: outgoing
                                                ? 'Техподдержку'
                                                : displayName(user),
                                        })
                                    }
                                />
                            )
                        })}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            <Composer
                onSend={handleSend}
                isPending={reply.isPending}
                isError={reply.isError}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
            />
        </div>
    )
}
