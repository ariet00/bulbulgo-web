'use client';

import { Link } from '@/i18n/routing'
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, ArrowLeft, Loader2, Check, CheckCheck } from 'lucide-react';


import { cn } from '@/lib/utils';
import { uploadFile } from '@/apis/upload';

interface ChatWindowProps {
    chatId: number;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
    const currentChat = useChatStore((state) => state.currentChat);
    const messages = useChatStore((state) => state.messages);
    const selectChat = useChatStore((state) => state.selectChat);
    const sendMessage = useChatStore((state) => state.sendMessage);
    const loadMoreMessages = useChatStore((state) => state.loadMoreMessages);
    const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
    const connectSocket = useChatStore((state) => state.connectSocket);
    const disconnectSocket = useChatStore((state) => state.disconnectSocket);
    const clearCurrentChat = useChatStore((state) => state.clearCurrentChat);
    const { user } = useUserStore();
    const [inputValue, setInputValue] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    useEffect(() => {
        selectChat(chatId);
        connectSocket();
        return () => {
            disconnectSocket();
            clearCurrentChat();
        };
    }, [chatId, selectChat, connectSocket, disconnectSocket]);


    // Handle infinite scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && !isLoadingMessages) {
            const oldHeight = e.currentTarget.scrollHeight;
            loadMoreMessages().then(() => {
                // Restore scroll position
                if (scrollRef.current) {
                    const newHeight = scrollRef.current.scrollHeight;
                    scrollRef.current.scrollTop = newHeight - oldHeight;
                }
            });
        }
    };

    // Scroll to bottom on new messages if explicitly requested or if was at bottom
    useEffect(() => {
        if (shouldScrollToBottom && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, shouldScrollToBottom]);

    // When sending a message, force scroll to bottom
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        await sendMessage(inputValue);
        setInputValue('');
        setShouldScrollToBottom(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadFile(formData);
            const url = res.url;
            await sendMessage('', [url]);
            setShouldScrollToBottom(true);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    if (!currentChat) return <div className="flex items-center justify-center h-full">Loading...</div>;

    const otherUser = currentChat.initiator_id === user?.id ? currentChat.receiver : currentChat.initiator;

    // Messages are stored newest first (index 0 is newest).
    // We want to display them oldest at top (index N) to newest at bottom (index 0).
    // So we reverse the array for rendering.
    const displayMessages = [...messages].reverse();

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b shrink-0">
                <Link href="/messages" className="md:hidden">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <Link href={otherUser?.id ? `/profile/${otherUser.id}` : '#'} className="hover:opacity-80 transition-opacity">
                        <Avatar>
                            <AvatarImage src={otherUser?.avatar || ''} />
                            <AvatarFallback>{otherUser?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <Link href={otherUser?.id ? `/profile/${otherUser.id}` : '#'} className="font-semibold hover:underline">
                            {otherUser?.username}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {isLoadingMessages && messages.length > 0 && (
                    <div className="flex justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}

                {Object.entries(displayMessages.reduce((groups, msg) => {
                    const date = new Date(msg.created_at).toLocaleDateString();
                    if (!groups[date]) {
                        groups[date] = [];
                    }
                    groups[date].push(msg);
                    return groups;
                }, {} as Record<string, typeof messages>)).map(([date, msgs]) => (
                    <div key={date} className="space-y-4">
                        <div className="flex justify-center sticky top-0 z-10">
                            <span className="bg-muted/50 text-muted-foreground text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                {date}
                            </span>
                        </div>
                        {msgs.map((msg) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[70%] rounded-lg p-3",
                                        isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                                    )}>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mb-2">
                                                {msg.attachments.map((url, idx) => (
                                                    <img key={idx} src={url} alt="attachment" className="rounded-md max-w-full h-auto" />
                                                ))}
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                        <div className={cn("text-xs mt-1 opacity-70 flex items-center justify-end gap-1", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && (
                                                msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                                            )}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2 items-end shrink-0">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploading}
                >
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={(!inputValue.trim() && !isUploading) || isUploading}>
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    );
}
