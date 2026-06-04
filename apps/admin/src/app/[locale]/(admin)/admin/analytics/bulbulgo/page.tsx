'use client'

import { useState, type ReactNode } from 'react'
import {
    useAdminRideshareFunnel,
    useAdminRideshareSummary,
    useAdminRideshareTopDrivers,
    useAdminRideshareTopActiveUsers,
    useAdminRideshareTopRoutes,
    useAdminRideshareTripsByDay,
    useAdminRideshareInstallsByDay,
    useAdminRideshareLimitedDrivers,
} from '@/hooks/queries/admin'
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
import { Pagination } from '@doska/ui'
import { Input } from '@doska/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@doska/ui'
import { Link } from '@doska/i18n'
import { RefreshCw, Pencil } from 'lucide-react'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts'
import {
    useSetDriverCredits,
    useSetDriverFreeUsed,
    useSetDriverLimited,
} from '@/hooks/mutations/admin'

const LIMITED_SIZE = 20

const PERIODS: Array<{ value: string; label: string }> = [
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

// Russian labels for the driver/passenger role dimension.
const ROLE_LABELS: Record<string, string> = {
    driver: 'водители',
    passenger: 'пассажиры',
    unknown: '—',
}
const roleLabel = (role: string | null) => (role ? ROLE_LABELS[role] ?? role : '—')

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
    const [topActiveP, setTopActiveP, topActiveOver] = useCardPeriod(period, resetNonce)
    const [routesP, setRoutesP, routesOver] = useCardPeriod(period, resetNonce)

    const funnel = useAdminRideshareFunnel(funnelP)
    const summary = useAdminRideshareSummary(summaryP)
    // Same period, two stackings shown side by side: by trip type and by role.
    const tripsByType = useAdminRideshareTripsByDay(tripsP, 'type')
    const tripsByRole = useAdminRideshareTripsByDay(tripsP, 'role')
    const installsByDay = useAdminRideshareInstallsByDay(installsP)
    const topByTrips = useAdminRideshareTopDrivers(topTripsP, 20, 'trips_created')
    const topByPhone = useAdminRideshareTopDrivers(topPhoneP, 20, 'phone_views')
    const topByAds = useAdminRideshareTopDrivers(topAdsP, 20, 'trip_views')
    const topActive = useAdminRideshareTopActiveUsers(topActiveP, 20)
    const topRoutes = useAdminRideshareTopRoutes(routesP, 20)
    const [limitedPage, setLimitedPage] = useState(1)
    const limitedDrivers = useAdminRideshareLimitedDrivers(limitedPage, LIMITED_SIZE)

    const isFetching =
        funnel.isFetching ||
        summary.isFetching ||
        tripsByType.isFetching ||
        tripsByRole.isFetching ||
        installsByDay.isFetching ||
        topByTrips.isFetching ||
        topByPhone.isFetching ||
        topByAds.isFetching ||
        topActive.isFetching ||
        topRoutes.isFetching ||
        limitedDrivers.isFetching
    const refetchAll = () => {
        funnel.refetch()
        summary.refetch()
        tripsByType.refetch()
        tripsByRole.refetch()
        installsByDay.refetch()
        topByTrips.refetch()
        topByPhone.refetch()
        topByAds.refetch()
        topActive.refetch()
        topRoutes.refetch()
        limitedDrivers.refetch()
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
                            summary.data
                                ? [
                                      summary.data.active_by_type.length > 0
                                          ? `тип — ${summary.data.active_by_type
                                                .map(t => `${t.trip_type ?? '—'}: ${t.count}`)
                                                .join(' · ')}`
                                          : 'тип — без разбивки',
                                      summary.data.active_by_role.length > 0
                                          ? `роль — ${summary.data.active_by_role
                                                .map(r => `${roleLabel(r.role)}: ${r.count}`)
                                                .join(' · ')}`
                                          : 'роль — без разбивки',
                                  ]
                                : undefined
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
                <CardContent className="grid gap-6 lg:grid-cols-2">
                    <TripsByDayBlock title="По типам" query={tripsByType} />
                    <TripsByDayBlock
                        title="По ролям"
                        query={tripsByRole}
                        seriesLabels={ROLE_LABELS}
                    />
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
                            granularity={installsByDay.data.granularity}
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
                    <CardTitle>Топ активных пользователей ({topActiveP})</CardTitle>
                    <PeriodPicker
                        value={topActiveP}
                        onChange={setTopActiveP}
                        overridden={topActiveOver}
                    />
                </CardHeader>
                <CardContent>
                    {topActive.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !topActive.data || topActive.data.users.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead>Телефон</TableHead>
                                    <TableHead className="w-32 text-right font-semibold">
                                        Событий
                                    </TableHead>
                                    <TableHead
                                        className="w-28 text-right"
                                        title="Дней с хотя бы одним событием в периоде"
                                    >
                                        Активных дней
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topActive.data.users.map((u, i) => (
                                    <TableRow key={u.user_id}>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/admin/analytics/users/${u.user_id}`}
                                                className="flex items-center gap-2 hover:underline"
                                            >
                                                {u.avatar_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={u.avatar_url}
                                                        alt=""
                                                        className="w-7 h-7 rounded-full object-cover bg-muted"
                                                    />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                        {(u.name ?? '?').slice(0, 1).toUpperCase()}
                                                    </div>
                                                )}
                                                <span>{u.name ?? `user #${u.user_id}`}</span>
                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    #{u.user_id}
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {u.phone ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums font-semibold">
                                            {u.events.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                            {u.active_days}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

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

            <LimitedDriversCard
                query={limitedDrivers}
                page={limitedPage}
                size={LIMITED_SIZE}
                onPageChange={setLimitedPage}
            />
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
            <span className="text-xs text-muted-foreground tabular-nums">
                #{d.user_id}
            </span>
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

type LimitedDriversQuery = ReturnType<typeof useAdminRideshareLimitedDrivers>
type LimitedDriverRow = NonNullable<LimitedDriversQuery['data']>['drivers'][number]

// Inline editor for a numeric limit value (credits / free-used) with a "set"
// (absolute) and "+/−" (delta) mode, plus an optional quick-reset button.
function AdjustPopover({
    title,
    current,
    display,
    pending,
    onSubmit,
    quickResetTo,
    quickResetLabel,
}: {
    title: string
    current: number
    display: ReactNode
    pending: boolean
    onSubmit: (mode: 'set' | 'delta', value: number) => void
    quickResetTo?: number
    quickResetLabel?: string
}) {
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<'set' | 'delta'>('set')
    const [val, setVal] = useState('')

    const handleOpenChange = (o: boolean) => {
        setOpen(o)
        if (o) {
            setMode('set')
            setVal(String(current))
        }
    }

    const submit = () => {
        const n = Number(val)
        if (!Number.isFinite(n) || val === '') return
        onSubmit(mode, Math.trunc(n))
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 tabular-nums hover:underline"
                >
                    {display}
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 space-y-3" align="end">
                <div className="text-sm font-medium">{title}</div>
                <div className="flex gap-1">
                    <Button
                        type="button"
                        size="sm"
                        variant={mode === 'set' ? 'default' : 'outline'}
                        className="h-7 flex-1 text-xs"
                        onClick={() => {
                            setMode('set')
                            setVal(String(current))
                        }}
                    >
                        Точно
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={mode === 'delta' ? 'default' : 'outline'}
                        className="h-7 flex-1 text-xs"
                        onClick={() => {
                            setMode('delta')
                            setVal('')
                        }}
                    >
                        +/−
                    </Button>
                </div>
                <Input
                    type="number"
                    autoFocus
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') submit()
                    }}
                    placeholder={mode === 'delta' ? 'напр. -5 или 10' : 'значение'}
                />
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        className="flex-1"
                        disabled={pending || val === ''}
                        onClick={submit}
                    >
                        Сохранить
                    </Button>
                    {quickResetTo !== undefined && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() => {
                                onSubmit('set', quickResetTo)
                                setOpen(false)
                            }}
                        >
                            {quickResetLabel ?? 'Сброс'}
                        </Button>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">Текущее: {current}</p>
            </PopoverContent>
        </Popover>
    )
}

// Status cell: shows the *effective* limited state (cached day-flag ?? live
// compute) and lets an admin force/clear today's flag — the gate the live
// limiter reads.
function StatusCell({
    d,
    pending,
    onSet,
}: {
    d: LimitedDriverRow
    pending: boolean
    onSet: (value: number | null) => void
}) {
    const [open, setOpen] = useState(false)
    const effective = d.limit_override ?? d.is_limited
    const forced = d.limit_override !== null
    const diverges = forced && d.limit_override !== d.is_limited

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button" className="inline-flex items-center gap-1">
                    {effective ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                            под лимитом
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            без лимита
                        </span>
                    )}
                    {forced && (
                        <span
                            className="text-xs"
                            title={`Ручная фиксация${
                                diverges
                                    ? ` · расчёт: ${d.is_limited ? 'под лимитом' : 'без лимита'}`
                                    : ''
                            }`}
                        >
                            📌
                        </span>
                    )}
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 space-y-2" align="start">
                <div className="text-xs text-muted-foreground">
                    Расчёт: {d.is_limited ? 'под лимитом' : 'без лимита'} ({d.window_views} просм.
                    / {d.active_days} дн.)
                    {forced && (
                        <div className="mt-0.5">
                            Зафиксировано: {d.limit_override ? 'под лимитом' : 'без лимита'}
                        </div>
                    )}
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    disabled={pending}
                    onClick={() => {
                        onSet(1)
                        setOpen(false)
                    }}
                >
                    Всегда под лимитом
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    disabled={pending}
                    onClick={() => {
                        onSet(0)
                        setOpen(false)
                    }}
                >
                    Без лимита
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    disabled={pending}
                    onClick={() => {
                        onSet(null)
                        setOpen(false)
                    }}
                >
                    Авто (сбросить)
                </Button>
            </PopoverContent>
        </Popover>
    )
}

function LimitedDriversCard({
    query,
    page,
    size,
    onPageChange,
}: {
    query: LimitedDriversQuery
    page: number
    size: number
    onPageChange: (p: number) => void
}) {
    const cfg = query.data?.config
    const drivers = query.data?.drivers ?? []
    const total = query.data?.total ?? 0

    const creditsM = useSetDriverCredits()
    const freeM = useSetDriverFreeUsed()
    const limitedM = useSetDriverLimited()

    return (
        <Card>
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>Под лимитами просмотра номеров ({total})</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => query.refetch()}
                        disabled={query.isFetching}
                    >
                        <RefreshCw
                            className={`mr-1 h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`}
                        />
                        Обновить
                    </Button>
                </div>
                {cfg && (
                    <p className="text-xs text-muted-foreground">
                        {cfg.enabled ? 'Лимиты включены' : 'Лимиты выключены'} · окно{' '}
                        {cfg.activity_window_days}д · порог: ≥{cfg.activity_min_views} просмотров
                        на ≥{cfg.activity_min_active_days} днях · free/день{' '}
                        {cfg.free_daily_limit} · fast ×{cfg.fast_cost}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {query.isLoading ? (
                    <div>Загрузка…</div>
                ) : drivers.length === 0 ? (
                    <div className="text-muted-foreground">Нет данных</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Пользователь</TableHead>
                                <TableHead>Телефон</TableHead>
                                <TableHead className="w-28 text-right" title="Просмотры пассажирских объявлений в окне активности">
                                    Просмотров
                                </TableHead>
                                <TableHead className="w-28 text-right">Активных дней</TableHead>
                                <TableHead className="w-32">Статус</TableHead>
                                <TableHead className="w-32 text-right" title="Использовано free-лимита сегодня">
                                    Free сегодня
                                </TableHead>
                                <TableHead className="w-28 text-right" title="Купленные лимиты (carry-over)">
                                    Куплено
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drivers.map((d: LimitedDriverRow, i: number) => {
                                const effectiveLimited = d.limit_override ?? d.is_limited
                                return (
                                <TableRow
                                    key={d.user_id}
                                    className={effectiveLimited ? 'bg-red-50 dark:bg-red-950/30' : undefined}
                                >
                                    <TableCell className="text-muted-foreground tabular-nums">
                                        {(page - 1) * size + i + 1}
                                    </TableCell>
                                    <TableCell>
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
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                #{d.user_id}
                                            </span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                        {d.phone ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums font-semibold">
                                        {d.window_views}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                        {d.active_days}
                                    </TableCell>
                                    <TableCell>
                                        <StatusCell
                                            d={d}
                                            pending={limitedM.isPending}
                                            onSet={(value) =>
                                                limitedM.mutate({ userId: d.user_id, value })
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AdjustPopover
                                            title="Free сегодня"
                                            current={d.free_used}
                                            pending={freeM.isPending}
                                            quickResetTo={0}
                                            quickResetLabel="Сброс (0)"
                                            onSubmit={(mode, value) =>
                                                freeM.mutate({ userId: d.user_id, mode, value })
                                            }
                                            display={
                                                <>
                                                    <span className={d.free_remaining === 0 ? 'text-red-600 dark:text-red-400 font-semibold' : undefined}>
                                                        {d.free_used}
                                                    </span>
                                                    <span className="text-muted-foreground"> / {d.free_limit}</span>
                                                </>
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AdjustPopover
                                            title="Купленные лимиты"
                                            current={d.credits_balance}
                                            pending={creditsM.isPending}
                                            onSubmit={(mode, value) =>
                                                creditsM.mutate({ userId: d.user_id, mode, value })
                                            }
                                            display={
                                                <span className={d.credits_balance > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-muted-foreground'}>
                                                    {d.credits_balance}
                                                </span>
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}

                {total > size && (
                    <div className="mt-4">
                        <Pagination
                            page={page}
                            total={total}
                            size={size}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function TripsByDayBlock({
    title,
    query,
    seriesLabels,
}: {
    title: string
    query: ReturnType<typeof useAdminRideshareTripsByDay>
    seriesLabels?: Record<string, string>
}) {
    return (
        <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            {query.isLoading ? (
                <div>Загрузка…</div>
            ) : !query.data || query.data.days.length === 0 ? (
                <div className="text-muted-foreground">Нет данных</div>
            ) : (
                <DailyStackedBarChart
                    data={[...query.data.days].reverse()}
                    eventTypes={query.data.trip_types}
                    granularity={query.data.granularity}
                    seriesLabels={seriesLabels}
                />
            )}
        </div>
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
    hint?: string | string[]
}) {
    const hints = hint === undefined ? [] : Array.isArray(hint) ? hint : [hint]
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
                {hints.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {hints.map((h, i) => (
                            <div key={i} className="truncate" title={h}>
                                {h}
                            </div>
                        ))}
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
