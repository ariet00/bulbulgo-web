'use client'

import { useState } from 'react'
import { useRouter } from '@doska/i18n'
import {
    useAdminAnalytics,
    useAdminAnalyticsActiveUsers,
    useAdminAnalyticsMiddlewareToggle,
    useAdminAnalyticsPlatforms,
    useAdminAnalyticsProducts,
    useAdminAnalyticsTopEvents,
} from '@/hooks/queries/admin'
import { useSetAnalyticsMiddlewareToggle } from '@/hooks/mutations/admin'
import { ProductSelector } from '@/components/admin/ProductSelector'
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
import { RefreshCw } from 'lucide-react'
import {
    ActiveUsersChart,
    CountPieChart,
    TopEventsChart,
} from '@/components/admin/analytics/charts-lazy'

const PERIODS: Array<{ value: string; label: string }> = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

export default function AnalyticsOverviewPage() {
    const router = useRouter()
    const [period, setPeriod] = useState('7d')
    const [product, setProduct] = useState('')
    const summary = useAdminAnalytics()
    const top = useAdminAnalyticsTopEvents(period, 20, product || undefined)
    const platforms = useAdminAnalyticsPlatforms(period, product || undefined)
    const products = useAdminAnalyticsProducts(period)
    const active = useAdminAnalyticsActiveUsers(period, period === '24h' ? 'hour' : 'day', product || undefined)
    const toggle = useAdminAnalyticsMiddlewareToggle()
    const setToggle = useSetAnalyticsMiddlewareToggle()

    const isFetching =
        summary.isFetching ||
        top.isFetching ||
        platforms.isFetching ||
        products.isFetching ||
        active.isFetching ||
        toggle.isFetching
    const refreshAll = () => {
        summary.refetch()
        top.refetch()
        platforms.refetch()
        products.refetch()
        active.refetch()
        toggle.refetch()
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">Аналитика — обзор</h1>
                <div className="flex gap-2 items-center flex-wrap">
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshAll}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            <ProductSelector value={product} onChange={setProduct} />

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
                    ) : !top.data || top.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <TopEventsChart
                            data={top.data}
                            onSelect={(ev) =>
                                router.push(`/admin/analytics/events/${encodeURIComponent(ev)}`)
                            }
                        />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                        Клик по столбцу — детальная аналитика события.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>По продуктам ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {products.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !products.data || products.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <CountPieChart
                                data={products.data}
                                dataKey="events"
                                nameKey="product"
                            />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Продукт</TableHead>
                                        <TableHead className="w-24 text-right">События</TableHead>
                                        <TableHead className="w-24 text-right">Польз.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.data.map(row => (
                                        <TableRow key={row.product}>
                                            <TableCell className="font-mono text-sm">
                                                {row.product}
                                            </TableCell>
                                            <TableCell className="text-right">{row.events}</TableCell>
                                            <TableCell className="text-right">{row.users}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
                    ) : !platforms.data || platforms.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <CountPieChart
                                data={platforms.data.map(p => ({
                                    ...p,
                                    platform: p.platform ?? 'unknown',
                                }))}
                                dataKey="events"
                                nameKey="platform"
                            />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Платформа</TableHead>
                                        <TableHead className="w-24 text-right">События</TableHead>
                                        <TableHead className="w-24 text-right">Польз.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {platforms.data.map(row => (
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
                        </div>
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
                    ) : !active.data || active.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <ActiveUsersChart data={active.data} />
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
