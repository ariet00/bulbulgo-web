'use client'

import { useAdminDevices } from '@/hooks/queries/admin'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useDebounce } from '@doska/shared'
import { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Pagination,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
} from '@doska/ui'
import { RefreshCw, X } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import type { AdminDeviceListItem } from '@/apis/admin'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    status: ALL,
    device_type: ALL,
}

const STATUSES = [
    { value: 'active', label: 'Активно' },
    { value: 'logged_out', label: 'Разлогинено' },
    { value: 'banned', label: 'Забанено' },
]

const DEVICE_TYPES = [
    { value: 'android', label: 'Android' },
    { value: 'ios', label: 'iOS' },
    { value: 'web', label: 'Web' },
]

function StatusBadge({ status }: { status: string }) {
    const variant =
        status === 'active' ? 'default' : status === 'banned' ? 'destructive' : 'secondary'
    const label = STATUSES.find((s) => s.value === status)?.label ?? status
    return <Badge variant={variant}>{label}</Badge>
}

export default function DevicesPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data, isLoading, isFetching, refetch } = useAdminDevices(
        values.page,
        values.size,
        {
            q: values.q || undefined,
            status: values.status === ALL ? undefined : values.status,
            device_type: values.device_type === ALL ? undefined : values.device_type,
        },
    )

    const resetFilters = () => {
        setQInput('')
        reset()
    }

    const hasActiveFilters =
        !!values.q || values.status !== ALL || values.device_type !== ALL

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Устройства</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Реестр устройств</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-2">
                        <Input
                            placeholder="Поиск по device_id / инфо / версии / user_id…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.status}
                            onValueChange={(v) => setValues({ status: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                {STATUSES.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.device_type}
                            onValueChange={(v) => setValues({ device_type: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Платформа" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все платформы</SelectItem>
                                {DEVICE_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Сбросить
                            </Button>
                        )}
                    </div>
                    {isLoading ? (
                        <div>Загрузка...</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Пользователь</TableHead>
                                        <TableHead>Device ID</TableHead>
                                        <TableHead>Платформа</TableHead>
                                        <TableHead>Устройство</TableHead>
                                        <TableHead>Версия</TableHead>
                                        <TableHead>Push</TableHead>
                                        <TableHead>Root</TableHead>
                                        <TableHead>Установщик</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Создано</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center text-muted-foreground py-6">
                                                Ничего не найдено
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.items.map((d: AdminDeviceListItem) => (
                                        <TableRow key={d.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/devices/${d.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {d.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {d.user_id ? (
                                                    <Link
                                                        href={`/admin/users/${d.user_id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {d.user_name || d.user_phone || `#${d.user_id}`}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="max-w-[20ch] truncate font-mono text-xs"
                                                title={d.device_id || ''}
                                            >
                                                {d.device_id || '—'}
                                            </TableCell>
                                            <TableCell className="capitalize">{d.device_type}</TableCell>
                                            <TableCell
                                                className="max-w-[20ch] truncate"
                                                title={d.device_info || ''}
                                            >
                                                {d.device_info || '—'}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {d.app_version || '—'}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm">
                                                {d.push_permission || (d.token ? 'есть токен' : '—')}
                                            </TableCell>
                                            <TableCell>
                                                {d.rooted == null ? (
                                                    '—'
                                                ) : d.rooted ? (
                                                    <Badge variant="destructive">root</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">нет</span>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="max-w-[14ch] truncate text-sm"
                                                title={d.installer_store || ''}
                                            >
                                                {d.installer_store || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={d.status} />
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                {format(new Date(d.created_at), 'dd.MM.yyyy HH:mm')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {data && (
                        <Pagination
                            page={data.page}
                            total={data.total}
                            size={data.size}
                            onPageChange={(p) => setValues({ page: p })}
                            onSizeChange={(s) => setValues({ size: s })}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
