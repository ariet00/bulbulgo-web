'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { use } from 'react'
import { useDebounce } from '@doska/shared'
import {
    useAdminAnalyticsErrorsSummary,
    useAdminAnalyticsTopErrors,
    useAdminAnalyticsUserEvents,
    useAdminUser,
    useAdminUserDailyActivity,
    useAdminUserDevices,
    useAdminUserSessions,
    useAdminUserTripsSummary,
    useAdminUserEngagement,
    useAdminUserPlatforms,
    useAdminUserLimit,
    useAdminUserWallets,
    useAdminUserTransactions,
    useAdminVehicles,
    useAdminNotifications,
} from '@/hooks/queries/admin'
import {
    useSetDriverCredits,
    useSetDriverFreeUsed,
    useSetDriverLimited,
} from '@/hooks/mutations/admin'
import {
    AdjustPopover,
    LimitStatusControl,
} from '@/components/admin/analytics/limit-controls'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { Button, Input, Pagination } from '@doska/ui'
import { Link } from '@doska/i18n'
import {
    RefreshCw,
    Wallet as WalletIcon,
    ArrowDownLeft,
    ArrowUpRight,
    ArrowLeftRight,
    Activity,
    CalendarDays,
    Layers,
} from 'lucide-react'
import { ProductSelector } from '@/components/admin/ProductSelector'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts'
import { ErrorSignaturesTable } from '@/components/admin/analytics/errors-ui'
import { DataCell } from '@/components/admin/analytics/DataCell'

const PERIODS = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

const TOP_COLS = 8

export default function UserAnalyticsPage({
    params,
}: {
    params: Promise<{ userId: string }>
}) {
    const { userId } = use(params)
    const uid = Number(userId)
    const [period, setPeriod] = useState('30d')
    const [product, setProduct] = useState('')
    const [eventSearch, setEventSearch] = useState('')
    const [eventFrom, setEventFrom] = useState('')
    const [eventTo, setEventTo] = useState('')
    const [eventPage, setEventPage] = useState(1)
    const [eventSize, setEventSize] = useState(50)

    const profile = useAdminUser(uid)
    const activity = useAdminUserDailyActivity(uid, period, product || undefined)
    const debouncedEventSearch = useDebounce(eventSearch, 300)
    const eventFilters = useMemo(
        () => ({
            event_type: debouncedEventSearch.trim() || undefined,
            from_date: eventFrom ? new Date(eventFrom).toISOString() : undefined,
            to_date: eventTo ? new Date(eventTo).toISOString() : undefined,
        }),
        [debouncedEventSearch, eventFrom, eventTo],
    )
    const events = useAdminAnalyticsUserEvents(
        uid,
        eventPage,
        eventSize,
        product || undefined,
        eventFilters,
    )

    // сбрасываем на первую страницу при изменении фильтров/продукта
    useEffect(() => {
        setEventPage(1)
    }, [eventFilters, product])
    const devices = useAdminUserDevices(uid)
    const sessions = useAdminUserSessions(uid)
    const tripsSummary = useAdminUserTripsSummary(uid)
    const engagement = useAdminUserEngagement(uid, period, product || undefined)
    const platforms = useAdminUserPlatforms(uid, period, product || undefined)
    const userErrorsSummary = useAdminAnalyticsErrorsSummary(period, product || undefined, uid)
    const userErrors = useAdminAnalyticsTopErrors(period, product || undefined, undefined, uid)
    const vehicles = useAdminVehicles(1, 40, undefined, { user_id: uid })
    const notifications = useAdminNotifications(1, 20, { user_id: uid })

    const { topEventTypes, totalEvents, activeDays } = useMemo(() => {
        if (!activity.data) return { topEventTypes: [] as string[], totalEvents: 0, activeDays: 0 }
        const sums: Record<string, number> = {}
        for (const day of activity.data.days) {
            for (const [ev, n] of Object.entries(day.events)) {
                sums[ev] = (sums[ev] || 0) + n
            }
        }
        const topEventTypes = Object.entries(sums)
            .sort((a, b) => b[1] - a[1])
            .slice(0, TOP_COLS)
            .map(([ev]) => ev)
        const totalEvents = activity.data.days.reduce((sum, d) => sum + d.total, 0)
        return { topEventTypes, totalEvents, activeDays: activity.data.days.length }
    }, [activity.data])

    const eventItems = events.data?.items ?? []
    const hasEventFilter = !!(eventSearch || eventFrom || eventTo)

    const isFetching =
        activity.isFetching ||
        events.isFetching ||
        devices.isFetching ||
        sessions.isFetching ||
        profile.isFetching ||
        tripsSummary.isFetching ||
        engagement.isFetching ||
        platforms.isFetching ||
        vehicles.isFetching ||
        notifications.isFetching
    const refreshAll = () => {
        activity.refetch()
        events.refetch()
        devices.refetch()
        sessions.refetch()
        profile.refetch()
        tripsSummary.refetch()
        engagement.refetch()
        platforms.refetch()
        vehicles.refetch()
        notifications.refetch()
    }

    return (
        <div className="mx-auto max-w-[1400px] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Аналитика пользователя</div>
                    <h1 className="truncate text-xl font-semibold sm:text-2xl">
                        {profile.data?.full_name ||
                            profile.data?.username ||
                            `Пользователь #${uid}`}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            #{uid}
                        </span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
                        {PERIODS.map(p => (
                            <Button
                                key={p.value}
                                variant={period === p.value ? 'default' : 'ghost'}
                                size="sm"
                                className="h-7 px-2.5"
                                onClick={() => setPeriod(p.value)}
                            >
                                {p.label}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshAll}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 sm:mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Обновить</span>
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {profile.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !profile.data ? (
                        <div className="text-muted-foreground">Профиль не найден</div>
                    ) : (
                        <div className="flex items-start gap-4">
                            {profile.data.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.data.avatar_url}
                                    alt=""
                                    className="h-14 w-14 shrink-0 rounded-full bg-muted object-cover ring-2 ring-border sm:h-16 sm:w-16"
                                />
                            ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-medium text-muted-foreground ring-2 ring-border sm:h-16 sm:w-16">
                                    {(profile.data.full_name ?? profile.data.username ?? '?')
                                        .slice(0, 1)
                                        .toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-lg font-semibold">
                                        {profile.data.full_name ||
                                            [profile.data.name, profile.data.surname]
                                                .filter(Boolean)
                                                .join(' ') ||
                                            profile.data.username ||
                                            `#${uid}`}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                            profile.data.is_active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                profile.data.is_active ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                        />
                                        {profile.data.is_active ? 'активен' : 'забанен'}
                                    </span>
                                </div>
                                <div className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                    <Field label="username" value={profile.data.username} />
                                    <Field label="Телефон" value={profile.data.phone} mono />
                                    <Field label="Email" value={profile.data.email} />
                                    <Field label="Provider" value={profile.data.provider} />
                                    <Field label="Роль" value={profile.data.role_slug} />
                                    <Field label="Пол" value={profile.data.gender} />
                                    <Field
                                        label="Рейтинг"
                                        value={
                                            profile.data.rating != null
                                                ? `${profile.data.rating} (${profile.data.review_count ?? 0} отз.)`
                                                : null
                                        }
                                    />
                                    <Field
                                        label="Регистрация"
                                        value={
                                            profile.data.created_at
                                                ? new Date(profile.data.created_at).toLocaleString()
                                                : null
                                        }
                                    />
                                    <Field
                                        label="Был онлайн"
                                        value={
                                            profile.data.last_online_at
                                                ? new Date(profile.data.last_online_at).toLocaleString()
                                                : null
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ProductSelector value={product} onChange={setProduct} />

            <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard title="Всего событий" value={totalEvents} icon={Activity} />
                <SummaryCard title="Активных дней" value={activeDays} icon={CalendarDays} />
                <SummaryCard
                    title="Различных событий"
                    value={activity.data?.event_types.length ?? 0}
                    icon={Layers}
                />
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Поездки <span className="text-sm font-normal text-muted-foreground">(за всё время)</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tripsSummary.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !tripsSummary.data ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <Metric label="Всего" value={tripsSummary.data.total} />
                                    <Metric label="Водитель" value={tripsSummary.data.driver} />
                                    <Metric label="Пассажир" value={tripsSummary.data.passenger} />
                                    <Metric label="Активно" value={tripsSummary.data.active} />
                                    <Metric label="Завершено" value={tripsSummary.data.completed} accent="green" />
                                    <Metric label="Отменено" value={tripsSummary.data.cancelled} accent="red" />
                                </div>
                                {tripsSummary.data.by_type.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {tripsSummary.data.by_type.map(t => (
                                            <span
                                                key={t.trip_type ?? 'none'}
                                                className="rounded bg-muted px-2 py-0.5 text-xs"
                                            >
                                                {t.trip_type ?? '—'}: <strong>{t.count}</strong>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <Link
                                    href={`/admin/trips?user_id=${uid}`}
                                    className="inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Открыть поездки пользователя →
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Вовлечённость <span className="text-sm font-normal text-muted-foreground">({period})</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        {engagement.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !engagement.data ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                <Metric label="Поиски" value={engagement.data.searches} />
                                <Metric label="Бронирования" value={engagement.data.bookings} />
                                <Metric label="Завершил" value={engagement.data.completed} />
                                <Metric
                                    label="Смотрел номера"
                                    value={engagement.data.phone_views_made}
                                    hint={`fast: ${engagement.data.phone_views_fast_made}`}
                                />
                                <Metric label="Смотрел объявл." value={engagement.data.trip_views_made} />
                                <Metric
                                    label="Смотрели его"
                                    value={engagement.data.phone_views_received}
                                    hint={`объявл.: ${engagement.data.trip_views_received}`}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <UserLimitCard uid={uid} />

            <Card>
                <CardHeader>
                    <CardTitle>
                        Ошибки <span className="text-sm font-normal text-muted-foreground">({period})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {userErrorsSummary.data && (
                        <div className="grid gap-3 md:grid-cols-4">
                            <Metric label="Всего" value={userErrorsSummary.data.total} />
                            <Metric label="5xx" value={userErrorsSummary.data.server} accent="red" />
                            <Metric label="4xx" value={userErrorsSummary.data.client} />
                            <Metric label="422" value={userErrorsSummary.data.validation} />
                        </div>
                    )}
                    {userErrors.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !userErrors.data || userErrors.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет ошибок за период</div>
                    ) : (
                        <ErrorSignaturesTable data={userErrors.data} />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Платформы и версии{' '}
                        <span className="text-sm font-normal text-muted-foreground">({period})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {platforms.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !platforms.data || platforms.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет событий за период</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-32">Платформа</TableHead>
                                    <TableHead className="w-32">Версия</TableHead>
                                    <TableHead className="text-right">Событий</TableHead>
                                    <TableHead className="w-44 text-right">Последний раз</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {platforms.data.map((p, i) => (
                                    <TableRow key={`${p.platform ?? 'null'}-${p.app_version ?? 'null'}-${i}`}>
                                        <TableCell>{p.platform ?? '—'}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {p.app_version ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">{p.events}</TableCell>
                                        <TableCell className="text-right text-xs whitespace-nowrap">
                                            {new Date(p.last_seen).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-3 lg:grid-cols-2">
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>
                            Сессии{' '}
                            <span className="text-sm font-normal text-muted-foreground">
                                ({sessions.data?.length ?? 0}) — независимо от периода
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sessions.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !sessions.data || sessions.data.length === 0 ? (
                            <div className="text-muted-foreground">Нет сессий</div>
                        ) : (
                            <Table className="min-w-[760px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Статус</TableHead>
                                        <TableHead>device_id</TableHead>
                                        <TableHead className="w-28">Версия</TableHead>
                                        <TableHead>Устройство</TableHead>
                                        <TableHead className="w-32">IP</TableHead>
                                        <TableHead className="w-40">Последняя активность</TableHead>
                                        <TableHead className="w-40">Создана</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions.data.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <span
                                                    className={
                                                        s.is_active
                                                            ? 'text-xs font-medium text-green-600 dark:text-green-400'
                                                            : 'text-xs text-muted-foreground'
                                                    }
                                                >
                                                    {s.is_active ? 'активна' : 'неактивна'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs break-all">
                                                {s.device_id ?? '—'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {s.app_version ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {s.device_info ?? '—'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {s.ip_address ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap">
                                                {s.last_used_at
                                                    ? new Date(s.last_used_at).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap">
                                                {new Date(s.created_at).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>
                            Push-девайсы{' '}
                            <span className="text-sm font-normal text-muted-foreground">
                                ({devices.data?.length ?? 0}) — независимо от периода
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {devices.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !devices.data || devices.data.length === 0 ? (
                            <div className="text-muted-foreground">Нет зарегистрированных девайсов</div>
                        ) : (
                            <Table className="min-w-[640px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Тип</TableHead>
                                        <TableHead>device_id</TableHead>
                                        <TableHead className="w-28">Версия</TableHead>
                                        <TableHead>Устройство</TableHead>
                                        <TableHead className="w-44">Токен</TableHead>
                                        <TableHead className="w-40">Зарегистрирован</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {devices.data.map(d => (
                                        <TableRow key={d.id}>
                                            <TableCell>
                                                <DeviceTypeBadge type={d.device_type} />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs break-all">
                                                {d.device_id ?? '—'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {d.app_version ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {d.device_info ?? '—'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground truncate" title={d.token}>
                                                {d.token.slice(0, 12)}…
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap">
                                                {new Date(d.created_at).toLocaleString()}
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
                    <CardTitle>
                        Транспорт{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({vehicles.data?.total ?? 0})
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {vehicles.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !vehicles.data || vehicles.data.items.length === 0 ? (
                        <div className="text-muted-foreground">Нет транспорта</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Марка / модель</TableHead>
                                    <TableHead className="w-28">Тип</TableHead>
                                    <TableHead className="w-24">Год</TableHead>
                                    <TableHead className="w-28">Цвет</TableHead>
                                    <TableHead className="w-32">Номер</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles.data.items.map((v: any) => (
                                    <TableRow key={v.id}>
                                        <TableCell>
                                            {[v.brand, v.model].filter(Boolean).join(' ') || '—'}
                                        </TableCell>
                                        <TableCell className="text-xs">{v.vehicle_type ?? '—'}</TableCell>
                                        <TableCell className="tabular-nums">{v.year ?? '—'}</TableCell>
                                        <TableCell className="text-xs">{v.color ?? '—'}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {v.plate_number ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <WalletsCard uid={uid} />

            <Card>
                <CardHeader>
                    <CardTitle>График активности по дням</CardTitle>
                </CardHeader>
                <CardContent>
                    {activity.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !activity.data || activity.data.days.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных за период</div>
                    ) : (
                        <DailyStackedBarChart
                            data={activity.data.days}
                            eventTypes={topEventTypes}
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>По дням × события (топ {TOP_COLS})</CardTitle>
                </CardHeader>
                <CardContent>
                    {activity.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !activity.data || activity.data.days.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных за период</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-32">День</TableHead>
                                    {topEventTypes.map(ev => (
                                        <TableHead key={ev} className="text-right text-xs font-mono">
                                            {ev}
                                        </TableHead>
                                    ))}
                                    <TableHead className="w-20 text-right">Всего</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activity.data.days.map(d => (
                                    <TableRow key={d.day}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {new Date(d.day).toLocaleDateString()}
                                        </TableCell>
                                        {topEventTypes.map(ev => (
                                            <TableCell key={ev} className="text-right">
                                                {d.events[ev] ?? <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right font-medium">{d.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Уведомления{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            (последние {notifications.data?.items.length ?? 0} из {notifications.data?.total ?? 0})
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {notifications.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !notifications.data || notifications.data.items.length === 0 ? (
                        <div className="text-muted-foreground">Нет уведомлений</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-44">Когда</TableHead>
                                    <TableHead>Заголовок</TableHead>
                                    <TableHead className="w-32">Тип</TableHead>
                                    <TableHead className="w-24">Прочитано</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.data.items.map((n: any) => (
                                    <TableRow key={n.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {n.created_at ? new Date(n.created_at).toLocaleString() : '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="font-medium">{n.title ?? '—'}</div>
                                            {n.body && (
                                                <div className="text-xs text-muted-foreground line-clamp-2">
                                                    {n.body}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {n.type ?? '—'}
                                            {n.category ? ` / ${n.category}` : ''}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {n.is_read ? 'да' : 'нет'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-3">
                    <CardTitle>
                        Лента событий{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            {hasEventFilter
                                ? `(найдено ${events.data?.total ?? 0})`
                                : `(всего ${events.data?.total ?? 0})`}
                        </span>
                    </CardTitle>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">Тип события</label>
                            <Input
                                value={eventSearch}
                                onChange={e => setEventSearch(e.target.value)}
                                placeholder="поиск по типу…"
                                className="h-9 w-56"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">С</label>
                            <Input
                                type="datetime-local"
                                value={eventFrom}
                                onChange={e => setEventFrom(e.target.value)}
                                className="h-9 w-52"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">По</label>
                            <Input
                                type="datetime-local"
                                value={eventTo}
                                onChange={e => setEventTo(e.target.value)}
                                className="h-9 w-52"
                            />
                        </div>
                        {(eventSearch || eventFrom || eventTo) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setEventSearch('')
                                    setEventFrom('')
                                    setEventTo('')
                                }}
                            >
                                Сбросить
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {events.isLoading ? (
                        <div>Загрузка…</div>
                    ) : eventItems.length === 0 ? (
                        <div className="text-muted-foreground">
                            {hasEventFilter ? 'Нет событий по фильтру' : 'Нет событий'}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-44">Когда</TableHead>
                                    <TableHead>Событие</TableHead>
                                    <TableHead className="w-32">platform</TableHead>
                                    <TableHead className="w-24">app_version</TableHead>
                                    <TableHead className="w-40">device_id</TableHead>
                                    <TableHead>data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eventItems.map((ev: any) => (
                                    <TableRow key={ev.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {new Date(ev.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{ev.event_type}</TableCell>
                                        <TableCell>{ev.platform ?? '—'}</TableCell>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {ev.app_version ?? '—'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs break-all">
                                            {ev.device_id ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <DataCell data={ev.data} eventType={ev.event_type} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    {events.data && events.data.total > 0 && (
                        <Pagination
                            page={events.data.page}
                            total={events.data.total}
                            size={events.data.size}
                            onPageChange={setEventPage}
                            onSizeChange={s => {
                                setEventSize(s)
                                setEventPage(1)
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

const TX_TYPES = [
    { value: '', label: 'Все' },
    { value: 'income', label: 'Доход' },
    { value: 'expense', label: 'Расход' },
    { value: 'transfer', label: 'Перевод' },
]

const fmtAmount = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })

const txTypeLabel = (type: string) =>
    TX_TYPES.find(x => x.value === type)?.label ?? type

// Signed amount string + color/icon driven by transaction type.
function txMeta(type: string, amount: number) {
    if (type === 'expense') {
        return {
            signed: `−${fmtAmount(Math.abs(amount))}`,
            cls: 'text-red-600 dark:text-red-400',
            Icon: ArrowUpRight,
            iconCls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
        }
    }
    if (type === 'income') {
        return {
            signed: `+${fmtAmount(Math.abs(amount))}`,
            cls: 'text-green-600 dark:text-green-400',
            Icon: ArrowDownLeft,
            iconCls: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40',
        }
    }
    return {
        signed: fmtAmount(amount),
        cls: 'text-foreground',
        Icon: ArrowLeftRight,
        iconCls: 'text-muted-foreground bg-muted',
    }
}

function WalletsCard({ uid }: { uid: number }) {
    const [walletFilter, setWalletFilter] = useState<number | null>(null)
    const [txType, setTxType] = useState('')
    const [txPage, setTxPage] = useState(1)
    const txSize = 50

    const wallets = useAdminUserWallets(uid)
    const txs = useAdminUserTransactions(uid, txPage, txSize, {
        walletId: walletFilter ?? undefined,
        type: txType || undefined,
    })

    useEffect(() => {
        setTxPage(1)
    }, [walletFilter, txType])

    const walletItems = wallets.data?.wallets ?? []
    const balances = wallets.data?.total_balance_by_currency ?? {}
    const txItems = txs.data?.items ?? []
    const activeWallet = walletItems.find(w => w.id === walletFilter)

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <WalletIcon className="h-5 w-5 text-muted-foreground" />
                            Кошельки
                            <span className="text-sm font-normal text-muted-foreground">
                                ({walletItems.length})
                            </span>
                        </CardTitle>
                        {Object.keys(balances).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(balances).map(([cur, total]) => (
                                    <span
                                        key={cur}
                                        className="inline-flex items-baseline gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-sm"
                                    >
                                        <span className="text-xs text-muted-foreground">{cur}</span>
                                        <span className="font-semibold tabular-nums">
                                            {fmtAmount(total)}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {wallets.isLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="h-28 animate-pulse rounded-xl border bg-muted/40"
                                />
                            ))}
                        </div>
                    ) : walletItems.length === 0 ? (
                        <div className="text-muted-foreground">Нет кошельков</div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {walletItems.map(w => {
                                const selected = walletFilter === w.id
                                const accent = w.color || 'hsl(var(--primary))'
                                return (
                                    <button
                                        key={w.id}
                                        type="button"
                                        onClick={() =>
                                            setWalletFilter(selected ? null : w.id)
                                        }
                                        className={`group relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md ${
                                            selected
                                                ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                                                : 'hover:border-foreground/20'
                                        }`}
                                    >
                                        <span
                                            className="absolute inset-y-0 left-0 w-1.5"
                                            style={{ backgroundColor: accent }}
                                        />
                                        <div className="flex items-start justify-between gap-2 pl-2">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">
                                                    {w.name}
                                                </div>
                                                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                    {w.product}
                                                </div>
                                            </div>
                                            {selected && (
                                                <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                                                    фильтр
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-baseline gap-1 pl-2">
                                            <span className="text-2xl font-semibold tabular-nums">
                                                {fmtAmount(w.balance)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {w.currency}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 pl-2 text-xs text-muted-foreground">
                                            <span>{w.tx_count} транз.</span>
                                            <span>·</span>
                                            <span>
                                                с{' '}
                                                {new Date(w.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-3">
                    <CardTitle>
                        История транзакций{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            (всего {txs.data?.total ?? 0})
                        </span>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        {activeWallet && (
                            <button
                                type="button"
                                onClick={() => setWalletFilter(null)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                            >
                                {activeWallet.name}
                                <span className="text-primary/60">✕</span>
                            </button>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                            {TX_TYPES.map(t => (
                                <Button
                                    key={t.value || 'all'}
                                    variant={txType === t.value ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8"
                                    onClick={() => setTxType(t.value)}
                                >
                                    {t.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {txs.isLoading ? (
                        <div>Загрузка…</div>
                    ) : txItems.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Нет транзакций
                        </div>
                    ) : (
                        <>
                            {/* Mobile: stacked list — readable without horizontal scroll */}
                            <ul className="divide-y md:hidden">
                                {txItems.map(t => {
                                    const m = txMeta(t.type, t.amount)
                                    return (
                                        <li
                                            key={t.id}
                                            className="flex items-center gap-3 py-3"
                                        >
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.iconCls}`}
                                            >
                                                <m.Icon className="h-4 w-4" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <span className="truncate text-sm font-medium">
                                                        {t.category_name ?? txTypeLabel(t.type)}
                                                    </span>
                                                    <span
                                                        className={`shrink-0 text-sm font-semibold tabular-nums ${m.cls}`}
                                                    >
                                                        {m.signed}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <span className="truncate">
                                                        {t.wallet_name ?? `#${t.wallet_id}`}
                                                    </span>
                                                    <span>·</span>
                                                    <span className="whitespace-nowrap">
                                                        {new Date(
                                                            t.date ?? t.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {t.description && (
                                                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                                        {t.description}
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>

                            {/* Desktop: full table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-44">Когда</TableHead>
                                            <TableHead className="w-28">Тип</TableHead>
                                            <TableHead className="w-36 text-right">
                                                Сумма
                                            </TableHead>
                                            <TableHead>Кошелёк</TableHead>
                                            <TableHead>Категория</TableHead>
                                            <TableHead>Описание</TableHead>
                                            <TableHead className="w-24">Продукт</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {txItems.map(t => {
                                            const m = txMeta(t.type, t.amount)
                                            return (
                                                <TableRow key={t.id}>
                                                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                        {new Date(
                                                            t.date ?? t.created_at,
                                                        ).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center gap-1.5 text-xs">
                                                            <span
                                                                className={`flex h-6 w-6 items-center justify-center rounded-full ${m.iconCls}`}
                                                            >
                                                                <m.Icon className="h-3.5 w-3.5" />
                                                            </span>
                                                            {txTypeLabel(t.type)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right tabular-nums font-semibold ${m.cls}`}
                                                    >
                                                        {m.signed}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {t.wallet_name ?? `#${t.wallet_id}`}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {t.category_name ?? '—'}
                                                    </TableCell>
                                                    <TableCell
                                                        className="max-w-[280px] truncate text-xs text-muted-foreground"
                                                        title={t.description ?? undefined}
                                                    >
                                                        {t.description ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                        {t.product}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                    {txs.data && txs.data.total > 0 && (
                        <Pagination
                            page={txs.data.page}
                            total={txs.data.total}
                            size={txs.data.size}
                            onPageChange={setTxPage}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function UserLimitCard({ uid }: { uid: number }) {
    const limit = useAdminUserLimit(uid)
    const creditsM = useSetDriverCredits()
    const freeM = useSetDriverFreeUsed()
    const limitedM = useSetDriverLimited()
    const d = limit.data

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                    Лимиты на просмотр номеров
                    {d && !d.enabled && (
                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                            лимитер выключен
                        </span>
                    )}
                </CardTitle>
                {d && (
                    <p className="text-sm font-normal text-muted-foreground">
                        Окно {d.activity_window_days} дн · порог: ≥{d.activity_min_views} просм. на ≥
                        {d.activity_min_active_days} днях · free/день: строгий {d.free_daily_limit},
                        общий {d.global_free_daily_limit} · fast = {d.fast_cost} очк.
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {limit.isLoading ? (
                    <div>Загрузка…</div>
                ) : !d ? (
                    <div className="text-muted-foreground">Нет данных</div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm text-muted-foreground">Действующий тариф:</span>
                            <LimitStatusControl
                                d={d}
                                pending={limitedM.isPending}
                                onSet={value => limitedM.mutate({ userId: uid, value })}
                                align="start"
                            />
                            <span className="text-xs text-muted-foreground">
                                расчёт: {d.is_limited ? 'строгий' : 'общий'} ({d.window_views} просм.
                                / {d.active_days} дн.)
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                            <EditableMetric
                                label="Free сегодня"
                                value={
                                    <>
                                        <span
                                            className={
                                                d.free_remaining === 0
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : undefined
                                            }
                                        >
                                            {d.free_used}
                                        </span>
                                        <span className="text-muted-foreground"> / {d.free_limit}</span>
                                    </>
                                }
                                current={d.free_used}
                                pending={freeM.isPending}
                                quickResetTo={0}
                                quickResetLabel="Сброс (0)"
                                title="Free сегодня"
                                onSubmit={(mode, value) => freeM.mutate({ userId: uid, mode, value })}
                            />
                            <Metric label="Осталось free" value={d.free_remaining} />
                            <EditableMetric
                                label="Купленные лимиты"
                                value={
                                    <span
                                        className={
                                            d.credits_balance > 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-muted-foreground'
                                        }
                                    >
                                        {d.credits_balance}
                                    </span>
                                }
                                current={d.credits_balance}
                                pending={creditsM.isPending}
                                title="Купленные лимиты"
                                onSubmit={(mode, value) => creditsM.mutate({ userId: uid, mode, value })}
                            />
                            <Metric label="Просмотров за окно" value={d.window_views} />
                            <Metric label="Активных дней" value={d.active_days} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function EditableMetric({
    label,
    value,
    current,
    pending,
    title,
    onSubmit,
    quickResetTo,
    quickResetLabel,
}: {
    label: string
    value: ReactNode
    current: number
    pending: boolean
    title: string
    onSubmit: (mode: 'set' | 'delta', value: number) => void
    quickResetTo?: number
    quickResetLabel?: string
}) {
    return (
        <div className="rounded border bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-semibold tabular-nums">
                <AdjustPopover
                    title={title}
                    current={current}
                    pending={pending}
                    onSubmit={onSubmit}
                    quickResetTo={quickResetTo}
                    quickResetLabel={quickResetLabel}
                    display={value}
                    align="start"
                />
            </div>
        </div>
    )
}

function Field({
    label,
    value,
    mono,
}: {
    label: string
    value: string | null | undefined
    mono?: boolean
}) {
    return (
        <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
            <span className={mono ? 'font-mono text-sm break-all' : 'break-all'}>
                {value || '—'}
            </span>
        </div>
    )
}

function Metric({
    label,
    value,
    accent,
    hint,
}: {
    label: string
    value: number
    accent?: 'green' | 'red'
    hint?: string
}) {
    const valueCls =
        accent === 'green'
            ? 'text-green-600 dark:text-green-400'
            : accent === 'red'
            ? 'text-red-600 dark:text-red-400'
            : ''
    return (
        <div className="rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {label}
            </div>
            <div className={`mt-0.5 text-xl font-semibold tabular-nums ${valueCls}`}>{value}</div>
            {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
        </div>
    )
}

function DeviceTypeBadge({ type }: { type: string }) {
    const cls: Record<string, string> = {
        ios: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
        android: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        web: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    }
    return (
        <span
            className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                cls[type] ?? 'bg-muted text-muted-foreground'
            }`}
        >
            {type}
        </span>
    )
}

function SummaryCard({
    title,
    value,
    icon: Icon,
}: {
    title: string
    value: number | undefined
    icon?: typeof Activity
}) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="flex items-center gap-4 p-4">
                {Icon && (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {title}
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">
                        {value?.toLocaleString() ?? '—'}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
