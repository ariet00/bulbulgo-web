'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAdminSupportChats } from '@/hooks/queries/admin'
import { useSupportSocket } from '@/hooks/useSupportSocket'
import { cn } from '@doska/shared'
import { Headset, MessagesSquare } from 'lucide-react'
import { ConversationList } from './ConversationList'
import { ConversationView } from './ConversationView'
import { displayName, otherParty, type SupportChat } from './utils'

export function SupportInbox() {
    // Deep-link from outside the inbox (e.g. «Написать в поддержку» на
    // странице пользователя passes ?chat=<id>) — ConversationView loads the
    // chat by id on its own, so this works even for a chat with zero
    // messages yet (not in the inbox list, which requires messages.any()).
    const searchParams = useSearchParams()
    const chatParam = searchParams.get('chat')
    const [selectedId, setSelectedId] = useState<number | null>(
        chatParam ? Number(chatParam) || null : null,
    )
    const [query, setQuery] = useState('')

    // Load the inbox (support endpoint returns newest-activity first, with a
    // last_message preview per row). One page is plenty for a support queue.
    const { data, isLoading } = useAdminSupportChats(1, 60)

    // Subscribe to the realtime feed. Passing the open chat lets the backend
    // mark it read + track presence.
    useSupportSocket(selectedId)

    const chats: SupportChat[] = (data?.items ?? []) as SupportChat[]

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return chats
        return chats.filter((c) =>
            displayName(otherParty(c)).toLowerCase().includes(q),
        )
    }, [chats, query])

    const hasSelection = selectedId != null

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
            <div className="flex items-center gap-2">
                <Headset className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Поддержка</h1>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Реалтайм
                </span>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border bg-background shadow-sm">
                {/* Inbox list — full width on mobile until a chat is opened. */}
                <div
                    className={cn(
                        'w-full shrink-0 border-r lg:block lg:w-[340px] xl:w-[380px]',
                        hasSelection && 'hidden lg:block',
                    )}
                >
                    <ConversationList
                        chats={filtered}
                        isLoading={isLoading}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        query={query}
                        onQueryChange={setQuery}
                    />
                </div>

                {/* Conversation — full width on mobile when open. */}
                <div
                    className={cn(
                        'min-w-0 flex-1',
                        hasSelection ? 'block' : 'hidden lg:block',
                    )}
                >
                    {hasSelection ? (
                        <ConversationView
                            chatId={selectedId}
                            onBack={() => setSelectedId(null)}
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
                            <MessagesSquare className="h-12 w-12 opacity-30" />
                            <p className="text-sm">
                                Выберите обращение слева, чтобы открыть переписку
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
