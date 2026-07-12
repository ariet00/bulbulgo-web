'use client'

import { useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { useAdminNotifications } from '@/hooks/queries/admin'

export function UserNotificationsCard({ uid }: { uid: number }) {
    const [notifPage, setNotifPage] = useState(1)
    const [notifSize, setNotifSize] = useState(10)
    const notifications = useAdminNotifications(notifPage, notifSize, { user_id: uid })

    return (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Уведомления{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    (всего {notifications.data?.total ?? 0})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notifications.isLoading ? (
                                <div>Загрузка…</div>
                            ) : !notifications.data || notifications.data.items.length === 0 ? (
                                <div className="text-muted-foreground">Нет уведомлений</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-44">Когда</TableHead>
                                            <TableHead>Заголовок</TableHead>
                                            <TableHead className="w-32">Тип</TableHead>
                                            <TableHead className="w-24">Прочитано</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {notifications.data.items.map((n: any) => (
                                            <TableRow key={n.id}>
                                                <TableCell className="text-xs whitespace-nowrap">
                                                    {n.created_at ? new Date(n.created_at).toLocaleString() : '—'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="font-medium">{n.title ?? '—'}</div>
                                                    {n.body && (
                                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                                            {n.body}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {n.type ?? '—'}
                                                    {n.category ? ` / ${n.category}` : ''}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {n.is_read ? 'да' : 'нет'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {notifications.data && notifications.data.total > 0 && (
                                <Pagination
                                    page={notifications.data.page}
                                    total={notifications.data.total}
                                    size={notifications.data.size}
                                    onPageChange={setNotifPage}
                                    onSizeChange={s => {
                                        setNotifSize(s)
                                        setNotifPage(1)
                                    }}
                                />
                            )}
                        </CardContent>
                    </Card>
    )
}
