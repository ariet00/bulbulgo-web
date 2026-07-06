'use client'

import { useAdminComplaintReasons, useAdminComplaints } from '@/hooks/queries/admin'
import {
    useAdminDeleteComplaint,
    useAdminSetComplaintStatus,
} from '@/hooks/mutations/admin'
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
} from '@doska/ui'
import { CheckCircle, Eye, ListChecks, RefreshCw, Trash2, X, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import type { AdminComplaint } from '@/apis/admin'
import { STATUSES, StatusBadge, TARGET_TYPES, targetHref, targetTypeLabel } from './helpers'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    target_type: ALL,
    status: ALL,
    reason: ALL,
    date_from: '',
    date_to: '',
}

export default function ComplaintsPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data, isLoading, isFetching, refetch } = useAdminComplaints(
        values.page,
        values.size,
        {
            q: values.q || undefined,
            target_type:
                values.target_type === ALL ? undefined : (values.target_type as any),
            status: values.status === ALL ? undefined : (values.status as any),
            reason: values.reason === ALL ? undefined : values.reason,
            date_from: values.date_from || undefined,
            date_to: values.date_to || undefined,
        },
    )
    const { data: reasons } = useAdminComplaintReasons()

    const setStatus = useAdminSetComplaintStatus()
    const deleteComplaint = useAdminDeleteComplaint()

    const handleDelete = (id: number) => {
        if (confirm('Удалить жалобу без возможности восстановления?')) {
            deleteComplaint.mutate(id)
        }
    }

    const resetFilters = () => {
        setQInput('')
        reset()
    }

    const hasActiveFilters =
        !!values.q ||
        values.target_type !== ALL ||
        values.status !== ALL ||
        values.reason !== ALL ||
        !!values.date_from ||
        !!values.date_to

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Жалобы</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Модерация жалоб</CardTitle>
                    <div className="flex gap-2">
                        <Link href="/admin/complaints/reasons">
                            <Button variant="outline" size="sm">
                                <ListChecks className="h-4 w-4 mr-1" />
                                Типы жалоб
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                            Обновить
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-2">
                        <Input
                            placeholder="Поиск по причине/описанию/id…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.target_type}
                            onValueChange={(v) => setValues({ target_type: v })}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Объект" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все объекты</SelectItem>
                                {TARGET_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            value={values.reason}
                            onValueChange={(v) => setValues({ reason: v })}
                        >
                            <SelectTrigger className="w-full sm:w-52">
                                <SelectValue placeholder="Причина" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все причины</SelectItem>
                                {reasons?.map((r) => (
                                    <SelectItem key={r.id} value={r.text}>
                                        {r.text}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Дата от</span>
                            <Input
                                type="date"
                                value={values.date_from}
                                onChange={(e) => setValues({ date_from: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">до</span>
                            <Input
                                type="date"
                                value={values.date_to}
                                onChange={(e) => setValues({ date_to: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
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
                                        <TableHead>Дата</TableHead>
                                        <TableHead>Кто пожаловался</TableHead>
                                        <TableHead>На что</TableHead>
                                        <TableHead>Причина</TableHead>
                                        <TableHead>Описание</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                                                Ничего не найдено
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.items.map((c: AdminComplaint) => {
                                        const href = targetHref(c.target)
                                        return (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.id}</TableCell>
                                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                    {format(new Date(c.created_at), 'dd.MM.yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell>
                                                    {c.reporter_id ? (
                                                        <Link
                                                            href={`/admin/users/${c.reporter_id}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {c.reporter?.full_name ||
                                                                c.reporter?.name ||
                                                                (c.reporter?.username
                                                                    ? `@${c.reporter.username}`
                                                                    : `#${c.reporter_id}`)}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted-foreground">Аноним</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">
                                                            {targetTypeLabel(c.target_type)}
                                                        </span>
                                                        {href ? (
                                                            <Link href={href} className="text-blue-600 hover:underline">
                                                                {c.target?.label || `#${c.target_id}`}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-muted-foreground line-through">
                                                                {c.target?.label || `#${c.target_id}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[16ch] truncate" title={c.reason}>
                                                    {c.reason}
                                                </TableCell>
                                                <TableCell className="max-w-[24ch] truncate" title={c.description || ''}>
                                                    {c.description || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={c.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Link href={`/admin/complaints/${c.id}`}>
                                                            <Button variant="outline" size="sm" title="Детали">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {c.status !== 'resolved' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                title="Отметить решённой"
                                                                disabled={setStatus.isPending}
                                                                onClick={() =>
                                                                    setStatus.mutate({ id: c.id, status: 'resolved' })
                                                                }
                                                            >
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                        )}
                                                        {c.status !== 'dismissed' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                title="Отклонить"
                                                                disabled={setStatus.isPending}
                                                                onClick={() =>
                                                                    setStatus.mutate({ id: c.id, status: 'dismissed' })
                                                                }
                                                            >
                                                                <XCircle className="h-4 w-4 text-gray-500" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            title="Удалить"
                                                            disabled={deleteComplaint.isPending}
                                                            onClick={() => handleDelete(c.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
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
