'use client'

import { useState } from 'react'
import {
    useAdminRideshareFunnel,
    useAdminRideshareSummary,
    useAdminRideshareTopDrivers,
    useAdminRideshareTopActiveUsers,
    useAdminRideshareTopRoutes,
    useAdminRideshareTripsByDay,
    useAdminRideshareInstallsByDay,
    useAdminRideshareLimitedDrivers,
    useAdminRideshareMultiAccountDevices,
    useAdminRideshareMultiAccountIps,
    useAdminRideshareTopViewedTrips,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@doska/ui'
import { Link } from '@doska/i18n'
import { RefreshCw } from 'lucide-react'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts'
import { AdjustPopover, LimitStatusControl } from '@/components/admin/analytics/limit-controls'
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
    const [limitedTier, setLimitedTier] = useState<'all' | 'strict' | 'general'>('all')
    const [limitedHasCredits, setLimitedHasCredits] = useState(false)
    const limitedDrivers = useAdminRideshareLimitedDrivers(limitedPage, LIMITED_SIZE, {
        tier: limitedTier === 'all' ? undefined : limitedTier,
        hasCredits: limitedHasCredits,
    })
    const [multiPeriod, setMultiPeriod] = useState('30d')
    const [multiPage, setMultiPage] = useState(1)
    const multiDevices = useAdminRideshareMultiAccountDevices(multiPeriod, multiPage, LIMITED_SIZE)
    const [ipPeriod, setIpPeriod] = useState('30d')
    const [ipPage, setIpPage] = useState(1)
    const multiIps = useAdminRideshareMultiAccountIps(ipPeriod, ipPage, LIMITED_SIZE)
    const [viewedPage, setViewedPage] = useState(1)
    const topViewedTrips = useAdminRideshareTopViewedTrips(viewedPage, LIMITED_SIZE)

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
        limitedDrivers.isFetching ||
        multiDevices.isFetching ||
        multiIps.isFetching ||
        topViewedTrips.isFetching
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
        multiDevices.refetch()
        multiIps.refetch()
        topViewedTrips.refetch()
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="sticky top-0 z-20 -mx-4 mb-6 border-b bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:-mx-6 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            BulBul Go — аналитика
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Rideshare, такси, маршрутки, автобусы, грузовые
                        </p>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible">
                        <span className="hidden shrink-0 text-sm text-muted-foreground lg:inline">
                            Период:
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
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
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={refetchAll}
                            disabled={isFetching}
                            title="Обновить все"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                            <span className="ml-1 hidden sm:inline">Обновить</span>
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <TabsList className="inline-flex w-max">
                        <TabsTrigger value="overview">Обзор</TabsTrigger>
                        <TabsTrigger value="trends">Динамика</TabsTrigger>
                        <TabsTrigger value="tops">Топы</TabsTrigger>
                        <TabsTrigger value="limits">Лимиты</TabsTrigger>
                        <TabsTrigger value="fraud">Антифрод</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-0 space-y-6">
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
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
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
                </TabsContent>

                <TabsContent value="trends" className="mt-0 space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
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
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
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
                </TabsContent>

                <TabsContent value="tops" className="mt-0">
                    <Tabs defaultValue="drivers" className="space-y-4">
                        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                            <TabsList className="inline-flex w-max bg-muted/60">
                                <TabsTrigger value="drivers">Водители</TabsTrigger>
                                <TabsTrigger value="users">Пользователи</TabsTrigger>
                                <TabsTrigger value="routes">Маршруты</TabsTrigger>
                                <TabsTrigger value="trips">Поездки</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="drivers" className="mt-0 space-y-6">
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
                        </TabsContent>

                        <TabsContent value="users" className="mt-0 space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
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
                        <>
                        <div className="hidden md:block">
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
                        </div>

                        <div className="space-y-2 md:hidden">
                            {topActive.data.users.map((u, i) => (
                                <div
                                    key={u.user_id}
                                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                                >
                                    <div className="flex min-w-0 items-start gap-2">
                                        <span className="w-5 shrink-0 pt-1 text-xs tabular-nums text-muted-foreground">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <Link
                                                href={`/admin/analytics/users/${u.user_id}`}
                                                className="flex items-center gap-2 hover:underline"
                                            >
                                                {u.avatar_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={u.avatar_url}
                                                        alt=""
                                                        className="h-7 w-7 shrink-0 rounded-full bg-muted object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                                                        {(u.name ?? '?').slice(0, 1).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="truncate text-sm font-medium">
                                                    {u.name ?? `user #${u.user_id}`}
                                                </span>
                                            </Link>
                                            <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                #{u.user_id} · {u.phone ?? '—'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-lg font-semibold tabular-nums">
                                            {u.events.toLocaleString()}
                                        </div>
                                        <div className="text-[11px] tabular-nums text-muted-foreground">
                                            событий · {u.active_days} дн.
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>
                        </TabsContent>

                        <TabsContent value="routes" className="mt-0 space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Топ маршрутов ({routesP})</CardTitle>
                    <PeriodPicker value={routesP} onChange={setRoutesP} overridden={routesOver} />
                </CardHeader>
                <CardContent>
                    {topRoutes.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !topRoutes.data || topRoutes.data.routes.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <>
                        <div className="hidden md:block">
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
                        </div>

                        <div className="space-y-2 md:hidden">
                            {topRoutes.data.routes.map((r, i) => (
                                <div
                                    key={`${r.from_id}-${r.to_id}`}
                                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                                >
                                    <div className="flex min-w-0 items-start gap-2">
                                        <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0 text-sm font-medium">
                                            {r.from_name ?? `#${r.from_id}`} → {r.to_name ?? `#${r.to_id}`}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-base font-semibold tabular-nums">
                                            {r.trips}
                                        </div>
                                        <div className="text-[11px] tabular-nums text-muted-foreground">
                                            поездок · заверш. {r.completed}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>
                        </TabsContent>

                        <TabsContent value="trips" className="mt-0 space-y-6">
            <TopViewedTripsCard
                query={topViewedTrips}
                page={viewedPage}
                size={LIMITED_SIZE}
                onPageChange={setViewedPage}
            />
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="limits" className="mt-0 space-y-6">
            <LimitedDriversCard
                query={limitedDrivers}
                page={limitedPage}
                size={LIMITED_SIZE}
                onPageChange={setLimitedPage}
                tier={limitedTier}
                onTierChange={(t) => {
                    setLimitedTier(t)
                    setLimitedPage(1)
                }}
                hasCredits={limitedHasCredits}
                onHasCreditsChange={(v) => {
                    setLimitedHasCredits(v)
                    setLimitedPage(1)
                }}
            />
                </TabsContent>

                <TabsContent value="fraud" className="mt-0 space-y-6">
            <MultiAccountDevicesCard
                query={multiDevices}
                period={multiPeriod}
                onPeriodChange={(p) => {
                    setMultiPeriod(p)
                    setMultiPage(1)
                }}
                page={multiPage}
                size={LIMITED_SIZE}
                onPageChange={setMultiPage}
            />

            <MultiAccountIpsCard
                query={multiIps}
                period={ipPeriod}
                onPeriodChange={(p) => {
                    setIpPeriod(p)
                    setIpPage(1)
                }}
                page={ipPage}
                size={LIMITED_SIZE}
                onPageChange={setIpPage}
            />
                </TabsContent>
            </Tabs>
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
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
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
                    <>
                    <div className="hidden md:block">
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
                    </div>

                    <div className="space-y-2 md:hidden">
                        {query.data.drivers.map((d: TopDriverRow, i: number) => {
                            const completionPct = d.trips > 0 ? (d.completed / d.trips) * 100 : 0
                            const main =
                                variant === 'trips'
                                    ? { value: d.trips, label: 'Поездки' }
                                    : variant === 'phone'
                                    ? { value: d.phone_views_made, label: 'Просмотров номера' }
                                    : { value: d.trip_views_made, label: 'Просмотров объявл.' }
                            return (
                                <div key={d.user_id} className="rounded-lg border p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-2">
                                            <span className="w-5 shrink-0 pt-1 text-xs tabular-nums text-muted-foreground">
                                                {i + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <UserCell d={d} />
                                                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                    {d.phone ?? '—'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-lg font-semibold tabular-nums">
                                                {main.value}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {main.label}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                                        {variant === 'trips' && (
                                            <>
                                                <span>Водит. <span className="tabular-nums text-foreground">{d.trips_driver}</span></span>
                                                <span>Пасс. <span className="tabular-nums text-foreground">{d.trips_passenger}</span></span>
                                                <span>Заверш. <span className="tabular-nums text-foreground">{d.completed}</span></span>
                                                <span className={completionPct >= 70 ? 'text-green-600 dark:text-green-400' : completionPct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                                                    {d.trips > 0 ? `${completionPct.toFixed(0)}%` : '—'}
                                                </span>
                                            </>
                                        )}
                                        {variant === 'phone' && (
                                            <>
                                                <span>Водит. <span className="tabular-nums text-foreground">{d.phone_views_made_driver}</span></span>
                                                <span>Пасс. <span className="tabular-nums text-foreground">{d.phone_views_made_passenger}</span></span>
                                                <span>fast <span className="tabular-nums text-foreground">{d.phone_views_fast_made}</span></span>
                                            </>
                                        )}
                                        {variant === 'ads' && (
                                            <>
                                                <span>Водит. <span className="tabular-nums text-foreground">{d.trip_views_made_driver}</span></span>
                                                <span>Пасс. <span className="tabular-nums text-foreground">{d.trip_views_made_passenger}</span></span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

type LimitedDriversQuery = ReturnType<typeof useAdminRideshareLimitedDrivers>
type LimitedDriverRow = NonNullable<LimitedDriversQuery['data']>['drivers'][number]


type TopViewedQuery = ReturnType<typeof useAdminRideshareTopViewedTrips>
type TopViewedRow = NonNullable<TopViewedQuery['data']>['trips'][number]

// Currently active trips ranked by phone-view count (data.phone_view_count).
function TopViewedTripsCard({
    query,
    page,
    size,
    onPageChange,
}: {
    query: TopViewedQuery
    page: number
    size: number
    onPageChange: (p: number) => void
}) {
    const trips = query.data?.trips ?? []
    const total = query.data?.total ?? 0

    return (
        <Card>
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>Самые просматриваемые поездки ({total})</CardTitle>
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
                <p className="text-xs text-muted-foreground">
                    Активные объявления по числу просмотров номера (data.phone_view_count)
                </p>
            </CardHeader>
            <CardContent>
                {query.isLoading ? (
                    <div>Загрузка…</div>
                ) : trips.length === 0 ? (
                    <div className="text-muted-foreground">Нет данных</div>
                ) : (
                    <>
                    <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead className="w-32 text-right font-semibold">
                                    Просмотров
                                </TableHead>
                                <TableHead>Маршрут</TableHead>
                                <TableHead className="w-28">Тип / роль</TableHead>
                                <TableHead>Владелец</TableHead>
                                <TableHead className="w-40">Последний просмотр</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trips.map((t: TopViewedRow, i: number) => (
                                <TableRow key={t.trip_id}>
                                    <TableCell className="text-muted-foreground tabular-nums">
                                        {(page - 1) * size + i + 1}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums font-semibold">
                                        {t.phone_view_count}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/admin/trips/${t.trip_id}`}
                                            className="hover:underline"
                                        >
                                            <span className="text-sm">
                                                {t.from_name ?? '—'} → {t.to_name ?? '—'}
                                            </span>
                                            <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                                                #{t.trip_id}
                                            </span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {t.trip_type ?? '—'} / {roleLabel(t.role)}
                                    </TableCell>
                                    <TableCell>
                                        {t.owner_user_id ? (
                                            <Link
                                                href={`/admin/analytics/users/${t.owner_user_id}`}
                                                className="hover:underline text-sm"
                                            >
                                                {t.owner_name ?? `user #${t.owner_user_id}`}
                                                <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                                                    #{t.owner_user_id}
                                                </span>
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                        {t.last_phone_view_at
                                            ? new Date(t.last_phone_view_at).toLocaleString()
                                            : '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>

                    <div className="space-y-2 md:hidden">
                        {trips.map((t: TopViewedRow, i: number) => (
                            <div key={t.trip_id} className="rounded-lg border p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-2">
                                        <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                                            {(page - 1) * size + i + 1}
                                        </span>
                                        <Link
                                            href={`/admin/trips/${t.trip_id}`}
                                            className="min-w-0 hover:underline"
                                        >
                                            <div className="text-sm font-medium">
                                                {t.from_name ?? '—'} → {t.to_name ?? '—'}
                                            </div>
                                            <div className="text-xs text-muted-foreground tabular-nums">
                                                #{t.trip_id} · {t.trip_type ?? '—'} / {roleLabel(t.role)}
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-lg font-semibold tabular-nums">
                                            {t.phone_view_count}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">просмотров</div>
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                                    <span>
                                        {t.owner_user_id ? (
                                            <Link
                                                href={`/admin/analytics/users/${t.owner_user_id}`}
                                                className="hover:underline"
                                            >
                                                {t.owner_name ?? `user #${t.owner_user_id}`}
                                                <span className="ml-1 tabular-nums">#{t.owner_user_id}</span>
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </span>
                                    <span className="whitespace-nowrap">
                                        {t.last_phone_view_at
                                            ? new Date(t.last_phone_view_at).toLocaleString()
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}

                {(total > size || page > 1) && (
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

type MultiDevicesQuery = ReturnType<typeof useAdminRideshareMultiAccountDevices>
type MultiDeviceRow = NonNullable<MultiDevicesQuery['data']>['devices'][number]

const MULTI_PERIODS = ['7d', '30d', '90d']

// Devices used to sign in from 2+ different accounts in the period — a
// multi-account-per-device signal (grouped by analytics event device_id).
function MultiAccountDevicesCard({
    query,
    period,
    onPeriodChange,
    page,
    size,
    onPageChange,
}: {
    query: MultiDevicesQuery
    period: string
    onPeriodChange: (p: string) => void
    page: number
    size: number
    onPageChange: (p: number) => void
}) {
    const devices = query.data?.devices ?? []
    const total = query.data?.total ?? 0

    return (
        <Card>
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle>Несколько аккаунтов с одного устройства ({total})</CardTitle>
                    <div className="flex items-center gap-1 flex-wrap">
                        {MULTI_PERIODS.map(p => (
                            <Button
                                key={p}
                                variant={period === p ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => onPeriodChange(p)}
                            >
                                {p}
                            </Button>
                        ))}
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
                </div>
                <p className="text-xs text-muted-foreground">
                    Устройства, с которых за период заходили под 2+ разными аккаунтами (по
                    device_id событий)
                </p>
            </CardHeader>
            <CardContent>
                {query.isLoading ? (
                    <div>Загрузка…</div>
                ) : devices.length === 0 ? (
                    <div className="text-muted-foreground">Нет данных</div>
                ) : (
                    <>
                    <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead className="w-40">Устройство</TableHead>
                                <TableHead className="w-24 text-right">Аккаунтов</TableHead>
                                <TableHead>Аккаунты</TableHead>
                                <TableHead className="w-24 text-right">Событий</TableHead>
                                <TableHead className="w-40">Последняя активность</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.map((d: MultiDeviceRow, i: number) => (
                                <TableRow key={d.device_id}>
                                    <TableCell className="text-muted-foreground tabular-nums align-top">
                                        {(page - 1) * size + i + 1}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs break-all align-top">
                                        {d.device_id}
                                    </TableCell>
                                    <TableCell className="text-right align-top">
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                            {d.account_count}
                                        </span>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="space-y-1">
                                            {d.accounts.map(a => (
                                                <div
                                                    key={a.user_id}
                                                    className="flex items-center gap-2 text-sm flex-wrap"
                                                >
                                                    <Link
                                                        href={`/admin/analytics/users/${a.user_id}`}
                                                        className="hover:underline"
                                                    >
                                                        {a.name ?? `user #${a.user_id}`}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground tabular-nums">
                                                        #{a.user_id}
                                                    </span>
                                                    {a.phone && (
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {a.phone}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        · {a.events} соб.
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums align-top">
                                        {d.events}
                                    </TableCell>
                                    <TableCell className="text-xs whitespace-nowrap align-top">
                                        {new Date(d.last_seen).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {devices.map((d: MultiDeviceRow, i: number) => (
                            <div key={d.device_id} className="space-y-2 rounded-lg border p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 items-start gap-2">
                                        <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                                            {(page - 1) * size + i + 1}
                                        </span>
                                        <span className="min-w-0 break-all font-mono text-xs">
                                            {d.device_id}
                                        </span>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                        {d.account_count} акк.
                                    </span>
                                </div>
                                <div className="space-y-1 border-t pt-2">
                                    {d.accounts.map(a => (
                                        <div
                                            key={a.user_id}
                                            className="flex flex-wrap items-center gap-2 text-sm"
                                        >
                                            <Link
                                                href={`/admin/analytics/users/${a.user_id}`}
                                                className="hover:underline"
                                            >
                                                {a.name ?? `user #${a.user_id}`}
                                            </Link>
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                #{a.user_id}
                                            </span>
                                            {a.phone && (
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {a.phone}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                · {a.events} соб.
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <span className="tabular-nums">{d.events} событий</span>
                                    <span className="whitespace-nowrap">
                                        {new Date(d.last_seen).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}

                {(total > size || page > 1) && (
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

type MultiIpsQuery = ReturnType<typeof useAdminRideshareMultiAccountIps>
type MultiIpRow = NonNullable<MultiIpsQuery['data']>['ips'][number]

// IP addresses used to sign in from 2+ different accounts in the period — a
// multi-account-per-IP signal (grouped by analytics event ip_address).
function MultiAccountIpsCard({
    query,
    period,
    onPeriodChange,
    page,
    size,
    onPageChange,
}: {
    query: MultiIpsQuery
    period: string
    onPeriodChange: (p: string) => void
    page: number
    size: number
    onPageChange: (p: number) => void
}) {
    const ips = query.data?.ips ?? []
    const total = query.data?.total ?? 0

    return (
        <Card>
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle>Несколько аккаунтов с одного IP ({total})</CardTitle>
                    <div className="flex items-center gap-1 flex-wrap">
                        {MULTI_PERIODS.map(p => (
                            <Button
                                key={p}
                                variant={period === p ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => onPeriodChange(p)}
                            >
                                {p}
                            </Button>
                        ))}
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
                </div>
                <p className="text-xs text-muted-foreground">
                    IP-адреса, с которых за период заходили под 2+ разными аккаунтами (по
                    ip_address событий)
                </p>
            </CardHeader>
            <CardContent>
                {query.isLoading ? (
                    <div>Загрузка…</div>
                ) : ips.length === 0 ? (
                    <div className="text-muted-foreground">Нет данных</div>
                ) : (
                    <>
                    <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead className="w-40">IP</TableHead>
                                <TableHead className="w-24 text-right">Аккаунтов</TableHead>
                                <TableHead>Аккаунты</TableHead>
                                <TableHead className="w-24 text-right">Событий</TableHead>
                                <TableHead className="w-40">Последняя активность</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ips.map((d: MultiIpRow, i: number) => (
                                <TableRow key={d.ip_address}>
                                    <TableCell className="text-muted-foreground tabular-nums align-top">
                                        {(page - 1) * size + i + 1}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs break-all align-top">
                                        {d.ip_address}
                                    </TableCell>
                                    <TableCell className="text-right align-top">
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                            {d.account_count}
                                        </span>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="space-y-1">
                                            {d.accounts.map(a => (
                                                <div
                                                    key={a.user_id}
                                                    className="flex items-center gap-2 text-sm flex-wrap"
                                                >
                                                    <Link
                                                        href={`/admin/analytics/users/${a.user_id}`}
                                                        className="hover:underline"
                                                    >
                                                        {a.name ?? `user #${a.user_id}`}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground tabular-nums">
                                                        #{a.user_id}
                                                    </span>
                                                    {a.phone && (
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {a.phone}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        · {a.events} соб.
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums align-top">
                                        {d.events}
                                    </TableCell>
                                    <TableCell className="text-xs whitespace-nowrap align-top">
                                        {new Date(d.last_seen).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {ips.map((d: MultiIpRow, i: number) => (
                            <div key={d.ip_address} className="space-y-2 rounded-lg border p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 items-start gap-2">
                                        <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                                            {(page - 1) * size + i + 1}
                                        </span>
                                        <span className="min-w-0 break-all font-mono text-xs">
                                            {d.ip_address}
                                        </span>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                        {d.account_count} акк.
                                    </span>
                                </div>
                                <div className="space-y-1 border-t pt-2">
                                    {d.accounts.map(a => (
                                        <div
                                            key={a.user_id}
                                            className="flex flex-wrap items-center gap-2 text-sm"
                                        >
                                            <Link
                                                href={`/admin/analytics/users/${a.user_id}`}
                                                className="hover:underline"
                                            >
                                                {a.name ?? `user #${a.user_id}`}
                                            </Link>
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                #{a.user_id}
                                            </span>
                                            {a.phone && (
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {a.phone}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                · {a.events} соб.
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <span className="tabular-nums">{d.events} событий</span>
                                    <span className="whitespace-nowrap">
                                        {new Date(d.last_seen).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}

                {(total > size || page > 1) && (
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

const LIMITED_TIERS: Array<{ value: 'all' | 'strict' | 'general'; label: string }> = [
    { value: 'all', label: 'Все тарифы' },
    { value: 'strict', label: 'Строгий' },
    { value: 'general', label: 'Общий' },
]

function LimitedDriversCard({
    query,
    page,
    size,
    onPageChange,
    tier,
    onTierChange,
    hasCredits,
    onHasCreditsChange,
}: {
    query: LimitedDriversQuery
    page: number
    size: number
    onPageChange: (p: number) => void
    tier: 'all' | 'strict' | 'general'
    onTierChange: (t: 'all' | 'strict' | 'general') => void
    hasCredits: boolean
    onHasCreditsChange: (v: boolean) => void
}) {
    const cfg = query.data?.config
    const drivers = query.data?.drivers ?? []
    const total = query.data?.total ?? 0

    const creditsM = useSetDriverCredits()
    const freeM = useSetDriverFreeUsed()
    const limitedM = useSetDriverLimited()

    return (
        <Card>
            <CardHeader className="space-y-2">
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
                <div className="flex items-center gap-2 flex-wrap">
                    {LIMITED_TIERS.map(t => (
                        <Button
                            key={t.value}
                            variant={tier === t.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => onTierChange(t.value)}
                        >
                            {t.label}
                        </Button>
                    ))}
                    <span className="mx-1 h-4 w-px bg-border" />
                    <Button
                        variant={hasCredits ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => onHasCreditsChange(!hasCredits)}
                        title="Только с купленными (carry-over) лимитами"
                    >
                        С купленными
                    </Button>
                </div>
                {cfg && (
                    <p className="text-xs text-muted-foreground">
                        {cfg.enabled ? 'Лимиты включены' : 'Лимиты выключены'} · окно{' '}
                        {cfg.activity_window_days}д · порог: ≥{cfg.activity_min_views} просмотров
                        на ≥{cfg.activity_min_active_days} днях · free/день: строгий{' '}
                        {cfg.free_daily_limit} / общий {cfg.global_free_daily_limit} · fast ×
                        {cfg.fast_cost}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {query.isLoading ? (
                    <div>Загрузка…</div>
                ) : drivers.length === 0 ? (
                    <div className="text-muted-foreground">Нет данных</div>
                ) : (
                    <>
                    <div className="hidden md:block">
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
                                <TableHead className="w-32" title="Тариф free-лимита: строгий (таксисты) / общий (остальные)">
                                    Тариф
                                </TableHead>
                                <TableHead className="w-32 text-right" title="Использовано free-лимита сегодня (по тарифу)">
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
                                        <LimitStatusControl
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
                                            onSubmit={(value) =>
                                                freeM.mutate({ userId: d.user_id, value })
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
                                            onSubmit={(value) =>
                                                creditsM.mutate({ userId: d.user_id, value })
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
                    </div>

                    <div className="space-y-3 md:hidden">
                        {drivers.map((d: LimitedDriverRow, i: number) => {
                            const effectiveLimited = d.limit_override ?? d.is_limited
                            return (
                                <div
                                    key={d.user_id}
                                    className={`rounded-lg border p-3 space-y-3 ${
                                        effectiveLimited
                                            ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="w-5 shrink-0 pt-1 text-xs tabular-nums text-muted-foreground">
                                            {(page - 1) * size + i + 1}
                                        </span>
                                        <Link
                                            href={`/admin/analytics/users/${d.user_id}`}
                                            className="flex min-w-0 flex-1 items-center gap-2 hover:underline"
                                        >
                                            {d.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={d.avatar_url}
                                                    alt=""
                                                    className="h-8 w-8 shrink-0 rounded-full bg-muted object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                                                    {(d.name ?? '?').slice(0, 1).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {d.name ?? `user #${d.user_id}`}
                                                </div>
                                                <div className="truncate text-xs tabular-nums text-muted-foreground">
                                                    #{d.user_id} · {d.phone ?? '—'}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <div>
                                            <span className="text-xs text-muted-foreground">Просмотров </span>
                                            <span className="font-semibold tabular-nums">{d.window_views}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground">Активных дней </span>
                                            <span className="tabular-nums">{d.active_days}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-end gap-x-4 gap-y-3 border-t pt-3">
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">Тариф / статус</div>
                                            <LimitStatusControl
                                                d={d}
                                                pending={limitedM.isPending}
                                                onSet={(value) =>
                                                    limitedM.mutate({ userId: d.user_id, value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">Free сегодня</div>
                                            <AdjustPopover
                                                title="Free сегодня"
                                                current={d.free_used}
                                                pending={freeM.isPending}
                                                quickResetTo={0}
                                                quickResetLabel="Сброс (0)"
                                                onSubmit={(value) =>
                                                    freeM.mutate({ userId: d.user_id, value })
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
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">Куплено</div>
                                            <AdjustPopover
                                                title="Купленные лимиты"
                                                current={d.credits_balance}
                                                pending={creditsM.isPending}
                                                onSubmit={(value) =>
                                                    creditsM.mutate({ userId: d.user_id, value })
                                                }
                                                display={
                                                    <span className={d.credits_balance > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-muted-foreground'}>
                                                        {d.credits_balance}
                                                    </span>
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    </>
                )}

                {(total > size || page > 1) && (
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
