'use client'

import { useState } from 'react'
import {
    useAdminAnalytics,
    useAdminAnalyticsActiveUsers,
    useAdminAnalyticsErrorsSummary,
    useAdminAnalyticsMiddlewareToggle,
    useAdminAnalyticsPlatforms,
    useAdminAnalyticsProducts,
    useAdminAnalyticsTopErrors,
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
} from '@/components/admin/analytics/charts'

const PERIODS: Array<{ value: string; label: string }> = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

const ERROR_CLASSES: Array<{ value: string; label: string }> = [
    { value: '', label: 'Все' },
    { value: '5xx', label: '5xx' },
    { value: '4xx', label: '4xx' },
]

export default function AnalyticsOverviewPage() {
    const [period, setPeriod] = useState('7d')
    const [product, setProduct] = useState('')
    const [errorClass, setErrorClass] = useState('')
    const summary = useAdminAnalytics()
    const top = useAdminAnalyticsTopEvents(period, 20, product || undefined)
    const platforms = useAdminAnalyticsPlatforms(period, product || undefined)
    const products = useAdminAnalyticsProducts(period)
    const active = useAdminAnalyticsActiveUsers(period, period === '24h' ? 'hour' : 'day', product || undefined)
    const errorsSummary = useAdminAnalyticsErrorsSummary(period, product || undefined)
    const errors = useAdminAnalyticsTopErrors(period, product || undefined, errorClass || undefined)
    const toggle = useAdminAnalyticsMiddlewareToggle()
    const setToggle = useSetAnalyticsMiddlewareToggle()

    const isFetching =
        summary.isFetching ||
        top.isFetching ||
        platforms.isFetching ||
        products.isFetching ||
        active.isFetching ||
        errorsSummary.isFetching ||
        errors.isFetching ||
        toggle.isFetching
    const refreshAll = () => {
        summary.refetch()
        top.refetch()
        platforms.refetch()
        products.refetch()
        active.refetch()
        errorsSummary.refetch()
        errors.refetch()
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
                        <TopEventsChart data={top.data} />
                    )}
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
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 flex-wrap">
                    <CardTitle>Ошибки ({period})</CardTitle>
                    <div className="flex gap-2 items-center flex-wrap">
                        {ERROR_CLASSES.map(c => (
                            <Button
                                key={c.value}
                                variant={errorClass === c.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setErrorClass(c.value)}
                            >
                                {c.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errorsSummary.data && (
                        <div className="grid gap-3 md:grid-cols-4">
                            <SummaryCard title="Всего ошибок" value={errorsSummary.data.total} />
                            <SummaryCard title="Серверные (5xx)" value={errorsSummary.data.server} />
                            <SummaryCard title="Клиентские (4xx)" value={errorsSummary.data.client} />
                            <SummaryCard title="Валидация (422)" value={errorsSummary.data.validation} />
                        </div>
                    )}
                    {errors.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !errors.data || errors.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет ошибок за период</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Статус</TableHead>
                                    <TableHead>Ошибка</TableHead>
                                    <TableHead>Эндпоинт</TableHead>
                                    <TableHead className="w-20 text-right">Кол-во</TableHead>
                                    <TableHead className="w-36 text-right">Последняя</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {errors.data.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <StatusBadge status={row.status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-sm">
                                                {row.error_type ?? '—'}
                                                {row.error_code ? ` · ${row.error_code}` : ''}
                                            </div>
                                            {row.sample_message && (
                                                <div className="text-xs text-muted-foreground truncate max-w-md">
                                                    {row.sample_message}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-xs truncate max-w-[18rem]">
                                                {row.sample_path ?? '—'}
                                            </div>
                                            {row.paths > 1 && (
                                                <div className="text-xs text-muted-foreground">
                                                    +{row.paths - 1} др.
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {row.count}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {new Date(row.last_seen).toLocaleString()}
                                        </TableCell>
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

function StatusBadge({ status }: { status: string | null }) {
    const code = Number(status)
    const cls =
        !status || Number.isNaN(code)
            ? 'bg-muted text-muted-foreground'
            : code >= 500
            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
            : code === 422
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
    return (
        <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold font-mono ${cls}`}>
            {status ?? '—'}
        </span>
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
