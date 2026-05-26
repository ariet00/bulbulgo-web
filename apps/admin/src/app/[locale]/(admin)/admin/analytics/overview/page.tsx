'use client'

import { useState } from 'react'
import {
    useAdminAnalytics,
    useAdminAnalyticsActiveUsers,
    useAdminAnalyticsMiddlewareToggle,
    useAdminAnalyticsPlatforms,
    useAdminAnalyticsTopEvents,
    useSetAnalyticsMiddlewareToggle,
} from '@doska/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Button } from '@doska/ui'

const PERIODS: Array<{ value: string; label: string }> = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

export default function AnalyticsOverviewPage() {
    const [period, setPeriod] = useState('7d')
    const summary = useAdminAnalytics()
    const top = useAdminAnalyticsTopEvents(period, 20)
    const platforms = useAdminAnalyticsPlatforms(period)
    const active = useAdminAnalyticsActiveUsers(period, period === '24h' ? 'hour' : 'day')
    const toggle = useAdminAnalyticsMiddlewareToggle()
    const setToggle = useSetAnalyticsMiddlewareToggle()

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">Аналитика — обзор</h1>
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

            {summary.data && (
                <div className="grid gap-3 md:grid-cols-4">
                    <SummaryCard title="Всего пользователей" value={summary.data.total_users} />
                    <SummaryCard title="iOS" value={summary.data.platforms?.ios} />
                    <SummaryCard title="Android" value={summary.data.platforms?.android} />
                    <SummaryCard title="Web" value={summary.data.platforms?.web} />
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Топ событий ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {top.isLoading ? (
                        <div>Загрузка…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Событие</TableHead>
                                    <TableHead className="w-32 text-right">Кол-во</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(top.data ?? []).map(row => (
                                    <TableRow key={row.event_type}>
                                        <TableCell className="font-mono text-sm">
                                            {row.event_type}
                                        </TableCell>
                                        <TableCell className="text-right">{row.count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Платформы ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {platforms.isLoading ? (
                        <div>Загрузка…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Платформа</TableHead>
                                    <TableHead className="w-32 text-right">События</TableHead>
                                    <TableHead className="w-32 text-right">Пользователи</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(platforms.data ?? []).map(row => (
                                    <TableRow key={String(row.platform)}>
                                        <TableCell className="font-mono text-sm">
                                            {row.platform ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right">{row.events}</TableCell>
                                        <TableCell className="text-right">{row.users}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Активные пользователи ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {active.isLoading ? (
                        <div>Загрузка…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Период</TableHead>
                                    <TableHead className="w-32 text-right">Пользователи</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(active.data ?? []).map(row => (
                                    <TableRow key={row.bucket}>
                                        <TableCell className="text-sm">
                                            {new Date(row.bucket).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">{row.users}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Middleware api_request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Если включить — каждый HTTP-запрос будет записан как событие
                        <code className="mx-1">api_request</code>. Использовать на короткие сессии:
                        таблица заполняется очень быстро.
                    </p>
                    <div className="flex items-center gap-3">
                        <span>
                            Сейчас:{' '}
                            <strong>
                                {toggle.isLoading
                                    ? '…'
                                    : toggle.data?.enabled
                                    ? 'включён'
                                    : 'выключен'}
                            </strong>
                        </span>
                        <Button
                            size="sm"
                            variant={toggle.data?.enabled ? 'outline' : 'default'}
                            disabled={toggle.isLoading || setToggle.isPending}
                            onClick={() => setToggle.mutate(!toggle.data?.enabled)}
                        >
                            {toggle.data?.enabled ? 'Выключить' : 'Включить'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function SummaryCard({ title, value }: { title: string; value: number | undefined }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold">{value ?? '—'}</div>
            </CardContent>
        </Card>
    )
}
