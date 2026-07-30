'use client'

import { useAdminSupportChats } from '@/hooks/queries/admin'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Pagination,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@doska/ui'
import { Eye, Headset } from 'lucide-react'
import { Link } from '@doska/i18n'
import { format } from 'date-fns'

const SUPPORT_USERNAME = 'support'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
}

// The user side of a support chat is whichever participant is not the support
// account.
function otherParty(chat: any) {
    const initiatorIsSupport = chat.initiator?.username === SUPPORT_USERNAME
    return initiatorIsSupport ? chat.receiver : chat.initiator
}

export default function AdminSupportPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const { data: chats, isLoading } = useAdminSupportChats(
        values.page,
        values.size,
    )

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold flex items-center">
                <Headset className="mr-2 h-6 w-6" />
                Поддержка
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Обращения в поддержку</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : chats && chats.items.length > 0 ? (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Чат</TableHead>
                                        <TableHead>Пользователь</TableHead>
                                        <TableHead>Последнее сообщение</TableHead>
                                        <TableHead>Активность</TableHead>
                                        <TableHead>Действие</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {chats.items.map((chat: any) => {
                                        const user = otherParty(chat)
                                        return (
                                            <TableRow key={chat.id}>
                                                <TableCell>#{chat.id}</TableCell>
                                                <TableCell>
                                                    {user?.username ||
                                                        `User ${user?.id ?? '—'}`}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate text-muted-foreground">
                                                    {chat.last_message?.content || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {chat.last_message_at
                                                        ? format(
                                                              new Date(chat.last_message_at),
                                                              'dd.MM.yyyy HH:mm',
                                                          )
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/admin/chats/${chat.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Открыть
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground italic">
                            Обращений в поддержку пока нет
                        </div>
                    )}
                    {chats && chats.items.length > 0 && (
                        <Pagination
                            page={chats.page}
                            total={chats.total}
                            size={chats.size}
                            onPageChange={(p) => setValues({ page: p })}
                            onSizeChange={(s) => setValues({ size: s })}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
