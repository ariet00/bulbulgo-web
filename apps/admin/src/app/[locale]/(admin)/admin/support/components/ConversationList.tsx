'use client'

import { Avatar, AvatarFallback, Input, Skeleton } from '@doska/ui'
import { cn } from '@doska/shared'
import { Search, Inbox } from 'lucide-react'
import {
    displayName,
    initials,
    isUnread,
    otherParty,
    relativeTime,
    type SupportChat,
} from './utils'

type Props = {
    chats: SupportChat[]
    isLoading: boolean
    selectedId: number | null
    onSelect: (id: number) => void
    query: string
    onQueryChange: (q: string) => void
}

export function ConversationList({
    chats,
    isLoading,
    selectedId,
    onSelect,
    query,
    onQueryChange,
}: Props) {
    return (
        <div className="flex h-full flex-col">
            <div className="border-b p-3">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Поиск по имени…"
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="space-y-1 p-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : chats.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
                        <Inbox className="h-8 w-8 opacity-40" />
                        <p className="text-sm">Обращений не найдено</p>
                    </div>
                ) : (
                    <ul className="divide-y">
                        {chats.map((chat) => {
                            const user = otherParty(chat)
                            const active = chat.id === selectedId
                            const unread = isUnread(chat)
                            return (
                                <li key={chat.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(chat.id)}
                                        className={cn(
                                            'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors',
                                            'hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none',
                                            active && 'bg-muted',
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="text-xs font-medium">
                                                    {initials(user)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {unread && (
                                                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <span
                                                    className={cn(
                                                        'truncate text-sm',
                                                        unread
                                                            ? 'font-semibold'
                                                            : 'font-medium',
                                                    )}
                                                >
                                                    {displayName(user)}
                                                </span>
                                                <span className="shrink-0 text-[11px] text-muted-foreground">
                                                    {relativeTime(chat.last_message_at)}
                                                </span>
                                            </div>
                                            <p
                                                className={cn(
                                                    'truncate text-xs',
                                                    unread
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {chat.last_message?.content || '—'}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}
