'use client'

import { useAdminChat } from '@/hooks/queries/admin'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from '@/components/ui/back-button'
import { User, MessageCircle, Info } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export default function ChatDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const { data: chat, isLoading } = useAdminChat(id)

    if (isLoading) return <div>Loading...</div>
    if (!chat) return <div>Chat not found</div>

    const initiator = chat.initiator
    const receiver = chat.receiver

    return (
        <div className="space-y-6">
            <BackButton />
            
            <div className="flex justify-between items-center">
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
                <CardHeader className="border-b">
                    <CardTitle className="text-lg">Conversation History</CardTitle>
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
            </Card>
        </div>
    )
}
