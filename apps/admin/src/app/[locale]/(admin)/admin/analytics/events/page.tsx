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
import { RefreshCw } from 'lucide-react'
import { ProductSelector } from '@/components/admin/ProductSelector'
import { DataCell } from '@/components/admin/analytics/DataCell'

const SIZE = 50

const FILTER_DEFAULTS = {
    page: 1,
    event_type: '',
    user_id: 0,
    platform: '',
    product: '',
}

export default function AnalyticsEventsPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)

    const [eventTypeInput, setEventTypeInput] = useState(values.event_type)
    const [userIdInput, setUserIdInput] = useState(values.user_id ? String(values.user_id) : '')
    const [platformInput, setPlatformInput] = useState(values.platform)
    const dEventType = useDebounce(eventTypeInput, 400)
    const dUserId = useDebounce(userIdInput, 400)
    const dPlatform = useDebounce(platformInput, 400)
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

    const params = {
        page: values.page,
        size: SIZE,
        event_type: values.event_type || undefined,
        user_id: values.user_id || undefined,
        platform: values.platform || undefined,
        product: values.product || undefined,
    }
    const { data, isLoading, isFetching, refetch } = useAdminAnalyticsEvents(params)

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">Аналитика — события</h1>
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

            <ProductSelector
                value={values.product}
                onChange={(v) => setValues({ product: v })}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Фильтры</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Input
                            placeholder="event_type (напр. trip_created)"
                            value={eventTypeInput}
                            onChange={e => setEventTypeInput(e.target.value)}
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
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-44">Когда</TableHead>
                                    <TableHead>Событие</TableHead>
                                    <TableHead className="w-24">user_id</TableHead>
                                    <TableHead className="w-32">platform</TableHead>
                                    <TableHead className="w-24">app_version</TableHead>
                                    <TableHead className="w-40">device_id</TableHead>
                                    <TableHead>data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data?.items ?? []).map((ev: any) => (
                                    <TableRow key={ev.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {new Date(ev.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {ev.event_type}
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
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {ev.app_version ?? '—'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs break-all">
                                            {ev.device_id ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <DataCell data={ev.data} eventType={ev.event_type} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
