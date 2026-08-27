'use client'

import { useEffect, useState } from 'react'
import { useAdminAnalyticsEvents } from '@/hooks/queries/admin'
import { useDebounce } from '@doska/shared'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Input } from '@doska/ui'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { Button } from '@doska/ui'
import { Link } from '@doska/i18n'
import { RefreshCw, Trash2 } from 'lucide-react'
import { ProductSelector } from '@/components/admin/ProductSelector'
import {
    DataCell,
    DataTableCell,
    DATA_COLUMN_WIDTH,
} from '@/components/admin/analytics/DataCell'

const SIZE = 50

const FILTER_DEFAULTS = {
    page: 1,
    event_type: '',
    user_id: 0,
    platform: '',
    client: '',
    subtype: '',
    device_id: '',
    product: '',
}

export default function AnalyticsEventsPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)

    const [eventTypeInput, setEventTypeInput] = useState(values.event_type)
    const [userIdInput, setUserIdInput] = useState(values.user_id ? String(values.user_id) : '')
    const [platformInput, setPlatformInput] = useState(values.platform)
    const [clientInput, setClientInput] = useState(values.client)
    const [subtypeInput, setSubtypeInput] = useState(values.subtype)
    const [deviceIdInput, setDeviceIdInput] = useState(values.device_id)
    const dEventType = useDebounce(eventTypeInput, 400)
    const dUserId = useDebounce(userIdInput, 400)
    const dPlatform = useDebounce(platformInput, 400)
    const dClient = useDebounce(clientInput, 400)
    const dSubtype = useDebounce(subtypeInput, 400)
    const dDeviceId = useDebounce(deviceIdInput, 400)
    useEffect(() => {
        if (dEventType !== values.event_type) setValues({ event_type: dEventType })
    }, [dEventType, values.event_type, setValues])
    useEffect(() => {
        const n = dUserId === '' ? 0 : Number(dUserId)
        if (n !== values.user_id) setValues({ user_id: n })
    }, [dUserId, values.user_id, setValues])
    useEffect(() => {
        if (dPlatform !== values.platform) setValues({ platform: dPlatform })
    }, [dPlatform, values.platform, setValues])
    useEffect(() => {
        if (dClient !== values.client) setValues({ client: dClient })
    }, [dClient, values.client, setValues])
    useEffect(() => {
        if (dSubtype !== values.subtype) setValues({ subtype: dSubtype })
    }, [dSubtype, values.subtype, setValues])
    useEffect(() => {
        if (dDeviceId !== values.device_id) setValues({ device_id: dDeviceId })
    }, [dDeviceId, values.device_id, setValues])

    const params = {
        page: values.page,
        size: SIZE,
        event_type: values.event_type || undefined,
        user_id: values.user_id || undefined,
        platform: values.platform || undefined,
        client: values.client || undefined,
        subtype: values.subtype || undefined,
        device_id: values.device_id || undefined,
        product: values.product || undefined,
    }
    const { data, isLoading, isFetching, refetch } = useAdminAnalyticsEvents(params)

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">Аналитика — события</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/analytics/cleanup">
                            <Trash2 className="mr-1 h-4 w-4" />
                            Очистка
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            <ProductSelector
                value={values.product}
                onChange={(v) => setValues({ product: v })}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Фильтры</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <Input
                            placeholder="event_type (напр. trip_created)"
                            value={eventTypeInput}
                            onChange={e => setEventTypeInput(e.target.value)}
                        />
                        <Input
                            placeholder="subtype (напр. login)"
                            value={subtypeInput}
                            onChange={e => setSubtypeInput(e.target.value)}
                        />
                        <Input
                            placeholder="user_id"
                            type="number"
                            value={userIdInput}
                            onChange={e => setUserIdInput(e.target.value)}
                        />
                        <Input
                            placeholder="platform (web / ios / android / popytka / booking …)"
                            value={platformInput}
                            onChange={e => setPlatformInput(e.target.value)}
                        />
                        <Input
                            placeholder="client (bulbulgo / booking / akcha / staff / tglab / admin / <bot slug>)"
                            value={clientInput}
                            onChange={e => setClientInput(e.target.value)}
                        />
                        <Input
                            placeholder="device_id"
                            value={deviceIdInput}
                            onChange={e => setDeviceIdInput(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>События ({data?.total ?? 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div>Загрузка…</div>
                    ) : (data?.items ?? []).length === 0 ? (
                        <div className="text-muted-foreground">Нет событий</div>
                    ) : (
                        <>
                            {/* Мобилка: карточка на событие — таблица из 7 колонок не влезает */}
                            <div className="space-y-3 md:hidden">
                                {(data?.items ?? []).map((ev: any) => (
                                    <div
                                        key={ev.id}
                                        className="rounded-lg border p-3 space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/admin/analytics/events/${encodeURIComponent(ev.event_type)}`}
                                                    className="font-mono text-sm break-all hover:text-primary hover:underline"
                                                >
                                                    {ev.event_type}
                                                </Link>
                                                {ev.event_subtype && (
                                                    <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                                        {ev.event_subtype}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                                                {new Date(ev.created_at).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span>
                                                user:{' '}
                                                {ev.user_id ? (
                                                    <Link
                                                        href={`/admin/users/${ev.user_id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {ev.user_id}
                                                    </Link>
                                                ) : (
                                                    '—'
                                                )}
                                            </span>
                                            <span>platform: {ev.platform ?? '—'}</span>
                                            <span>client: {ev.client ?? '—'}</span>
                                            <span>v: {ev.app_version ?? '—'}</span>
                                        </div>

                                        <div className="font-mono text-[11px] break-all text-muted-foreground">
                                            {ev.device_id ? (
                                                <button
                                                    onClick={() => setDeviceIdInput(ev.device_id)}
                                                    className="break-all text-left hover:text-primary hover:underline"
                                                    title="Фильтровать по этому устройству"
                                                >
                                                    {ev.device_id}
                                                </button>
                                            ) : (
                                                '—'
                                            )}
                                        </div>

                                        <DataCell data={ev.data} eventType={ev.event_type} />
                                    </div>
                                ))}
                            </div>

                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-44">Когда</TableHead>
                                            <TableHead>Событие</TableHead>
                                            <TableHead className="w-24">user_id</TableHead>
                                            <TableHead className="w-32">platform</TableHead>
                                            <TableHead className="w-28">client</TableHead>
                                            <TableHead className="w-24">app_version</TableHead>
                                            <TableHead className="w-40">device_id</TableHead>
                                            <TableHead className={DATA_COLUMN_WIDTH}>data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(data?.items ?? []).map((ev: any) => (
                                            <TableRow key={ev.id}>
                                                <TableCell className="text-xs whitespace-nowrap">
                                                    {new Date(ev.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    <Link
                                                        href={`/admin/analytics/events/${encodeURIComponent(ev.event_type)}`}
                                                        className="hover:text-primary hover:underline"
                                                    >
                                                        {ev.event_type}
                                                    </Link>
                                                    {ev.event_subtype && (
                                                        <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                                            {ev.event_subtype}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {ev.user_id ? (
                                                        <Link
                                                            href={`/admin/users/${ev.user_id}`}
                                                            className="text-primary hover:underline"
                                                        >
                                                            {ev.user_id}
                                                        </Link>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell>{ev.platform ?? '—'}</TableCell>
                                                <TableCell>{ev.client ?? '—'}</TableCell>
                                                <TableCell className="text-xs whitespace-nowrap">
                                                    {ev.app_version ?? '—'}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs break-all">
                                                    {ev.device_id ? (
                                                        <button
                                                            onClick={() => setDeviceIdInput(ev.device_id)}
                                                            className="break-all text-left hover:text-primary hover:underline"
                                                            title="Фильтровать по этому устройству"
                                                        >
                                                            {ev.device_id}
                                                        </button>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <DataTableCell
                                                    data={ev.data}
                                                    eventType={ev.event_type}
                                                />
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}

                    {data && data.total > SIZE && (
                        <div className="mt-4">
                            <Pagination
                                page={values.page}
                                total={data.total}
                                size={SIZE}
                                onPageChange={(p) => setValues({ page: p })}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
