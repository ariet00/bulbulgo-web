'use client'

import { useAdminChat, useReplyToChat } from '@/hooks/queries/admin'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@doska/shared'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"
import { BackButton, Button, Textarea } from '@doska/ui'
import { User, MessageCircle, Info, Send, Headset } from 'lucide-react'
import { Badge } from "@doska/ui"

// Username of the global «Техподдержка» account (see backend
// settings.SUPPORT_USER_USERNAME). A chat is a support chat when this account
// is one of the participants — that's the only kind the admin can answer.
const SUPPORT_USERNAME = 'support'

export default function ChatDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const { data: chat, isLoading } = useAdminChat(id)
    const reply = useReplyToChat(id)
    const [draft, setDraft] = useState('')

    if (isLoading) return <div>Loading...</div>
    if (!chat) return <div>Chat not found</div>

    const initiator = chat.initiator
    const receiver = chat.receiver
    const isSupportChat =
        initiator?.username === SUPPORT_USERNAME ||
        receiver?.username === SUPPORT_USERNAME

    const handleSend = () => {
        const content = draft.trim()
        if (!content || reply.isPending) return
        reply.mutate(content, { onSuccess: () => setDraft('') })
    }

    return (
        <div className="space-y-6">
            <BackButton />
            
            <div className="flex flex-wrap justify-between items-center gap-2">
                <h1 className="text-2xl font-bold flex items-center">
                    <MessageCircle className="mr-2 h-6 w-6" />
                    Chat Details #{chat.id}
                </h1>
                {chat.category && (
                    <Badge variant="outline" className="capitalize">
                        Category: {chat.category}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Participants
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Initiator</label>
                            <div className="mt-1">
                                <p className="font-medium text-blue-600">{initiator?.username || `User ${chat.initiator_id}`}</p>
                                <p className="text-sm text-gray-500 italic">{initiator?.email}</p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Receiver</label>
                            <div className="mt-1">
                                <p className="font-medium text-green-600">{receiver?.username || `User ${chat.receiver_id}`}</p>
                                <p className="text-sm text-gray-500 italic">{receiver?.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Info className="mr-2 h-5 w-5" />
                            Context Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chat.trip ? (
                            <div className="space-y-2">
                                <p><strong>Related Trip ID:</strong> {chat.trip.id}</p>
                                <p><strong>Route:</strong> {chat.trip.from_location?.name} → {chat.trip.to_location?.name}</p>
                                <p><strong>Type:</strong> {chat.trip.trip_type}</p>
                            </div>
                        ) : chat.company ? (
                            <div className="space-y-2">
                                <p><strong>Related Company:</strong> {chat.company.name}</p>
                                <p><strong>Slug:</strong> {chat.company.slug}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No direct entity context provided</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="flex flex-col min-h-[500px]">
                <CardHeader className="border-b flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">Conversation History</CardTitle>
                    {isSupportChat && (
                        <Badge className="flex items-center gap-1">
                            <Headset className="h-3.5 w-3.5" />
                            Поддержка
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="p-6 flex-1 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                    {chat.messages && chat.messages.length > 0 ? (
                        chat.messages.map((msg: any) => {
                            const isInitiator = msg.sender_id === chat.initiator_id
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "max-w-[75%] p-3 px-4 rounded-2xl shadow-sm",
                                        isInitiator
                                            ? "bg-white dark:bg-slate-800 self-start border border-slate-200 dark:border-slate-700"
                                            : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 self-end ml-auto"
                                    )}
                                >
                                    <div className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50",
                                        !isInitiator && "text-slate-600 dark:text-slate-400"
                                    )}>
                                        {isInitiator ? initiator?.username : receiver?.username}
                                    </div>
                                    <div className="text-sm leading-relaxed">{msg.content}</div>
                                    <div className={cn(
                                        "text-[9px] mt-2 text-right opacity-40",
                                        !isInitiator && "text-slate-500"
                                    )}>
                                        {new Date(msg.created_at).toLocaleString()}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 italic">
                            No messages in this conversation yet
                        </div>
                    )}
                </CardContent>
                {isSupportChat && (
                    <div className="border-t p-4 space-y-2">
                        <p className="text-xs text-gray-500">
                            Ответ отправится от имени «Техподдержки»
                        </p>
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
                                className="flex-1 resize-none"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!draft.trim() || reply.isPending}
                            >
                                <Send className="h-4 w-4 mr-1" />
                                {reply.isPending ? 'Отправка…' : 'Отправить'}
                            </Button>
                        </div>
                        {reply.isError && (
                            <p className="text-xs text-red-500">
                                Не удалось отправить сообщение
                            </p>
                        )}
                    </div>
                )}
            </Card>
        </div>
    )
}
