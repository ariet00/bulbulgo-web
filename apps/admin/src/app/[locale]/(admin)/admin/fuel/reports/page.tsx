'use client'

// Метки топлива (краудсорс-репорты): модерация — просмотр + удаление фейков.

import { useAdminFuelReports } from '@/hooks/queries/admin'
import { useAdminDeleteFuelReport } from '@/hooks/mutations/admin'
import { useFilterParams } from '@/hooks/useFilterParams'
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
import { MapPin, RefreshCw, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    FUEL_TYPE_LABELS,
    QUEUE_LABELS,
    RESTRICTION_LABELS,
    StatusBadge,
} from '../helpers'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 50,
    station_id: '',
    user_id: '',
    fuel_type: ALL,
    status: ALL,
}

export default function FuelReportsPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const { data, isLoading, isFetching, refetch } = useAdminFuelReports(
        values.page,
        values.size,
        {
            station_id: values.station_id ? Number(values.station_id) : undefined,
            user_id: values.user_id ? Number(values.user_id) : undefined,
            fuel_type: values.fuel_type === ALL ? undefined : values.fuel_type,
            status: values.status === ALL ? undefined : values.status,
        },
    )
    const deleteReport = useAdminDeleteFuelReport()

    const handleDelete = (id: number) => {
        if (confirm('Удалить метку без возможности восстановления?')) {
            deleteReport.mutate(id)
        }
    }

    const hasActiveFilters =
        !!values.station_id ||
        !!values.user_id ||
        values.fuel_type !== ALL ||
        values.status !== ALL

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Метки топлива</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        Отметки водителей{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            {data ? `(${data.total})` : ''}
                        </span>
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Input
                            className="w-32"
                            placeholder="ID станции"
                            inputMode="numeric"
                            value={values.station_id}
                            onChange={(e) =>
                                setValues({ station_id: e.target.value.replace(/\D/g, ''), page: 1 })
                            }
                        />
                        <Input
                            className="w-32"
                            placeholder="ID юзера"
                            inputMode="numeric"
                            value={values.user_id}
                            onChange={(e) =>
                                setValues({ user_id: e.target.value.replace(/\D/g, ''), page: 1 })
                            }
                        />
                        <Select
                            value={values.fuel_type}
                            onValueChange={(v) => setValues({ fuel_type: v, page: 1 })}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Марка" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все марки</SelectItem>
                                {Object.entries(FUEL_TYPE_LABELS).map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                        {l}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.status}
                            onValueChange={(v) => setValues({ status: v, page: 1 })}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                {['available', 'low', 'incoming', 'queue', 'out'].map((v) => (
                                    <SelectItem key={v} value={v}>
                                        <StatusBadge status={v} />
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={reset}>
                                <X className="mr-1 h-4 w-4" />
                                Сбросить
                            </Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>АЗС</TableHead>
                                <TableHead>Марка</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Очередь</TableHead>
                                <TableHead>Цена</TableHead>
                                <TableHead>Детали</TableHead>
                                <TableHead>Юзер</TableHead>
                                <TableHead>Когда</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                                        Загрузка…
                                    </TableCell>
                                </TableRow>
                            ) : !data?.items.length ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                                        Меток нет
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.items.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="text-muted-foreground">{r.id}</TableCell>
                                        <TableCell className="max-w-52">
                                            <div className="truncate font-medium">{r.station_name}</div>
                                            <div className="text-xs text-muted-foreground">#{r.station_id}</div>
                                        </TableCell>
                                        <TableCell>{FUEL_TYPE_LABELS[r.fuel_type] ?? r.fuel_type}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={r.status} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {r.queue ? QUEUE_LABELS[r.queue] ?? r.queue : '—'}
                                        </TableCell>
                                        <TableCell className="tabular-nums">
                                            {r.price != null ? `${r.price} с` : '—'}
                                        </TableCell>
                                        <TableCell className="max-w-44 text-xs text-muted-foreground">
                                            <div className="truncate">
                                                {[
                                                    r.restriction &&
                                                        (RESTRICTION_LABELS[r.restriction] ?? r.restriction),
                                                    r.note,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ') || '—'}
                                            </div>
                                            {r.location && (
                                                <a
                                                    className="mt-0.5 inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                                                    href={`https://www.openstreetmap.org/?mlat=${r.location.lat}&mlon=${r.location.lng}#map=17/${r.location.lat}/${r.location.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <MapPin className="h-3 w-3" />
                                                    гео отметки
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {r.user_id ? (
                                                <Link
                                                    className="text-blue-600 hover:underline dark:text-blue-400"
                                                    href={`/admin/users/${r.user_id}`}
                                                >
                                                    #{r.user_id}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-muted-foreground">
                                            {format(new Date(r.created_at), 'dd.MM.yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(r.id)}
                                                disabled={deleteReport.isPending}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {data && data.total > values.size && (
                        <div className="mt-4">
                            <Pagination
                                page={values.page}
                                total={data.total}
                                size={values.size}
                                onPageChange={(p) => setValues({ page: p })}
                                onSizeChange={(s) => setValues({ size: s, page: 1 })}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
