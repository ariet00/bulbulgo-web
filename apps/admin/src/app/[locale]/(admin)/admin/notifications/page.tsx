'use client'

import {
    useAdminDeleteNotification,
    useAdminNotifications,
    useDebounce,
} from '@doska/shared'
import {
    Badge,
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
import { Link } from '@doska/i18n'
import { CalendarClock, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { UserCombobox } from '@/components/admin/selectors/UserCombobox'

const ALL = '__all__'

function sourceBadge(source?: string) {
    if (source === 'admin') return <Badge variant="default">Админ</Badge>
    return <Badge variant="secondary">Система</Badge>
}

function statusBadge(status?: string) {
    switch (status) {
        case 'sent':
            return <Badge variant="default">Отправлено</Badge>
        case 'partial':
            return <Badge variant="outline">Частично</Badge>
        case 'failed':
            return <Badge variant="destructive">Ошибка</Badge>
        case 'no_devices':
            return <Badge variant="secondary">Нет устройств</Badge>
        case 'pending':
            return <Badge variant="outline">В очереди</Badge>
        default:
            return <span className="text-muted-foreground">—</span>
    }
}

export default function AdminNotificationsPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)
    const [userId, setUserId] = useState<number | null>(null)
    const [isRead, setIsRead] = useState<string>(ALL)
    const [source, setSource] = useState<string>(ALL)
    const [status, setStatus] = useState<string>(ALL)

    const { data, isLoading } = useAdminNotifications(page, size, {
        q: dq || undefined,
        user_id: userId ?? undefined,
        is_read: isRead === ALL ? undefined : isRead === 'true',
        source: source === ALL ? undefined : source,
        status: status === ALL ? undefined : status,
    })

    const deleteMutation = useAdminDeleteNotification()

    const resetPage = () => setPage(1)

    const handleDelete = (id: number) => {
        if (confirm(`Удалить уведомление #${id}?`)) {
            deleteMutation.mutate(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">Уведомления</h1>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/notifications/scheduled">
                            <CalendarClock className="size-4 mr-1" /> Запланированные
                        </Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/admin/notifications/send">
                            <Send className="size-4 mr-1" /> Отправить
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Управление уведомлениями</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <Input
                            placeholder="Поиск по заголовку/тексту…"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value)
                                resetPage()
                            }}
                            className="w-full sm:max-w-xs"
                        />
                        <div className="w-full sm:w-64">
                            <UserCombobox
                                value={userId}
                                onChange={(id) => {
                                    setUserId(id)
                                    resetPage()
                                }}
                                placeholder="Все пользователи"
                                allowClear
                            />
                        </div>
                        <Select
                            value={isRead}
                            onValueChange={(v) => {
                                setIsRead(v)
                                resetPage()
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Прочитано" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все</SelectItem>
                                <SelectItem value="true">Прочитанные</SelectItem>
                                <SelectItem value="false">Непрочитанные</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={source}
                            onValueChange={(v) => {
                                setSource(v)
                                resetPage()
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Источник" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все источники</SelectItem>
                                <SelectItem value="admin">Админ</SelectItem>
                                <SelectItem value="system">Система</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={status}
                            onValueChange={(v) => {
                                setStatus(v)
                                resetPage()
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                <SelectItem value="sent">Отправлено</SelectItem>
                                <SelectItem value="partial">Частично</SelectItem>
                                <SelectItem value="failed">Ошибка</SelectItem>
                                <SelectItem value="no_devices">Нет устройств</SelectItem>
                                <SelectItem value="pending">В очереди</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div>Загрузка…</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Пользователь</TableHead>
                                        <TableHead>Заголовок</TableHead>
                                        <TableHead>Текст</TableHead>
                                        <TableHead>Тип</TableHead>
                                        <TableHead>Источник</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Прочитано</TableHead>
                                        <TableHead>Ошибка</TableHead>
                                        <TableHead>Создано</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.map((n: any) => (
                                        <TableRow key={n.id}>
                                            <TableCell>{n.id}</TableCell>
                                            <TableCell>{n.user_id ?? '—'}</TableCell>
                                            <TableCell className="font-medium max-w-[180px] truncate">
                                                {n.title}
                                            </TableCell>
                                            <TableCell className="max-w-[220px] truncate text-muted-foreground">
                                                {n.body}
                                            </TableCell>
                                            <TableCell>
                                                {n.type}
                                                {n.category ? ` / ${n.category}` : ''}
                                            </TableCell>
                                            <TableCell>{sourceBadge(n.source)}</TableCell>
                                            <TableCell>{statusBadge(n.status)}</TableCell>
                                            <TableCell>
                                                {n.is_read ? (
                                                    <Badge variant="secondary">Да</Badge>
                                                ) : (
                                                    <Badge variant="outline">Нет</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[220px] truncate text-destructive text-xs">
                                                {n.error ?? ''}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {n.created_at
                                                    ? new Date(n.created_at).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(n.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data && data.items.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={11}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Ничего не найдено
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {data && (
                        <Pagination
                            page={data.page}
                            total={data.total}
                            size={data.size}
                            onPageChange={setPage}
                            onSizeChange={setSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
