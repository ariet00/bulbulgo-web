'use client'

import { useState } from 'react'
import { useAdminAnalyticsEvents } from '@doska/shared'
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
import { Link } from '@doska/i18n'

export default function AnalyticsEventsPage() {
    const [page, setPage] = useState(1)
    const size = 50
    const [eventType, setEventType] = useState('')
    const [userId, setUserId] = useState('')
    const [platform, setPlatform] = useState('')

    const params = {
        page,
        size,
        event_type: eventType || undefined,
        user_id: userId ? Number(userId) : undefined,
        platform: platform || undefined,
    }
    const { data, isLoading } = useAdminAnalyticsEvents(params)

    return (
        <div className="space-y-4 p-6">
            <h1 className="text-2xl font-semibold">Аналитика — события</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Фильтры</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Input
                            placeholder="event_type (напр. trip_created)"
                            value={eventType}
                            onChange={e => {
                                setEventType(e.target.value)
                                setPage(1)
                            }}
                        />
                        <Input
                            placeholder="user_id"
                            type="number"
                            value={userId}
                            onChange={e => {
                                setUserId(e.target.value)
                                setPage(1)
                            }}
                        />
                        <Input
                            placeholder="platform (web / ios / android / popytka / booking …)"
                            value={platform}
                            onChange={e => {
                                setPlatform(e.target.value)
                                setPage(1)
                            }}
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
                                                    href={`/admin/analytics/users/${ev.user_id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {ev.user_id}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>{ev.platform ?? '—'}</TableCell>
                                        <TableCell className="font-mono text-xs whitespace-pre-wrap break-all">
                                            {ev.data ? JSON.stringify(ev.data) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {data && data.total > size && (
                        <div className="mt-4">
                            <Pagination
                                page={page}
                                total={data.total}
                                size={size}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
