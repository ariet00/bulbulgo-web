'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@doska/i18n'
import {
    useAdminAnalyticsAppVersions,
    useAdminAnalyticsEventAudience,
    useAdminAnalyticsEventFrequency,
    useAdminAnalyticsEventHeatmap,
    useAdminAnalyticsEventRepeat,
    useAdminAnalyticsEventSubtypes,
    useAdminAnalyticsEventSummary,
    useAdminAnalyticsEventTimeseries,
    useAdminAnalyticsEventTopUsers,
    useAdminAnalyticsPlatforms,
} from '@/hooks/queries/admin'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { EventTimeseriesChart, FrequencyBarChart } from '@/components/admin/analytics/charts-lazy'
import { EventHeatmap } from '@/components/admin/analytics/EventHeatmap'
import { ProductSelector } from '@/components/admin/ProductSelector'

const PERIODS = [
    { value: '24h', label: '24 часа' },
    { value: '7d', label: '7 дней' },
    { value: '30d', label: '30 дней' },
    { value: '90d', label: '90 дней' },
]

const GRANULARITIES = [
    { value: 'hour', label: 'По часам' },
    { value: 'day', label: 'По дням' },
    { value: 'week', label: 'По неделям' },
]

const PLATFORMS = [
    { value: '', label: 'Все' },
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'web', label: 'Web' },
    { value: 'popytka', label: 'popytka (tg)' },
    { value: 'booking', label: 'booking (tg)' },
    { value: 'akcha', label: 'akcha (tg)' },
    { value: 'staff', label: 'staff (tg)' },
]

const TOP_USERS_LIMIT = 20

function pct(part: number, total: number): string {
    if (!total) return '0%'
    return ((part / total) * 100).toFixed(1) + '%'
}

// Δ vs the previous window of the same length; null when there is no baseline.
function delta(cur: number, prev: number): { text: string; tone: 'good' | 'bad' } | null {
    if (!prev) return null
    const d = ((cur - prev) / prev) * 100
    const sign = d >= 0 ? '+' : ''
    return { text: `${sign}${d.toFixed(1)}% к пред. периоду`, tone: d >= 0 ? 'good' : 'bad' }
}

// "2 ч", "35 мин", "3.5 дн" — human-friendly gap between repeats.
function formatGap(hours: number | null | undefined): string {
    if (hours == null) return '—'
    if (hours < 1) return `${Math.round(hours * 60)} мин`
    if (hours < 48) return `${hours.toLocaleString()} ч`
    return `${(hours / 24).toFixed(1)} дн`
}

function KpiCard({
    label,
    value,
    hint,
    hintTone,
}: {
    label: string
    value: string
    hint?: string
    hintTone?: 'good' | 'bad'
}) {
    const hintCls =
        hintTone === 'good'
            ? 'text-green-600 dark:text-green-400'
            : hintTone === 'bad'
              ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground'
    return (
        <Card>
            <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 text-2xl font-semibold">{value}</div>
                {hint && <div className={`mt-1 text-xs ${hintCls}`}>{hint}</div>}
            </CardContent>
        </Card>
    )
}

export default function AnalyticsEventDetailPage() {
    const params = useParams<{ eventType: string }>()
    const eventType = decodeURIComponent(params.eventType)

    const [period, setPeriod] = useState('7d')
    const [granularity, setGranularity] = useState('day')
    const [product, setProduct] = useState('')
    const [platform, setPlatform] = useState('')
    const [subtype, setSubtype] = useState('')

    const p = product || undefined
    const pl = platform || undefined
    const st = subtype || undefined

    const summary = useAdminAnalyticsEventSummary(eventType, period, p, pl, st)
    const series = useAdminAnalyticsEventTimeseries(eventType, period, granularity, p, pl, st)
    const frequency = useAdminAnalyticsEventFrequency(eventType, period, p, pl, st)
    const topUsers = useAdminAnalyticsEventTopUsers(eventType, period, TOP_USERS_LIMIT, p, pl, st)
    const heatmap = useAdminAnalyticsEventHeatmap(eventType, period, p, pl, st)
    const audience = useAdminAnalyticsEventAudience(eventType, period, p, pl, st)
    const repeat = useAdminAnalyticsEventRepeat(eventType, period, p, pl, st)
    const platforms = useAdminAnalyticsPlatforms(period, p, eventType)
    const versions = useAdminAnalyticsAppVersions(period, p, pl, eventType)
    const subtypes = useAdminAnalyticsEventSubtypes(eventType, period)

    const s = summary.data
    const totalDelta = s ? delta(s.total, s.prev_total) : null
    const usersDelta = s ? delta(s.users, s.prev_users) : null

    const isFetching =
        summary.isFetching || series.isFetching || frequency.isFetching || topUsers.isFetching
    const refetchAll = () => {
        summary.refetch()
        series.refetch()
        frequency.refetch()
        topUsers.refetch()
        heatmap.refetch()
        audience.refetch()
        repeat.refetch()
        platforms.refetch()
        versions.refetch()
        subtypes.refetch()
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header + period */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/analytics/events"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" /> События
                    </Link>
                    <h1 className="font-mono text-2xl font-semibold">{eventType}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {PERIODS.map((pd) => (
                        <Button
                            key={pd.value}
                            variant={period === pd.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod(pd.value)}
                        >
                            {pd.label}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={refetchAll} disabled={isFetching}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <ProductSelector value={product} onChange={setProduct} />
            </div>

            <div className="flex flex-wrap gap-1">
                {PLATFORMS.map((pf) => (
                    <Button
                        key={pf.value || 'all'}
                        variant={platform === pf.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPlatform(pf.value)}
                    >
                        {pf.label}
                    </Button>
                ))}
            </div>

            {/* Подтипы — только у событий, которые их шлют (screen_viewed, auth_failed…) */}
            {(subtypes.data ?? []).length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                    <span className="mr-1 text-sm text-muted-foreground">Подтип:</span>
                    <Button
                        variant={subtype === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSubtype('')}
                    >
                        Все
                    </Button>
                    {(subtypes.data ?? []).map((r) => (
                        <Button
                            key={r.subtype}
                            variant={subtype === r.subtype ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSubtype(r.subtype)}
                        >
                            <span className="font-mono">{r.subtype}</span>
                            <span className="ml-1.5 text-xs opacity-60">{r.count}</span>
                        </Button>
                    ))}
                </div>
            )}

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <KpiCard
                    label="Всего событий"
                    value={(s?.total ?? 0).toLocaleString()}
                    hint={totalDelta?.text}
                    hintTone={totalDelta?.tone}
                />
                <KpiCard
                    label="Уникальных пользователей"
                    value={(s?.users ?? 0).toLocaleString()}
                    hint={usersDelta?.text}
                    hintTone={usersDelta?.tone}
                />
                <KpiCard
                    label="Уникальных устройств"
                    value={(s?.devices ?? 0).toLocaleString()}
                />
                <KpiCard
                    label="На пользователя"
                    value={(s?.avg_per_user ?? 0).toLocaleString()}
                    hint={`медиана: ${s?.median_per_user ?? 0}`}
                />
                <KpiCard
                    label="Анонимных"
                    value={pct(s?.anonymous ?? 0, s?.total ?? 0)}
                    hint={`${(s?.anonymous ?? 0).toLocaleString()} событий без user_id`}
                />
            </div>

            {/* Audience + repeat */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Новые vs вернувшиеся</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {audience.isLoading ? (
                            <div className="text-muted-foreground">Загрузка…</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Впервые</div>
                                        <div className="mt-1 text-2xl font-semibold">
                                            {(audience.data?.new ?? 0).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {pct(audience.data?.new ?? 0, audience.data?.active ?? 0)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Делали раньше</div>
                                        <div className="mt-1 text-2xl font-semibold">
                                            {(audience.data?.returning ?? 0).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {pct(audience.data?.returning ?? 0, audience.data?.active ?? 0)}
                                        </div>
                                    </div>
                                </div>
                                {(audience.data?.active ?? 0) > 0 && (
                                    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="bg-primary"
                                            style={{
                                                width: pct(
                                                    audience.data!.new,
                                                    audience.data!.active,
                                                ),
                                            }}
                                        />
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-muted-foreground">
                                    «Впервые» — первое событие этого типа у пользователя пришлось
                                    на выбранный период.
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Повторяемость</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {repeat.isLoading ? (
                            <div className="text-muted-foreground">Загрузка…</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Повторили за 7 дн</div>
                                        <div className="mt-1 text-2xl font-semibold">
                                            {pct(repeat.data?.repeated_7d ?? 0, repeat.data?.cohort ?? 0)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {(repeat.data?.repeated_7d ?? 0).toLocaleString()} из{' '}
                                            {(repeat.data?.cohort ?? 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Повторили за 30 дн</div>
                                        <div className="mt-1 text-2xl font-semibold">
                                            {pct(repeat.data?.repeated_30d ?? 0, repeat.data?.cohort ?? 0)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {(repeat.data?.repeated_30d ?? 0).toLocaleString()} из{' '}
                                            {(repeat.data?.cohort ?? 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Медианный интервал</div>
                                        <div className="mt-1 text-2xl font-semibold">
                                            {formatGap(repeat.data?.median_gap_hours)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            между 1-м и 2-м разом
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Когорта — пользователи, впервые совершившие событие в периоде.
                                    У недавних первых событий окно 7/30 дней ещё не истекло.
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Timeseries */}
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                    <CardTitle>События и пользователи во времени</CardTitle>
                    <div className="flex gap-1">
                        {GRANULARITIES.map((g) => (
                            <Button
                                key={g.value}
                                variant={granularity === g.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setGranularity(g.value)}
                            >
                                {g.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    {series.isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : (series.data ?? []).length === 0 ? (
                        <div className="text-muted-foreground">Нет данных за период</div>
                    ) : (
                        <EventTimeseriesChart
                            data={series.data!}
                            granularity={granularity as 'hour' | 'day' | 'week'}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Hour × day-of-week heatmap */}
            <Card>
                <CardHeader>
                    <CardTitle>Активность по часам и дням недели</CardTitle>
                </CardHeader>
                <CardContent>
                    {heatmap.isLoading ? (
                        <div className="text-muted-foreground">Загрузка…</div>
                    ) : (heatmap.data ?? []).length === 0 ? (
                        <div className="text-muted-foreground">Нет данных за период</div>
                    ) : (
                        <EventHeatmap data={heatmap.data!} />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                        Время — Asia/Bishkek. Чем темнее ячейка, тем больше событий.
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Frequency histogram */}
                <Card>
                    <CardHeader>
                        <CardTitle>Частота на пользователя</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {frequency.isLoading ? (
                            <div className="text-muted-foreground">Загрузка…</div>
                        ) : (
                            <FrequencyBarChart data={frequency.data ?? []} />
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                            Сколько пользователей совершили событие N раз за период
                            (анонимные не учитываются).
                        </p>
                    </CardContent>
                </Card>

                {/* Platforms breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>По платформам</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {platforms.isLoading ? (
                            <div className="text-muted-foreground">Загрузка…</div>
                        ) : (platforms.data ?? []).length === 0 ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (() => {
                            const totalEvents = (platforms.data ?? []).reduce((acc, r) => acc + r.events, 0)
                            return (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Платформа</TableHead>
                                        <TableHead className="w-28 text-right">События</TableHead>
                                        <TableHead className="w-32 text-right">Пользователи</TableHead>
                                        <TableHead className="w-24 text-right">Доля</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(platforms.data ?? []).map((r) => (
                                        <TableRow key={r.platform ?? 'null'}>
                                            <TableCell className="font-mono text-sm">
                                                {r.platform ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {r.events.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {r.users.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {pct(r.events, totalEvents)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            )
                        })()}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Топ пользователей</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topUsers.isLoading ? (
                            <div className="text-muted-foreground">Загрузка…</div>
                        ) : (topUsers.data ?? []).length === 0 ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Пользователь</TableHead>
                                        <TableHead className="w-24 text-right">Раз</TableHead>
                                        <TableHead className="w-40">Первый раз</TableHead>
                                        <TableHead className="w-40">Последний раз</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(topUsers.data ?? []).map((u) => (
                                        <TableRow key={u.user_id}>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/users/${u.user_id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {u.name || `#${u.user_id}`}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {u.count.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                {new Date(u.first_seen).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                {new Date(u.last_seen).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* App versions breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>По версиям приложения</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {versions.isLoading ? (
                            <div className="text-muted-foreground">Загрузка…</div>
                        ) : (versions.data ?? []).length === 0 ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Платформа</TableHead>
                                        <TableHead>Версия</TableHead>
                                        <TableHead className="w-28 text-right">События</TableHead>
                                        <TableHead className="w-32 text-right">Пользователи</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(versions.data ?? []).map((r, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-mono text-sm">
                                                {r.platform ?? '—'}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {r.app_version ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {r.events.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {r.users.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
