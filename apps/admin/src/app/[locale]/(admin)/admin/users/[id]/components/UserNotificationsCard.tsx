'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { useDebounce } from '@doska/shared'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Pagination,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { useAdminNotifications } from '@/hooks/queries/admin'

const ALL = '__all__'

export function UserNotificationsCard({ uid }: { uid: number }) {
    const [notifPage, setNotifPage] = useState(1)
    const [notifSize, setNotifSize] = useState(10)
    const [search, setSearch] = useState('')
    const [isRead, setIsRead] = useState(ALL)
    const [type, setType] = useState('')

    const debouncedSearch = useDebounce(search, 300)
    const debouncedType = useDebounce(type, 300)

    const notifications = useAdminNotifications(notifPage, notifSize, {
        user_id: uid,
        q: debouncedSearch.trim() || undefined,
        is_read: isRead === ALL ? undefined : isRead === 'true',
        type: debouncedType.trim() || undefined,
    })

    useEffect(() => {
        setNotifPage(1)
    }, [debouncedSearch, isRead, debouncedType])

    const hasFilters = !!search || isRead !== ALL || !!type
    const resetFilters = () => {
        setSearch('')
        setIsRead(ALL)
        setType('')
    }

    return (
        <Card>
            <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>
                        Уведомления{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            (всего {notifications.data?.total ?? 0})
                        </span>
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => notifications.refetch()}
                        disabled={notifications.isFetching}
                    >
                        <RefreshCw
                            className={`mr-1 h-4 w-4 ${notifications.isFetching ? 'animate-spin' : ''}`}
                        />
                        Обновить
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Поиск по заголовку/тексту…"
                        className="h-9 w-full sm:w-64"
                    />
                    <Input
                        value={type}
                        onChange={e => setType(e.target.value)}
                        placeholder="Тип (info / trip_alert…)"
                        className="h-9 w-full sm:w-48"
                    />
                    <Select value={isRead} onValueChange={setIsRead}>
                        <SelectTrigger className="h-9 w-full sm:w-44">
                            <SelectValue placeholder="Прочитано" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Все</SelectItem>
                            <SelectItem value="true">Прочитанные</SelectItem>
                            <SelectItem value="false">Непрочитанные</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                            <X className="mr-1 h-4 w-4" /> Сбросить
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {notifications.isLoading ? (
                    <div>Загрузка…</div>
                ) : !notifications.data || notifications.data.items.length === 0 ? (
                    <div className="text-muted-foreground">
                        {hasFilters ? 'Нет уведомлений по фильтру' : 'Нет уведомлений'}
                    </div>
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
