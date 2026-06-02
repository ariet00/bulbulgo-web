'use client'

import { useEffect, useMemo, useState } from 'react'
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
    useAdminVehicles,
    useAdminNotifications,
} from '@/hooks/queries/admin'
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
import { RefreshCw } from 'lucide-react'
import { ProductSelector } from '@/components/admin/ProductSelector'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts'
import { ErrorSignaturesTable } from '@/components/admin/analytics/errors-ui'

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
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">Активность пользователя #{uid}</h1>
                <div className="flex gap-2">
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

            <Card>
                <CardContent className="pt-6">
                    {profile.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !profile.data ? (
                        <div className="text-muted-foreground">Профиль не найден</div>
                    ) : (
                        <div className="flex items-start gap-4 flex-wrap">
                            {profile.data.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.data.avatar_url}
                                    alt=""
                                    className="w-16 h-16 rounded-full object-cover bg-muted"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl text-muted-foreground">
                                    {(profile.data.full_name ?? profile.data.username ?? '?')
                                        .slice(0, 1)
                                        .toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-[240px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-lg font-semibold">
                                        {profile.data.full_name ||
                                            [profile.data.name, profile.data.surname]
                                                .filter(Boolean)
                                                .join(' ') ||
                                            profile.data.username ||
                                            `#${uid}`}
                                    </span>
                                    <span
                                        className={
                                            profile.data.is_active
                                                ? 'text-xs font-medium text-green-600 dark:text-green-400'
                                                : 'text-xs font-medium text-red-600 dark:text-red-400'
                                        }
                                    >
                                        {profile.data.is_active ? 'активен' : 'забанен'}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
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

            <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard title="Всего событий" value={totalEvents} />
                <SummaryCard title="Активных дней" value={activeDays} />
                <SummaryCard title="Различных событий" value={activity.data?.event_types.length ?? 0} />
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
                                        <TableCell className="font-mono text-xs whitespace-pre-wrap break-all">
                                            {ev.data ? JSON.stringify(ev.data) : '—'}
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
        <div className="flex gap-2">
            <span className="text-muted-foreground">{label}:</span>
            <span className={mono ? 'font-mono break-all' : 'break-all'}>{value || '—'}</span>
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
        <div className="rounded border bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-lg font-semibold tabular-nums ${valueCls}`}>{value}</div>
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
