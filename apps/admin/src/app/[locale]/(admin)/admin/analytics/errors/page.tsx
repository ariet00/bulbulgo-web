'use client'

import { useState } from 'react'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    useAdminAnalyticsErrorsByPath,
    useAdminAnalyticsErrorsByUser,
    useAdminAnalyticsErrorsByVersion,
    useAdminAnalyticsErrorsSummary,
    useAdminAnalyticsErrorsTimeseries,
    useAdminAnalyticsErrorSignatureUsers,
    useAdminAnalyticsTopErrors,
} from '@/hooks/queries/admin'
import { ProductSelector } from '@/components/admin/ProductSelector'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { RefreshCw } from 'lucide-react'
import {
    ERROR_CLASSES,
    ErrorSignaturesTable,
    ErrorUsersTable,
    ErrorsTimeseriesChart,
} from '@/components/admin/analytics/errors-ui'
import type { AdminErrorGroup } from '@/apis/admin'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'

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
}

export default function AnalyticsErrorsPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const period = values.period
    const product = values.product
    const errorClass = values.error_class
    const [selected, setSelected] = useState<AdminErrorGroup | null>(null)

    const granularity = period === '24h' ? 'hour' : 'day'
    const prod = product || undefined
    const cls = errorClass || undefined

    const summary = useAdminAnalyticsErrorsSummary(period, prod)
    const timeseries = useAdminAnalyticsErrorsTimeseries(period, granularity, prod)
    const errors = useAdminAnalyticsTopErrors(period, prod, cls)
    const byUser = useAdminAnalyticsErrorsByUser(period, prod, cls)
    const byPath = useAdminAnalyticsErrorsByPath(period, prod, cls)
    const byVersion = useAdminAnalyticsErrorsByVersion(period, prod, cls)
    const signatureUsers = useAdminAnalyticsErrorSignatureUsers(selected, period, prod)

    const isFetching =
        summary.isFetching ||
        timeseries.isFetching ||
        errors.isFetching ||
        byUser.isFetching ||
        byPath.isFetching ||
        byVersion.isFetching
    const refreshAll = () => {
        summary.refetch()
        timeseries.refetch()
        errors.refetch()
        byUser.refetch()
        byPath.refetch()
        byVersion.refetch()
        if (selected) signatureUsers.refetch()
    }

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

            <div className="flex items-center justify-between gap-3 flex-wrap">
                <ProductSelector value={product} onChange={(v) => setValues({ product: v })} />
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
                </div>
            </div>

            {summary.data && (
                <div className="grid gap-3 md:grid-cols-5">
                    <SummaryCard title="Всего ошибок" value={summary.data.total} />
                    <SummaryCard title="Серверные (5xx)" value={summary.data.server} />
                    <SummaryCard title="Клиентские (4xx)" value={summary.data.client} />
                    <SummaryCard title="Валидация (422)" value={summary.data.validation} />
                    <SummaryCard title="Затронуто юзеров" value={summary.data.users} />
                </div>
            )}

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
                                Кликните по строке, чтобы увидеть пользователей с этой ошибкой.
                            </p>
                            <ErrorSignaturesTable
                                data={errors.data}
                                onSelect={setSelected}
                                selected={selected}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {selected && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 flex-wrap">
                        <CardTitle className="font-mono text-base">
                            Пользователи с ошибкой: {selected.error_type ?? '—'}
                            {selected.error_code ? ` · ${selected.error_code}` : ''} ({selected.status ?? '—'})
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                            Скрыть
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {signatureUsers.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !signatureUsers.data || signatureUsers.data.length === 0 ? (
                            <div className="text-muted-foreground">
                                Нет авторизованных пользователей (анонимные запросы)
                            </div>
                        ) : (
                            <ErrorUsersTable data={signatureUsers.data} />
                        )}
                    </CardContent>
                </Card>
            )}

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
                                        <TableRow key={i}>
                                            <TableCell className="font-mono text-xs truncate max-w-[22rem]">
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
                                {byVersion.data.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-mono text-sm">
                                            {row.platform ?? '—'}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {row.app_version ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {row.count}
                                        </TableCell>
                                        <TableCell className="text-right">{row.users}</TableCell>
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
