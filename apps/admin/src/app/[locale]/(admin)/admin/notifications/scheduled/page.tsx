'use client'

import { AdminScheduledNotification } from '@/apis/admin'
import { useAdminCancelScheduledNotification } from '@/hooks/mutations/admin'
import { useAdminScheduledNotifications } from '@/hooks/queries/admin'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
import { ArrowLeft, CalendarClock, X } from 'lucide-react'
import { useState } from 'react'

const ALL = '__all__'

function statusBadge(s: AdminScheduledNotification['status']) {
    switch (s) {
        case 'pending':
            return <Badge variant="outline">В ожидании</Badge>
        case 'sent':
            return <Badge variant="default">Отправлено</Badge>
        case 'cancelled':
            return <Badge variant="secondary">Отменено</Badge>
        case 'failed':
            return <Badge variant="destructive">Ошибка</Badge>
        default:
            return <Badge variant="outline">{s}</Badge>
    }
}

function filtersSummary(f: AdminScheduledNotification['filters']): string {
    if (!f) return '—'
    const parts: string[] = []
    if (f.role_id) parts.push(`role=${f.role_id}`)
    if (f.device_type) parts.push(f.device_type)
    if (f.status) parts.push(f.status === 'banned' ? 'забаненные' : 'активные')
    if (f.min_version) parts.push(`≥${f.min_version}`)
    if (f.max_version) parts.push(`≤${f.max_version}`)
    return parts.length ? parts.join(', ') : 'все'
}

export default function AdminScheduledNotificationsPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [status, setStatus] = useState<string>(ALL)
    const [kind, setKind] = useState<string>(ALL)

    const { data, isLoading } = useAdminScheduledNotifications(page, size, {
        status: status === ALL ? undefined : status,
        kind: kind === ALL ? undefined : kind,
    })

    const cancelMutation = useAdminCancelScheduledNotification()

    const onCancel = (id: number) => {
        if (confirm(`Отменить запланированное #${id}?`)) {
            cancelMutation.mutate(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/notifications">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Запланированные уведомления</h1>
                <div className="flex-1" />
                <Button asChild size="sm">
                    <Link href="/admin/notifications/send">
                        <CalendarClock className="size-4 mr-1" /> Запланировать новое
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Select
                            value={status}
                            onValueChange={(v) => {
                                setStatus(v)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                <SelectItem value="pending">В ожидании</SelectItem>
                                <SelectItem value="sent">Отправлено</SelectItem>
                                <SelectItem value="cancelled">Отменено</SelectItem>
                                <SelectItem value="failed">Ошибка</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={kind}
                            onValueChange={(v) => {
                                setKind(v)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все типы</SelectItem>
                                <SelectItem value="user">Пользователю</SelectItem>
                                <SelectItem value="broadcast">Рассылка</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div>Загрузка…</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Когда</TableHead>
                                        <TableHead>Тип</TableHead>
                                        <TableHead>Кому</TableHead>
                                        <TableHead>Заголовок</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Создал</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.map((n) => (
                                        <TableRow key={n.id}>
                                            <TableCell>{n.id}</TableCell>
                                            <TableCell className="whitespace-nowrap text-xs">
                                                {new Date(n.scheduled_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {n.kind === 'user' ? 'Пользователю' : 'Рассылка'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {n.kind === 'user'
                                                    ? `user #${n.user_id ?? '—'}`
                                                    : filtersSummary(n.filters)}
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[220px] truncate">
                                                {n.title}
                                            </TableCell>
                                            <TableCell>{statusBadge(n.status)}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {n.created_by_id ? `#${n.created_by_id}` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {n.status === 'pending' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onCancel(n.id)}
                                                        disabled={cancelMutation.isPending}
                                                    >
                                                        <X className="size-4 mr-1" /> Отменить
                                                    </Button>
                                                )}
                                                {n.status === 'failed' && n.error && (
                                                    <span
                                                        className="text-xs text-destructive"
                                                        title={n.error}
                                                    >
                                                        {n.error.slice(0, 40)}
                                                        {n.error.length > 40 ? '…' : ''}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data && data.items.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
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
