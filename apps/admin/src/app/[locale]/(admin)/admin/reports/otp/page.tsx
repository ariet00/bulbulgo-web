'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
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
} from '@doska/ui'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    adminKeys,
    useAdminOtpReportFailures,
    useAdminOtpReportPlatforms,
    useAdminOtpReportSummary,
    useAdminOtpReportTimeseries,
    useAdminOtpReportTopPhones,
} from '@/hooks/queries/admin'
import { OtpTimeseriesChart } from '@/components/admin/analytics/charts-lazy'

const PERIODS = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

const PURPOSES = [
    { value: '', label: 'Все сценарии' },
    { value: 'login', label: 'Вход по SMS' },
    { value: 'phone_verify', label: 'Привязка номера' },
]

const REASON_LABELS: Record<string, string> = {
    invalid: 'Неверный код',
    expired: 'Код истёк',
    too_many_attempts: 'Перебор попыток',
    rate_limited: 'Рейт-лимит',
    send_error: 'Ошибка отправки SMS',
}

const STAGE_LABELS: Record<string, string> = {
    request: 'отправка',
    verify: 'проверка',
}

const FILTER_DEFAULTS = { period: '7d', purpose: '' }

export default function OtpReportPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const period = values.period
    const purpose = values.purpose || undefined
    const granularity = period === '24h' ? 'hour' : 'day'

    const summary = useAdminOtpReportSummary({ period, purpose })
    const timeseries = useAdminOtpReportTimeseries({ period, purpose, granularity })
    const failures = useAdminOtpReportFailures({ period, purpose })
    const platforms = useAdminOtpReportPlatforms({ period, purpose })
    const topPhones = useAdminOtpReportTopPhones({ period, purpose, limit: 30 })

    const queryClient = useQueryClient()
    const isFetching =
        summary.isFetching || timeseries.isFetching || failures.isFetching || topPhones.isFetching
    const refreshAll = () => queryClient.invalidateQueries({ queryKey: adminKeys.reports() })

    const s = summary.data
    const conversion = s && s.requested > 0 ? (s.verified / s.requested) * 100 : undefined
    const prevConversion =
        s && s.prev_requested > 0 ? (s.prev_verified / s.prev_requested) * 100 : undefined

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Отчёт — OTP-верификация</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        SMS-коды: отправка, подтверждение, ошибки. Ошибки и номера собираются с
                        момента выката трекинга — история за прошлое неполная.
                    </p>
                </div>
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

            <div className="flex gap-2 items-center flex-wrap">
                {PURPOSES.map(p => (
                    <Button
                        key={p.value}
                        variant={values.purpose === p.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setValues({ purpose: p.value })}
                    >
                        {p.label}
                    </Button>
                ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <SummaryCard title="Отправлено SMS" value={s?.requested} prev={s?.prev_requested} />
                <SummaryCard
                    title="Подтверждено"
                    value={s?.verified}
                    prev={s?.prev_verified}
                    goodWhenUp
                />
                <SummaryCard
                    title="Конверсия"
                    value={conversion !== undefined ? Math.round(conversion) : undefined}
                    prev={prevConversion !== undefined ? Math.round(prevConversion) : undefined}
                    suffix="%"
                    goodWhenUp
                />
                <SummaryCard title="Ошибок" value={s?.failed} prev={s?.prev_failed} />
                <SummaryCard title="Юзеров запрашивало" value={s?.users} />
                <SummaryCard
                    title="SMS на один успех"
                    value={s?.avg_requests_per_success ?? undefined}
                    hint={
                        s?.avg_requests_per_success && s.avg_requests_per_success > 2
                            ? 'много повторных отправок'
                            : undefined
                    }
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Динамика ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {timeseries.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !timeseries.data || timeseries.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <OtpTimeseriesChart data={timeseries.data} granularity={granularity} />
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Причины ошибок ({period})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {failures.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !failures.data || failures.data.length === 0 ? (
                            <div className="text-muted-foreground">Ошибок за период нет</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Причина</TableHead>
                                        <TableHead>Этап</TableHead>
                                        <TableHead className="w-24 text-right">Ошибок</TableHead>
                                        <TableHead className="w-24 text-right">Юзеров</TableHead>
                                        <TableHead className="w-36">Последняя</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {failures.data.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                {row.reason
                                                    ? REASON_LABELS[row.reason] ?? row.reason
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {row.stage
                                                    ? STAGE_LABELS[row.stage] ?? row.stage
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {row.count}
                                            </TableCell>
                                            <TableCell className="text-right">{row.users}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
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
                        <CardTitle>Платформы ({period})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {platforms.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !platforms.data || platforms.data.length === 0 ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Платформа</TableHead>
                                        <TableHead className="w-28 text-right">Отправлено</TableHead>
                                        <TableHead className="w-28 text-right">Подтверждено</TableHead>
                                        <TableHead className="w-24 text-right">Ошибок</TableHead>
                                        <TableHead className="w-24 text-right">Конверсия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {platforms.data.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-mono text-sm">
                                                {row.platform ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right">{row.requested}</TableCell>
                                            <TableCell className="text-right">{row.verified}</TableCell>
                                            <TableCell className="text-right">{row.failed}</TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {row.requested > 0
                                                    ? `${Math.round((row.verified / row.requested) * 100)}%`
                                                    : '—'}
                                            </TableCell>
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
                    <CardTitle>Топ номеров по запросам ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {topPhones.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !topPhones.data || topPhones.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <>
                            <p className="mb-2 text-sm text-muted-foreground">
                                Много запросов без единого подтверждения — маркер абуза SMS-шлюза
                                (каждая отправка стоит денег).
                            </p>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Номер</TableHead>
                                        <TableHead className="w-28 text-right">Запросов</TableHead>
                                        <TableHead className="w-28 text-right">Успехов</TableHead>
                                        <TableHead className="w-24 text-right">Ошибок</TableHead>
                                        <TableHead className="w-24 text-right">Аккаунтов</TableHead>
                                        <TableHead className="w-36">Последний</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topPhones.data.map(row => (
                                        <TableRow key={row.phone}>
                                            <TableCell className="font-mono text-sm">
                                                {row.phone}
                                                {row.verified === 0 && row.requested >= 5 && (
                                                    <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                                                        подозрительный
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {row.requested}
                                            </TableCell>
                                            <TableCell className="text-right">{row.verified}</TableCell>
                                            <TableCell className="text-right">{row.failed}</TableCell>
                                            <TableCell className="text-right">{row.users}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(row.last_seen).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function SummaryCard({
    title,
    value,
    prev,
    suffix = '',
    goodWhenUp = false,
    hint,
}: {
    title: string
    value: number | undefined
    prev?: number
    suffix?: string
    goodWhenUp?: boolean
    hint?: string
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <div className="text-2xl font-semibold">
                        {value ?? '—'}
                        {value !== undefined ? suffix : ''}
                    </div>
                    <DeltaBadge value={value} prev={prev} goodWhenUp={goodWhenUp} />
                </div>
                {hint && <div className="text-xs text-amber-600 dark:text-amber-400">{hint}</div>}
            </CardContent>
        </Card>
    )
}

// Δ к окну той же длины перед периодом. Для «Подтверждено»/«Конверсия» рост —
// хорошо (goodWhenUp), для ошибок — плохо.
function DeltaBadge({
    value,
    prev,
    goodWhenUp,
}: {
    value: number | undefined
    prev: number | undefined
    goodWhenUp: boolean
}) {
    if (value === undefined || prev === undefined) return null
    if (prev === 0 && value === 0) return null
    if (prev === 0) return <span className="text-xs text-muted-foreground">новое</span>
    const pct = Math.round(((value - prev) / prev) * 100)
    if (pct === 0) return <span className="text-xs text-muted-foreground">±0%</span>
    const good = pct > 0 ? goodWhenUp : !goodWhenUp
    return (
        <span
            className={`text-xs font-medium ${
                good ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
            title={`Прошлый период: ${prev}`}
        >
            {pct > 0 ? '+' : ''}
            {pct}%
        </span>
    )
}
