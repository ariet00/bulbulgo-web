'use client'

import { useEffect, useMemo, useState } from 'react'
import { Link } from '@doska/i18n'
import { useDebounce } from '@doska/shared'
import { Activity, CalendarDays, Layers, RefreshCw } from 'lucide-react'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import {
    useAdminAnalyticsUserEvents,
    useAdminUserDailyActivity,
    useAdminUserEngagement,
    useAdminUserPlatforms,
} from '@/hooks/queries/admin'
import { ProductSelector } from '@/components/admin/ProductSelector'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts-lazy'
import { DataCell } from '@/components/admin/analytics/DataCell'
import { LimitedRows, Metric, PERIODS, SummaryCard, type PeriodProductProps } from './shared'
import { UserLimitCard } from './UserLimitCard'

const TOP_COLS = 8

export function AnalyticsTab({ uid, period, setPeriod, product, setProduct }: PeriodProductProps) {
    const [eventSearch, setEventSearch] = useState('')
    const [eventFrom, setEventFrom] = useState('')
    const [eventTo, setEventTo] = useState('')
    const [eventPage, setEventPage] = useState(1)
    const [eventSize, setEventSize] = useState(10)

    const activity = useAdminUserDailyActivity(uid, period, product || undefined)
    const engagement = useAdminUserEngagement(uid, period, product || undefined)
    const platforms = useAdminUserPlatforms(uid, period, product || undefined)

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

    return (
        <div className="space-y-5">
                    {/* ── Toolbar: period ── */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            Период аналитики
                        </div>
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
                    </div>

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
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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

                    <UserLimitCard uid={uid} />

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
                                <LimitedRows items={platforms.data}>
                                    {rows => (
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
                                                {rows.map((p, i) => (
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
                                </LimitedRows>
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
                                <LimitedRows items={activity.data.days}>
                                    {rows => (
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
                                                {rows.map(d => (
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
                                </LimitedRows>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <CardTitle>
                                    Лента событий{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {hasEventFilter
                                            ? `(найдено ${events.data?.total ?? 0})`
                                            : `(всего ${events.data?.total ?? 0})`}
                                    </span>
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => events.refetch()}
                                    disabled={events.isFetching}
                                >
                                    <RefreshCw
                                        className={`mr-1 h-4 w-4 ${events.isFetching ? 'animate-spin' : ''}`}
                                    />
                                    Обновить
                                </Button>
                            </div>
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
                                <>
                                    {/* Mobile: cards */}
                                    <ul className="space-y-2 md:hidden">
                                        {eventItems.map((ev: any) => (
                                            <li key={ev.id} className="rounded-xl border bg-card p-3 shadow-sm">
                                                <div className="flex items-start justify-between gap-2">
                                                    <Link
                                                        href={`/admin/analytics/events/${encodeURIComponent(ev.event_type)}`}
                                                        className="break-all font-mono text-sm font-medium text-foreground hover:text-primary hover:underline"
                                                    >
                                                        {ev.event_type}
                                                    </Link>
                                                    <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                                                        {new Date(ev.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                    <span>
                                                        {ev.platform ?? '—'}
                                                        {ev.app_version ? ` · v${ev.app_version}` : ''}
                                                    </span>
                                                    {ev.device_id && (
                                                        <span className="break-all font-mono">{ev.device_id}</span>
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <DataCell data={ev.data} eventType={ev.event_type} />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Desktop: table */}
                                    <div className="hidden md:block">
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
                                                        <TableCell className="font-mono text-sm">
                                                            <Link
                                                                href={`/admin/analytics/events/${encodeURIComponent(ev.event_type)}`}
                                                                className="hover:text-primary hover:underline"
                                                            >
                                                                {ev.event_type}
                                                            </Link>
                                                        </TableCell>
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
                                    </div>
                                </>
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
