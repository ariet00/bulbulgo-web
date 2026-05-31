'use client'

import { useState } from 'react'
import {
    useAdminRideshareFunnel,
    useAdminRideshareSummary,
    useAdminRideshareTopDrivers,
    useAdminRideshareTopRoutes,
    useAdminRideshareTripsByDay,
    useAdminRideshareInstallsByDay,
} from '@doska/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { Button } from '@doska/ui'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Link } from '@doska/i18n'
import { RefreshCw } from 'lucide-react'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts'

const PERIODS: Array<{ value: string; label: string }> = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

// Per-card period override. Falls back to the global period and resets itself
// (back to global) whenever the global period changes — keyed by `resetNonce`,
// which the top-level selector bumps so even re-picking the same global value
// clears every card's override.
function useCardPeriod(globalPeriod: string, resetNonce: number) {
    const [override, setOverride] = useState<string | null>(null)
    const [seenNonce, setSeenNonce] = useState(resetNonce)
    if (seenNonce !== resetNonce) {
        setSeenNonce(resetNonce)
        setOverride(null)
    }
    return [override ?? globalPeriod, setOverride, override !== null] as const
}

function PeriodPicker({
    value,
    onChange,
    overridden,
    size = 'sm',
}: {
    value: string
    onChange: (p: string | null) => void
    overridden?: boolean
    size?: 'sm' | 'default'
}) {
    return (
        <div className="flex gap-1 items-center flex-wrap">
            {PERIODS.map(p => (
                <Button
                    key={p.value}
                    variant={value === p.value ? 'default' : 'outline'}
                    size={size}
                    className={size === 'sm' ? 'h-7 px-2 text-xs' : undefined}
                    onClick={() => onChange(p.value)}
                >
                    {p.label}
                </Button>
            ))}
            {overridden && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5 text-xs text-muted-foreground"
                    onClick={() => onChange(null)}
                    title="Сбросить к общему периоду"
                >
                    ↺
                </Button>
            )}
        </div>
    )
}

export default function BulbulGoAnalyticsPage() {
    const [period, setPeriod] = useState('24h')
    const [resetNonce, setResetNonce] = useState(0)
    // Picking a global period also resets every card's override (via the nonce).
    const selectGlobal = (p: string) => {
        setPeriod(p)
        setResetNonce(n => n + 1)
    }

    // Per-card effective period (override ?? global) + its setter + overridden flag.
    const [summaryP, setSummaryP, summaryOver] = useCardPeriod(period, resetNonce)
    const [tripsP, setTripsP, tripsOver] = useCardPeriod(period, resetNonce)
    const [installsP, setInstallsP, installsOver] = useCardPeriod(period, resetNonce)
    const [funnelP, setFunnelP, funnelOver] = useCardPeriod(period, resetNonce)
    const [topTripsP, setTopTripsP, topTripsOver] = useCardPeriod(period, resetNonce)
    const [topPhoneP, setTopPhoneP, topPhoneOver] = useCardPeriod(period, resetNonce)
    const [topAdsP, setTopAdsP, topAdsOver] = useCardPeriod(period, resetNonce)
    const [routesP, setRoutesP, routesOver] = useCardPeriod(period, resetNonce)

    const funnel = useAdminRideshareFunnel(funnelP)
    const summary = useAdminRideshareSummary(summaryP)
    const tripsByDay = useAdminRideshareTripsByDay(tripsP)
    const installsByDay = useAdminRideshareInstallsByDay(installsP)
    const topByTrips = useAdminRideshareTopDrivers(topTripsP, 20, 'trips_created')
    const topByPhone = useAdminRideshareTopDrivers(topPhoneP, 20, 'phone_views')
    const topByAds = useAdminRideshareTopDrivers(topAdsP, 20, 'trip_views')
    const topRoutes = useAdminRideshareTopRoutes(routesP, 20)

    const isFetching =
        funnel.isFetching ||
        summary.isFetching ||
        tripsByDay.isFetching ||
        installsByDay.isFetching ||
        topByTrips.isFetching ||
        topByPhone.isFetching ||
        topByAds.isFetching ||
        topRoutes.isFetching
    const refetchAll = () => {
        funnel.refetch()
        summary.refetch()
        tripsByDay.refetch()
        installsByDay.refetch()
        topByTrips.refetch()
        topByPhone.refetch()
        topByAds.refetch()
        topRoutes.refetch()
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">BulBul Go — аналитика</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Rideshare, такси, маршрутки, автобусы, грузовые
                    </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-sm text-muted-foreground mr-1">
                        Общий период:
                    </span>
                    {PERIODS.map(p => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => selectGlobal(p.value)}
                        >
                            {p.label}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refetchAll}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Сводка ({summaryP})
                    </h2>
                    <PeriodPicker value={summaryP} onChange={setSummaryP} overridden={summaryOver} />
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Активных поездок"
                        value={summary.data?.active_now}
                        loading={summary.isLoading}
                        hint={
                            summary.data && summary.data.active_by_type.length > 0
                                ? summary.data.active_by_type
                                      .map(t => `${t.trip_type ?? '—'}: ${t.count}`)
                                      .join(' · ')
                                : 'без разбивки'
                        }
                    />
                    <StatCard
                        title={`Создано за ${summaryP}`}
                        value={summary.data?.created_in_period}
                        loading={summary.isLoading}
                    />
                    <StatCard
                        title={`Завершено за ${summaryP}`}
                        value={summary.data?.completed_in_period}
                        loading={summary.isLoading}
                        hint={
                            summary.data && summary.data.cancelled_in_period > 0
                                ? `отменено: ${summary.data.cancelled_in_period}`
                                : undefined
                        }
                    />
                    <StatCard
                        title="Completion rate"
                        value={
                            summary.data
                                ? `${(summary.data.completion_rate * 100).toFixed(1)}%`
                                : undefined
                        }
                        loading={summary.isLoading}
                        hint="completed / created в периоде"
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle>Поездки по дням ({tripsP})</CardTitle>
                    <PeriodPicker value={tripsP} onChange={setTripsP} overridden={tripsOver} />
                </CardHeader>
                <CardContent>
                    {tripsByDay.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !tripsByDay.data || tripsByDay.data.days.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <DailyStackedBarChart
                            data={[...tripsByDay.data.days].reverse()}
                            eventTypes={tripsByDay.data.trip_types}
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle>Установки и регистрации по дням ({installsP})</CardTitle>
                    <PeriodPicker value={installsP} onChange={setInstallsP} overridden={installsOver} />
                </CardHeader>
                <CardContent>
                    {installsByDay.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !installsByDay.data || installsByDay.data.days.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <DailyStackedBarChart
                            data={[...installsByDay.data.days].reverse()}
                            eventTypes={installsByDay.data.event_types}
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle>Воронка ({funnelP})</CardTitle>
                    <PeriodPicker value={funnelP} onChange={setFunnelP} overridden={funnelOver} />
                </CardHeader>
                <CardContent>
                    {funnel.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !funnel.data || funnel.data.steps.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <FunnelView steps={funnel.data.steps} />
                    )}
                </CardContent>
            </Card>

            <TopDriversCard
                title="Топ по созданию поездок"
                variant="trips"
                query={topByTrips}
                period={topTripsP}
                onPeriodChange={setTopTripsP}
                overridden={topTripsOver}
            />
            <TopDriversCard
                title="Топ по просмотрам номера"
                variant="phone"
                query={topByPhone}
                period={topPhoneP}
                onPeriodChange={setTopPhoneP}
                overridden={topPhoneOver}
            />
            <TopDriversCard
                title="Топ по просмотрам объявлений"
                variant="ads"
                query={topByAds}
                period={topAdsP}
                onPeriodChange={setTopAdsP}
                overridden={topAdsOver}
            />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle>Топ маршрутов ({routesP})</CardTitle>
                    <PeriodPicker value={routesP} onChange={setRoutesP} overridden={routesOver} />
                </CardHeader>
                <CardContent>
                    {topRoutes.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !topRoutes.data || topRoutes.data.routes.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Откуда</TableHead>
                                    <TableHead>Куда</TableHead>
                                    <TableHead className="w-24 text-right">Поездки</TableHead>
                                    <TableHead className="w-28 text-right">Завершено</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topRoutes.data.routes.map((r, i) => (
                                    <TableRow key={`${r.from_id}-${r.to_id}`}>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>{r.from_name ?? `#${r.from_id}`}</TableCell>
                                        <TableCell>{r.to_name ?? `#${r.to_id}`}</TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {r.trips}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {r.completed}
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

type TopDriverRow = NonNullable<
    ReturnType<typeof useAdminRideshareTopDrivers>['data']
>['drivers'][number]
type TopDriversQuery = ReturnType<typeof useAdminRideshareTopDrivers>
type TopVariant = 'trips' | 'phone' | 'ads'

function UserCell({ d }: { d: TopDriverRow }) {
    return (
        <Link
            href={`/admin/analytics/users/${d.user_id}`}
            className="flex items-center gap-2 hover:underline"
        >
            {d.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={d.avatar_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover bg-muted"
                />
            ) : (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    {(d.name ?? '?').slice(0, 1).toUpperCase()}
                </div>
            )}
            <span>{d.name ?? `user #${d.user_id}`}</span>
        </Link>
    )
}

function TopDriversCard({
    title,
    variant,
    query,
    period,
    onPeriodChange,
    overridden,
}: {
    title: string
    variant: TopVariant
    query: TopDriversQuery
    period: string
    onPeriodChange: (p: string | null) => void
    overridden?: boolean
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle>
                    {title} ({period})
                </CardTitle>
                <PeriodPicker value={period} onChange={onPeriodChange} overridden={overridden} />
            </CardHeader>
            <CardContent>
                {query.isLoading ? (
                    <div>Загрузка…</div>
                ) : !query.data || query.data.drivers.length === 0 ? (
                    <div className="text-muted-foreground">Нет данных</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Пользователь</TableHead>
                                <TableHead>Телефон</TableHead>
                                {variant === 'trips' && (
                                    <>
                                        <TableHead className="w-24 text-right font-semibold">
                                            Поездки
                                        </TableHead>
                                        <TableHead
                                            className="w-20 text-right"
                                            title="Водительские объявления"
                                        >
                                            Водит.
                                        </TableHead>
                                        <TableHead
                                            className="w-20 text-right"
                                            title="Пассажирские объявления"
                                        >
                                            Пасс.
                                        </TableHead>
                                        <TableHead className="w-24 text-right">Завершено</TableHead>
                                        <TableHead className="w-16 text-right">%</TableHead>
                                    </>
                                )}
                                {variant === 'phone' && (
                                    <>
                                        <TableHead className="w-36 text-right font-semibold">
                                            Просмотров номера
                                        </TableHead>
                                        <TableHead
                                            className="w-20 text-right"
                                            title="Просмотры номеров в водительских объявлениях"
                                        >
                                            Водит.
                                        </TableHead>
                                        <TableHead
                                            className="w-20 text-right"
                                            title="Просмотры номеров в пассажирских объявлениях"
                                        >
                                            Пасс.
                                        </TableHead>
                                        <TableHead
                                            className="w-28 text-right"
                                            title="Просмотры в первые 10 минут после обновления"
                                        >
                                            из них fast
                                        </TableHead>
                                    </>
                                )}
                                {variant === 'ads' && (
                                    <>
                                        <TableHead className="w-36 text-right font-semibold">
                                            Просмотров объявлений
                                        </TableHead>
                                        <TableHead
                                            className="w-20 text-right"
                                            title="Просмотры водительских объявлений"
                                        >
                                            Водит.
                                        </TableHead>
                                        <TableHead
                                            className="w-20 text-right"
                                            title="Просмотры пассажирских объявлений"
                                        >
                                            Пасс.
                                        </TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {query.data.drivers.map((d: TopDriverRow, i: number) => {
                                const completionPct =
                                    d.trips > 0 ? (d.completed / d.trips) * 100 : 0
                                return (
                                    <TableRow key={d.user_id}>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>
                                            <UserCell d={d} />
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {d.phone ?? '—'}
                                        </TableCell>
                                        {variant === 'trips' && (
                                            <>
                                                <TableCell className="text-right tabular-nums font-semibold">
                                                    {d.trips}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {d.trips_driver}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {d.trips_passenger}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {d.completed}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right tabular-nums ${
                                                        completionPct >= 70
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : completionPct >= 40
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}
                                                >
                                                    {d.trips > 0 ? `${completionPct.toFixed(0)}%` : '—'}
                                                </TableCell>
                                            </>
                                        )}
                                        {variant === 'phone' && (
                                            <>
                                                <TableCell className="text-right tabular-nums font-semibold">
                                                    {d.phone_views_made}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {d.phone_views_made_driver}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {d.phone_views_made_passenger}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {d.phone_views_fast_made}
                                                </TableCell>
                                            </>
                                        )}
                                        {variant === 'ads' && (
                                            <>
                                                <TableCell className="text-right tabular-nums font-semibold">
                                                    {d.trip_views_made}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {d.trip_views_made_driver}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {d.trip_views_made_passenger}
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}

function StatCard({
    title,
    value,
    loading,
    hint,
}: {
    title: string
    value: number | string | undefined
    loading?: boolean
    hint?: string
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                    {loading
                        ? '…'
                        : value === undefined || value === null
                        ? '—'
                        : typeof value === 'number'
                        ? value.toLocaleString()
                        : value}
                </div>
                {hint && (
                    <div className="text-xs text-muted-foreground mt-1 truncate" title={hint}>
                        {hint}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

type Step = {
    key: string
    label: string
    event_type: string
    events: number
    users: number
}

function FunnelView({ steps }: { steps: Step[] }) {
    const top = steps[0]?.users ?? 0

    return (
        <div className="space-y-3">
            {steps.map((step, i) => {
                const prev = i > 0 ? steps[i - 1] : undefined
                const fromTopPct = top > 0 ? (step.users / top) * 100 : 0
                const fromPrevPct =
                    prev && prev.users > 0 ? (step.users / prev.users) * 100 : null

                return (
                    <div key={step.key} className="space-y-1">
                        <div className="flex items-baseline justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground tabular-nums w-6 text-right">
                                    {i + 1}.
                                </span>
                                <span className="font-medium">{step.label}</span>
                                <code className="text-xs text-muted-foreground">
                                    {step.event_type}
                                </code>
                            </div>
                            <div className="flex items-center gap-4 tabular-nums">
                                <span>
                                    <strong>{step.users.toLocaleString()}</strong>{' '}
                                    <span className="text-muted-foreground">польз.</span>
                                </span>
                                <span className="text-muted-foreground">
                                    {step.events.toLocaleString()} событий
                                </span>
                                {fromPrevPct !== null && (
                                    <span
                                        className={
                                            fromPrevPct >= 50
                                                ? 'text-green-600 dark:text-green-400'
                                                : fromPrevPct >= 20
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }
                                    >
                                        {fromPrevPct.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="h-8 rounded bg-muted/40 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
                                style={{ width: `${Math.max(fromTopPct, 0.5)}%` }}
                            />
                        </div>
                    </div>
                )
            })}

            {top > 0 && (
                <div className="text-sm text-muted-foreground pt-2 border-t">
                    Конверсия от поиска до завершения:{' '}
                    <strong className="text-foreground">
                        {((steps[steps.length - 1].users / top) * 100).toFixed(2)}%
                    </strong>
                </div>
            )}
        </div>
    )
}
