'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

import { useInView } from 'react-intersection-observer';
import { useInfiniteChats } from '@/hooks/queries/useChats';

export function ChatList() {
    const connectSocket = useChatStore((state) => state.connectSocket);
    const disconnectSocket = useChatStore((state) => state.disconnectSocket);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteChats();

    const { ref, inView } = useInView();
    const { user } = useUserStore();
    const params = useParams();
    const currentChatId = params?.id ? Number(params.id) : null;

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    useEffect(() => {
        connectSocket();
        return () => {
            console.log('disconnectSocket');
            disconnectSocket();
        };
    }, [connectSocket, disconnectSocket]);

    if (isLoading) {
        return (
            <div className="flex flex-col divide-y">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const allChats = data ? data.pages.flat() : [];

    if (allChats.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No messages yet.</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto divide-y">
            {allChats.map((chat) => {
                const otherUser = chat.buyer_id === user?.id ? chat.seller : chat.buyer;
                const isActive = currentChatId === chat.id;

                return (
                    <Link key={chat.id} href={`/messages/${chat.id}`} className={cn(
                        "block hover:bg-muted/50 transition-colors",
                        isActive && "bg-muted"
                    )}>
                        <div className="flex items-center gap-3 p-3 relative">
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={otherUser?.avatar || ''} />
                                <AvatarFallback>{otherUser?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="font-semibold truncate text-sm">{otherUser?.username}</span>
                                    {chat.last_message && (
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2 shrink-0">
                                            {new Date(chat.last_message.created_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate flex items-center">
                                    {chat.ad && <span className="font-medium text-primary mr-1 shrink-0">[{chat.ad.title}]</span>}
                                    <span className={cn(
                                        "truncate",
                                        chat.last_message && !chat.last_message.is_read && chat.last_message.sender_id !== user?.id
                                            ? "font-bold text-foreground"
                                            : ""
                                    )}>
                                        {chat.last_message?.content || 'No messages'}
                                    </span>
                                </div>
                            </div>
                            {chat.last_message && !chat.last_message.is_read && chat.last_message.sender_id !== user?.id && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600" />
                            )}
                        </div>
                    </Link>
                );
            })}
            {hasNextPage && (
                <div ref={ref} className="p-4">
                    {isFetchingNextPage ? (
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground">Load more</div>
                    )}
                </div>
            )}
        </div>
    );
}
