'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    adminKeys,
    useAdminAnalyticsAppErrorsByVersion,
    useAdminAnalyticsAppErrorsSummary,
    useAdminAnalyticsErrorsByPath,
    useAdminAnalyticsErrorsByUser,
    useAdminAnalyticsErrorsByVersion,
    useAdminAnalyticsErrorsSummary,
    useAdminAnalyticsErrorsTimeseries,
    useAdminAnalyticsTopAppErrors,
    useAdminAnalyticsTopErrors,
} from '@/hooks/queries/admin'
import { ProductSelector } from '@/components/admin/ProductSelector'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@doska/ui'
import { RefreshCw, X } from 'lucide-react'
import {
    APP_ERROR_TYPES,
    AppErrorSignaturesTable,
    ERROR_CLASSES,
    ErrorSignaturesTable,
    ErrorUsersTable,
} from '@/components/admin/analytics/errors-ui'
import {
    ApiErrorDrilldown,
    AppErrorDrilldown,
} from '@/components/admin/analytics/errors-drilldown'
import { ErrorsTimeseriesChart } from '@/components/admin/analytics/charts-lazy'
import type { AdminAppErrorGroup, AdminErrorGroup } from '@/apis/admin'

const PERIODS: Array<{ value: string; label: string }> = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

const FILTER_DEFAULTS = {
    period: '7d',
    product: '',
    error_class: '',
    tab: 'api',
    app_type: '',
    app_fatal: false,
    path: '',
}

export default function AnalyticsErrorsPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const period = values.period
    const product = values.product
    const errorClass = values.error_class
    const pathFilter = values.path
    const [selectedApi, setSelectedApi] = useState<AdminErrorGroup | null>(null)
    const [selectedApp, setSelectedApp] = useState<AdminAppErrorGroup | null>(null)

    const granularity = period === '24h' ? 'hour' : 'day'
    const prod = product || undefined
    const cls = errorClass || undefined
    const appType = values.app_type || undefined
    const appFatal = values.app_fatal || undefined

    const summary = useAdminAnalyticsErrorsSummary(period, prod)
    const appSummary = useAdminAnalyticsAppErrorsSummary(period, prod)
    const timeseries = useAdminAnalyticsErrorsTimeseries(period, granularity, prod)
    const errors = useAdminAnalyticsTopErrors(period, prod, cls, undefined, 30, pathFilter || undefined)
    const byUser = useAdminAnalyticsErrorsByUser(period, prod, cls)
    const byPath = useAdminAnalyticsErrorsByPath(period, prod, cls)
    const byVersion = useAdminAnalyticsErrorsByVersion(period, prod, cls)
    const appErrors = useAdminAnalyticsTopAppErrors(period, prod, appType, appFatal)
    const appByVersion = useAdminAnalyticsAppErrorsByVersion(period, prod, appType, appFatal)

    const queryClient = useQueryClient()
    const isFetching =
        summary.isFetching ||
        appSummary.isFetching ||
        timeseries.isFetching ||
        errors.isFetching ||
        appErrors.isFetching
    const refreshAll = () =>
        queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">Аналитика — ошибки</h1>
                <div className="flex gap-2 items-center flex-wrap">
                    {PERIODS.map(p => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setValues({ period: p.value })}
                        >
                            {p.label}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={refreshAll} disabled={isFetching}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            <ProductSelector value={product} onChange={v => setValues({ product: v })} />

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <SummaryCard
                    title="Всего (API)"
                    value={summary.data?.total}
                    prev={summary.data?.prev_total}
                />
                <SummaryCard
                    title="Серверные (5xx)"
                    value={summary.data?.server}
                    prev={summary.data?.prev_server}
                />
                <SummaryCard
                    title="Клиентские (4xx)"
                    value={summary.data?.client}
                    prev={summary.data?.prev_client}
                />
                <SummaryCard
                    title="Валидация (422)"
                    value={summary.data?.validation}
                    prev={summary.data?.prev_validation}
                />
                <SummaryCard
                    title="Приложение"
                    value={appSummary.data?.total}
                    prev={appSummary.data?.prev_total}
                    hint={
                        appSummary.data && appSummary.data.fatal > 0
                            ? `fatal: ${appSummary.data.fatal}`
                            : undefined
                    }
                />
                <SummaryCard
                    title="Затронуто юзеров"
                    value={summary.data?.users}
                    prev={summary.data?.prev_users}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Динамика ошибок ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {timeseries.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !timeseries.data || timeseries.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <ErrorsTimeseriesChart data={timeseries.data} granularity={granularity} />
                    )}
                </CardContent>
            </Card>

            <Tabs value={values.tab} onValueChange={v => setValues({ tab: v })}>
                <TabsList>
                    <TabsTrigger value="api">API (бэкенд)</TabsTrigger>
                    <TabsTrigger value="app">Приложение (клиент)</TabsTrigger>
                </TabsList>

                <TabsContent value="api" className="space-y-6 mt-4">
                    <div className="flex gap-2 items-center flex-wrap">
                        {ERROR_CLASSES.map(c => (
                            <Button
                                key={c.value}
                                variant={errorClass === c.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setValues({ error_class: c.value })}
                            >
                                {c.label}
                            </Button>
                        ))}
                        {pathFilter && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="font-mono text-xs"
                                onClick={() => setValues({ path: '' })}
                            >
                                {pathFilter}
                                <X className="ml-1 h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Топ ошибок ({period})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {errors.isLoading ? (
                                <div>Загрузка…</div>
                            ) : !errors.data || errors.data.length === 0 ? (
                                <div className="text-muted-foreground">Нет ошибок за период</div>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Кликните по строке — события, стектрейс, разбивки и пользователи.
                                    </p>
                                    <ErrorSignaturesTable
                                        data={errors.data}
                                        onSelect={setSelectedApi}
                                        selected={selectedApi}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>У кого частые ошибки ({period})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {byUser.isLoading ? (
                                    <div>Загрузка…</div>
                                ) : !byUser.data || byUser.data.length === 0 ? (
                                    <div className="text-muted-foreground">Нет данных</div>
                                ) : (
                                    <ErrorUsersTable data={byUser.data} />
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Падающие эндпоинты ({period})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {byPath.isLoading ? (
                                    <div>Загрузка…</div>
                                ) : !byPath.data || byPath.data.length === 0 ? (
                                    <div className="text-muted-foreground">Нет данных</div>
                                ) : (
                                    <>
                                        <p className="mb-2 text-xs text-muted-foreground">
                                            Клик по строке фильтрует топ ошибок по эндпоинту.
                                        </p>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Эндпоинт</TableHead>
                                                    <TableHead className="w-24 text-right">Ошибок</TableHead>
                                                    <TableHead className="w-24 text-right">Юзеров</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {byPath.data.map((row, i) => (
                                                    <TableRow
                                                        key={i}
                                                        className={`cursor-pointer ${
                                                            pathFilter === row.path ? 'bg-muted' : ''
                                                        }`}
                                                        onClick={() =>
                                                            setValues({
                                                                path:
                                                                    pathFilter === row.path
                                                                        ? ''
                                                                        : row.path ?? '',
                                                            })
                                                        }
                                                    >
                                                        <TableCell className="font-mono text-xs truncate max-w-[22rem]">
                                                            <span className="font-semibold">
                                                                {row.method ?? ''}
                                                            </span>{' '}
                                                            {row.path ?? '—'}
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold">
                                                            {row.count}
                                                        </TableCell>
                                                        <TableCell className="text-right">{row.users}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ошибки по версиям приложения ({period})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {byVersion.isLoading ? (
                                <div>Загрузка…</div>
                            ) : !byVersion.data || byVersion.data.length === 0 ? (
                                <div className="text-muted-foreground">Нет данных</div>
                            ) : (
                                <VersionsTable data={byVersion.data} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="app" className="space-y-6 mt-4">
                    <div className="flex gap-2 items-center flex-wrap">
                        {APP_ERROR_TYPES.map(t => (
                            <Button
                                key={t.value}
                                variant={values.app_type === t.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setValues({ app_type: t.value })}
                            >
                                {t.label}
                            </Button>
                        ))}
                        <Button
                            variant={values.app_fatal ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setValues({ app_fatal: !values.app_fatal })}
                        >
                            Только fatal
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Топ ошибок приложения ({period})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {appErrors.isLoading ? (
                                <div>Загрузка…</div>
                            ) : !appErrors.data || appErrors.data.length === 0 ? (
                                <div className="text-muted-foreground">Нет ошибок за период</div>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Счётчики занижены: клиент дедуплицирует повторы в рамках сессии —
                                        смотрите на юзеров/девайсы. Клик по строке — события со стектрейсом.
                                    </p>
                                    <AppErrorSignaturesTable
                                        data={appErrors.data}
                                        onSelect={setSelectedApp}
                                        selected={selectedApp}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ошибки приложения по версиям ({period})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {appByVersion.isLoading ? (
                                <div>Загрузка…</div>
                            ) : !appByVersion.data || appByVersion.data.length === 0 ? (
                                <div className="text-muted-foreground">Нет данных</div>
                            ) : (
                                <VersionsTable data={appByVersion.data} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ApiErrorDrilldown
                signature={selectedApi}
                period={period}
                granularity={granularity}
                product={prod}
                onClose={() => setSelectedApi(null)}
            />
            <AppErrorDrilldown
                signature={selectedApp}
                period={period}
                product={prod}
                onClose={() => setSelectedApp(null)}
            />
        </div>
    )
}

function SummaryCard({
    title,
    value,
    prev,
    hint,
}: {
    title: string
    value: number | undefined
    prev: number | undefined
    hint?: string
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <div className="text-2xl font-semibold">{value ?? '—'}</div>
                    <DeltaBadge value={value} prev={prev} />
                </div>
                {hint && <div className="text-xs text-red-600 dark:text-red-400">{hint}</div>}
            </CardContent>
        </Card>
    )
}

// vs the same-length window right before the period. For errors, growth is bad.
function DeltaBadge({ value, prev }: { value: number | undefined; prev: number | undefined }) {
    if (value === undefined || prev === undefined) return null
    if (prev === 0 && value === 0) return null
    if (prev === 0) {
        return <span className="text-xs font-medium text-red-600 dark:text-red-400">новое</span>
    }
    const pct = Math.round(((value - prev) / prev) * 100)
    if (pct === 0) return <span className="text-xs text-muted-foreground">±0%</span>
    const worse = pct > 0
    return (
        <span
            className={`text-xs font-medium ${
                worse ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}
            title={`Прошлый период: ${prev}`}
        >
            {worse ? '+' : ''}
            {pct}%
        </span>
    )
}

function VersionsTable({
    data,
}: {
    data: Array<{
        platform: string | null
        app_version: string | null
        count: number
        users: number
    }>
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Платформа</TableHead>
                    <TableHead>Версия</TableHead>
                    <TableHead className="w-24 text-right">Ошибок</TableHead>
                    <TableHead className="w-24 text-right">Юзеров</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-mono text-sm">{row.platform ?? '—'}</TableCell>
                        <TableCell className="font-mono text-sm">{row.app_version ?? '—'}</TableCell>
                        <TableCell className="text-right font-semibold">{row.count}</TableCell>
                        <TableCell className="text-right">{row.users}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
