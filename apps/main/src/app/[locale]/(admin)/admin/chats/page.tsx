'use client'

import { useState } from 'react'
import { useAdminChats } from '@doska/shared'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@doska/ui"
import { Button } from "@doska/ui"
import { Eye, MessageCircle } from 'lucide-react'
import { Link } from '@doska/i18n'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"
import { format } from 'date-fns'

export default function AdminChatsPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const { data: chats, isLoading } = useAdminChats(page, size)

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Chats</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Chat List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Initiator</TableHead>
                                    <TableHead>Receiver</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chats?.items.map((chat: any) => (
                                    <TableRow key={chat.id}>
                                        <TableCell>{chat.id}</TableCell>
                                        <TableCell>{chat.initiator?.username || `User ${chat.initiator_id}`}</TableCell>
                                        <TableCell>{chat.receiver?.username || `User ${chat.receiver_id}`}</TableCell>
                                        <TableCell className="capitalize">{chat.category || 'General'}</TableCell>
                                        <TableCell>
                                            {chat.updated_at ? format(new Date(chat.updated_at), 'dd.MM.yyyy HH:mm') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/admin/chats/${chat.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {chats && (
                        <Pagination
                            page={chats.page}
                            total={chats.total}
                            size={chats.size}
                            onPageChange={setPage}
                            onSizeChange={setSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
