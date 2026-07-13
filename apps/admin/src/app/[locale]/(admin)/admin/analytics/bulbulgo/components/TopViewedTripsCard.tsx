'use client'

import { useState } from 'react'
import {
    Button,
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
import { Link } from '@doska/i18n'
import { RefreshCw } from 'lucide-react'
import { useAdminRideshareTopViewedTrips } from '@/hooks/queries/admin'
import { AsyncBlock, LIST_SIZE, roleLabel } from './shared'

type TopViewedRow = NonNullable<
    ReturnType<typeof useAdminRideshareTopViewedTrips>['data']
>['trips'][number]

const TRIP_TYPES: Array<{ value: string; label: string }> = [
    { value: '', label: 'Все типы' },
    { value: 'rideshare', label: 'Поездки' },
    { value: 'taxi', label: 'Такси' },
    { value: 'shuttle', label: 'Маршрутки' },
    { value: 'bus', label: 'Автобусы' },
    { value: 'freight', label: 'Грузовые' },
    { value: 'delivery', label: 'Доставка' },
]

const TRIP_ROLES: Array<{ value: string; label: string }> = [
    { value: '', label: 'Все роли' },
    { value: 'driver', label: 'Водители' },
    { value: 'passenger', label: 'Пассажиры' },
]

// Currently active trips ranked by phone-view count (data.phone_view_count).
export function TopViewedTripsCard() {
    const [page, setPage] = useState(1)
    const [tripType, setTripType] = useState('')
    const [role, setRole] = useState('')
    const [realOnly, setRealOnly] = useState(false)

    const query = useAdminRideshareTopViewedTrips(page, LIST_SIZE, {
        tripType: tripType || undefined,
        role: role || undefined,
        realOnly,
    })
    const trips = query.data?.trips ?? []
    const total = query.data?.total ?? 0

    return (
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>Самые просматриваемые поездки ({total})</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => query.refetch()}
                        disabled={query.isFetching}
                    >
                        <RefreshCw
                            className={`mr-1 h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`}
                        />
                        Обновить
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                    {TRIP_TYPES.map(t => (
                        <Button
                            key={t.value || 'all'}
                            variant={tripType === t.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                                setTripType(t.value)
                                setPage(1)
                            }}
                        >
                            {t.label}
                        </Button>
                    ))}
                    <span className="mx-1 h-4 w-px bg-border" />
                    {TRIP_ROLES.map(r => (
                        <Button
                            key={r.value || 'all'}
                            variant={role === r.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                                setRole(r.value)
                                setPage(1)
                            }}
                        >
                            {r.label}
                        </Button>
                    ))}
                    <span className="mx-1 h-4 w-px bg-border" />
                    <Button
                        variant={realOnly ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                            setRealOnly(!realOnly)
                            setPage(1)
                        }}
                        title="Только реальные пользователи (без спарсенных из чатов)"
                    >
                        Только реальные
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Активные объявления по числу просмотров номера (data.phone_view_count)
                </p>
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={query.isLoading} empty={trips.length === 0}>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead className="w-32 text-right font-semibold">
                                        Просмотров
                                    </TableHead>
                                    <TableHead>Маршрут</TableHead>
                                    <TableHead className="w-28">Тип / роль</TableHead>
                                    <TableHead>Владелец</TableHead>
                                    <TableHead className="w-40">Последний просмотр</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trips.map((t: TopViewedRow, i: number) => (
                                    <TableRow key={t.trip_id}>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {(page - 1) * LIST_SIZE + i + 1}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums font-semibold">
                                            {t.phone_view_count}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/admin/trips/${t.trip_id}`}
                                                className="hover:underline"
                                            >
                                                <span className="text-sm">
                                                    {t.from_name ?? '—'} → {t.to_name ?? '—'}
                                                </span>
                                                <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                                                    #{t.trip_id}
                                                </span>
                                            </Link>
                                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                                                <span>
                                                    {t.price != null
                                                        ? `${t.price.toLocaleString()} сом`
                                                        : 'Договорная'}
                                                </span>
                                                {t.seats != null && <span>· {t.seats} мест</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {t.trip_type ?? '—'} / {roleLabel(t.role)}
                                        </TableCell>
                                        <TableCell>
                                            {t.owner_user_id ? (
                                                <Link
                                                    href={`/admin/users/${t.owner_user_id}`}
                                                    className="hover:underline text-sm"
                                                >
                                                    {t.owner_name ?? `user #${t.owner_user_id}`}
                                                    <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                                                        #{t.owner_user_id}
                                                    </span>
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                            {t.last_phone_view_at
                                                ? new Date(t.last_phone_view_at).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-2 md:hidden">
                        {trips.map((t: TopViewedRow, i: number) => (
                            <div key={t.trip_id} className="rounded-lg border p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-2">
                                        <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                                            {(page - 1) * LIST_SIZE + i + 1}
                                        </span>
                                        <Link
                                            href={`/admin/trips/${t.trip_id}`}
                                            className="min-w-0 hover:underline"
                                        >
                                            <div className="text-sm font-medium">
                                                {t.from_name ?? '—'} → {t.to_name ?? '—'}
                                            </div>
                                            <div className="text-xs text-muted-foreground tabular-nums">
                                                #{t.trip_id} · {t.trip_type ?? '—'} /{' '}
                                                {roleLabel(t.role)}
                                            </div>
                                            <div className="text-xs text-muted-foreground tabular-nums">
                                                {t.price != null
                                                    ? `${t.price.toLocaleString()} сом`
                                                    : 'Договорная'}
                                                {t.seats != null && ` · ${t.seats} мест`}
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-lg font-semibold tabular-nums">
                                            {t.phone_view_count}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            просмотров
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                                    <span>
                                        {t.owner_user_id ? (
                                            <Link
                                                href={`/admin/users/${t.owner_user_id}`}
                                                className="hover:underline"
                                            >
                                                {t.owner_name ?? `user #${t.owner_user_id}`}
                                                <span className="ml-1 tabular-nums">
                                                    #{t.owner_user_id}
                                                </span>
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </span>
                                    <span className="whitespace-nowrap">
                                        {t.last_phone_view_at
                                            ? new Date(t.last_phone_view_at).toLocaleString()
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </AsyncBlock>

                {(total > LIST_SIZE || page > 1) && (
                    <div className="mt-4">
                        <Pagination
                            page={page}
                            total={total}
                            size={LIST_SIZE}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
