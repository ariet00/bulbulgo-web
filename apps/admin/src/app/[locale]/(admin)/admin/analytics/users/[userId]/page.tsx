'use client'

import { useMemo, useState } from 'react'
import { use } from 'react'
import {
    useAdminAnalyticsUserEvents,
    useAdminUserDailyActivity,
} from '@doska/shared'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { Button } from '@doska/ui'

const PERIODS = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

const TOP_COLS = 8

export default function UserAnalyticsPage({
    params,
}: {
    params: Promise<{ userId: string }>
}) {
    const { userId } = use(params)
    const uid = Number(userId)
    const [period, setPeriod] = useState('30d')

    const activity = useAdminUserDailyActivity(uid, period)
    const events = useAdminAnalyticsUserEvents(uid, 1, 100)

    const { topEventTypes, totalEvents, activeDays } = useMemo(() => {
        if (!activity.data) return { topEventTypes: [] as string[], totalEvents: 0, activeDays: 0 }
        const sums: Record<string, number> = {}
        for (const day of activity.data.days) {
            for (const [ev, n] of Object.entries(day.events)) {
                sums[ev] = (sums[ev] || 0) + n
            }
        }
        const topEventTypes = Object.entries(sums)
            .sort((a, b) => b[1] - a[1])
            .slice(0, TOP_COLS)
            .map(([ev]) => ev)
        const totalEvents = activity.data.days.reduce((sum, d) => sum + d.total, 0)
        return { topEventTypes, totalEvents, activeDays: activity.data.days.length }
    }, [activity.data])

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">Активность пользователя #{uid}</h1>
                <div className="flex gap-2">
                    {PERIODS.map(p => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod(p.value)}
                        >
                            {p.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard title="Всего событий" value={totalEvents} />
                <SummaryCard title="Активных дней" value={activeDays} />
                <SummaryCard title="Различных событий" value={activity.data?.event_types.length ?? 0} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>По дням × события (топ {TOP_COLS})</CardTitle>
                </CardHeader>
                <CardContent>
                    {activity.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !activity.data || activity.data.days.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных за период</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-32">День</TableHead>
                                    {topEventTypes.map(ev => (
                                        <TableHead key={ev} className="text-right text-xs font-mono">
                                            {ev}
                                        </TableHead>
                                    ))}
                                    <TableHead className="w-20 text-right">Всего</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activity.data.days.map(d => (
                                    <TableRow key={d.day}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {new Date(d.day).toLocaleDateString()}
                                        </TableCell>
                                        {topEventTypes.map(ev => (
                                            <TableCell key={ev} className="text-right">
                                                {d.events[ev] ?? <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right font-medium">{d.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Лента событий (последние 100)</CardTitle>
                </CardHeader>
                <CardContent>
                    {events.isLoading ? (
                        <div>Загрузка…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-44">Когда</TableHead>
                                    <TableHead>Событие</TableHead>
                                    <TableHead className="w-32">platform</TableHead>
                                    <TableHead>data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(events.data?.items ?? []).map((ev: any) => (
                                    <TableRow key={ev.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {new Date(ev.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{ev.event_type}</TableCell>
                                        <TableCell>{ev.platform ?? '—'}</TableCell>
                                        <TableCell className="font-mono text-xs whitespace-pre-wrap break-all">
                                            {ev.data ? JSON.stringify(ev.data) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function SummaryCard({ title, value }: { title: string; value: number | undefined }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold">{value ?? '—'}</div>
            </CardContent>
        </Card>
    )
}
