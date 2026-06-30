'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@doska/i18n'
import { useDebounce } from '@doska/shared'
import {
    useAdminUser,
    useAdminUserTripsSummary,
    useAdminUserWallets,
    useAdminUserDevices,
    useAdminUserSessions,
    useAdminUserDailyActivity,
    useAdminUserEngagement,
    useAdminUserPlatforms,
    useAdminUserLimit,
    useAdminUserTransactions,
    useAdminAnalyticsErrorsSummary,
    useAdminAnalyticsTopErrors,
    useAdminAnalyticsUserEvents,
    useAdminVehicles,
    useAdminNotifications,
} from '@/hooks/queries/admin'
import {
    useAdminBanUser,
    useSetDriverCredits,
    useSetDriverFreeUsed,
    useSetDriverLimited,
} from '@/hooks/mutations/admin'
import {
    AdjustPopover,
    LimitStatusControl,
} from '@/components/admin/analytics/limit-controls'
import { ProductSelector } from '@/components/admin/ProductSelector'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts'
import { ErrorSignaturesTable } from '@/components/admin/analytics/errors-ui'
import { DataCell } from '@/components/admin/analytics/DataCell'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    BackButton,
    Button,
    Input,
    Pagination,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Skeleton,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@doska/ui'
import {
    User as UserIcon,
    Phone,
    Mail,
    Ban,
    CheckCircle2,
    Star,
    ShieldCheck,
    Wallet,
    Wallet as WalletIcon,
    Car,
    Route,
    Calendar,
    Clock,
    Copy,
    MoreVertical,
    Hash,
    Fingerprint,
    Globe,
    Activity,
    Loader2,
    Users,
    CheckCircle,
    XCircle,
    RefreshCw,
    ArrowDownLeft,
    ArrowUpRight,
    ArrowLeftRight,
    CalendarDays,
    Layers,
} from 'lucide-react'
import { format } from 'date-fns'

/* ────────────────────────────── helpers ────────────────────────────── */

const ACCENT = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
}

const PERIODS = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
]

const TOP_COLS = 8

function fmt(v?: string | null, withTime = true) {
    if (!v) return '—'
    try {
        return format(new Date(v), withTime ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy')
    } catch {
        return String(v)
    }
}

function isOnline(lastOnline?: string | null) {
    if (!lastOnline) return false
    return Date.now() - new Date(lastOnline).getTime() < 5 * 60 * 1000
}

function copy(text?: string | null) {
    if (text) navigator.clipboard?.writeText(text)
}

function Pill({
    children,
    tone = 'muted',
}: {
    children: React.ReactNode
    tone?: 'muted' | 'emerald' | 'rose' | 'blue' | 'amber'
}) {
    const tones: Record<string, string> = {
        muted: 'bg-muted text-muted-foreground',
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
        rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    }
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${tones[tone]}`}
        >
            {children}
        </span>
    )
}

function SectionCard({
    title,
    icon: Icon,
    action,
    children,
    className = '',
}: {
    title: string
    icon: React.ElementType
    action?: React.ReactNode
    children: React.ReactNode
    className?: string
}) {
    return (
        <Card className={`overflow-hidden shadow-sm ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border bg-muted/40 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Icon className="h-[18px] w-[18px] text-muted-foreground" />
                    {title}
                </CardTitle>
                {action}
            </CardHeader>
            <CardContent className="pt-5">{children}</CardContent>
        </Card>
    )
}

function StatTile({
    label,
    value,
    accent = 'text-foreground',
    icon: Icon,
}: {
    label: string
    value: React.ReactNode
    accent?: string
    icon: React.ElementType
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className={`mt-2 text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
        </div>
    )
}

function InfoRow({
    icon: Icon,
    label,
    children,
    onCopy,
}: {
    icon: React.ElementType
    label: string
    children: React.ReactNode
    onCopy?: () => void
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
            </span>
            <span className="flex items-center gap-1.5 text-right text-sm font-medium text-foreground">
                <span className="break-all">{children}</span>
                {onCopy && (
                    <button
                        onClick={onCopy}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        title="Скопировать"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                )}
            </span>
        </div>
    )
}

/* ────────────────────────────── page ────────────────────────────── */

export default function UserDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const uid = id

    // analytics-tab state
    const [period, setPeriod] = useState('7d')
    const [product, setProduct] = useState('')
    const [eventSearch, setEventSearch] = useState('')
    const [eventFrom, setEventFrom] = useState('')
    const [eventTo, setEventTo] = useState('')
    const [eventPage, setEventPage] = useState(1)
    const [eventSize, setEventSize] = useState(10)
    const [notifPage, setNotifPage] = useState(1)
    const [notifSize, setNotifSize] = useState(10)

    const profile = useAdminUser(id)
    const user = profile.data
    const isLoading = profile.isLoading

    const tripsSummary = useAdminUserTripsSummary(id)
    const wallets = useAdminUserWallets(id)
    const devices = useAdminUserDevices(id)
    const sessions = useAdminUserSessions(id)

    const activity = useAdminUserDailyActivity(uid, period, product || undefined)
    const engagement = useAdminUserEngagement(uid, period, product || undefined)
    const platforms = useAdminUserPlatforms(uid, period, product || undefined)
    const userErrorsSummary = useAdminAnalyticsErrorsSummary(period, product || undefined, uid)
    const userErrors = useAdminAnalyticsTopErrors(period, product || undefined, undefined, uid)
    const vehicles = useAdminVehicles(1, 40, undefined, { user_id: uid })
    const notifications = useAdminNotifications(notifPage, notifSize, { user_id: uid })

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

    const banUser = useAdminBanUser()
    const [confirmBan, setConfirmBan] = useState(false)

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

    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1400px] space-y-6">
                <BackButton />
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-[1400px] space-y-6">
                <BackButton />
                <p className="py-12 text-center text-muted-foreground">Пользователь не найден</p>
            </div>
        )
    }

    const summary = tripsSummary.data
    const walletItems = wallets.data?.wallets ?? []
    const totals = wallets.data?.total_balance_by_currency ?? {}
    const online = isOnline(user.last_online_at)

    const handleBan = () => {
        banUser.mutate(
            { id: user.id, isActive: !user.is_active },
            { onSettled: () => setConfirmBan(false) },
        )
    }

    return (
        <div className="mx-auto max-w-[1400px] space-y-6">
            <BackButton />

            {/* ── Profile header ── */}
            <Card className="overflow-hidden shadow-sm">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-16 w-16 ring-2 ring-border">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-zinc-900 text-lg text-white">
                                    {(user.full_name || user.username || '?')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span
                                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${
                                    online ? 'bg-emerald-500' : 'bg-zinc-400'
                                }`}
                                title={online ? 'В сети' : 'Не в сети'}
                            />
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
                                {user.full_name || user.username}
                            </h1>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {user.is_active ? (
                                    <Pill tone="emerald">
                                        <CheckCircle2 className="h-3 w-3" /> Активен
                                    </Pill>
                                ) : (
                                    <Pill tone="rose">
                                        <Ban className="h-3 w-3" /> Забанен
                                    </Pill>
                                )}
                                {!!user.rating && (
                                    <Pill tone="amber">
                                        <Star className="h-3 w-3 fill-current" />
                                        {Number(user.rating).toFixed(1)} ({user.review_count ?? 0})
                                    </Pill>
                                )}
                                {user.role_slug && (
                                    <Pill tone="blue">
                                        <ShieldCheck className="h-3 w-3" /> {user.role_slug}
                                    </Pill>
                                )}
                                {user.provider && <Pill>{user.provider}</Pill>}
                                {user.gender && <Pill>{user.gender}</Pill>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={refreshAll}
                            disabled={isFetching}
                            title="Обновить"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            variant={user.is_active ? 'destructive' : 'default'}
                            className="gap-2"
                            onClick={() => setConfirmBan(true)}
                        >
                            {user.is_active ? (
                                <>
                                    <Ban className="h-4 w-4" /> Забанить
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" /> Разбанить
                                </>
                            )}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Скопировать</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => copy(String(user.id))}>
                                    <Hash className="mr-2 h-4 w-4" /> ID: {user.id}
                                </DropdownMenuItem>
                                {user.phone && (
                                    <DropdownMenuItem onClick={() => copy(user.phone)}>
                                        <Phone className="mr-2 h-4 w-4" /> {user.phone}
                                    </DropdownMenuItem>
                                )}
                                {user.email && (
                                    <DropdownMenuItem onClick={() => copy(user.email)}>
                                        <Mail className="mr-2 h-4 w-4" /> {user.email}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <Link href={`/admin/trips?user_id=${user.id}`}>
                                    <DropdownMenuItem>
                                        <Route className="mr-2 h-4 w-4" /> Поездки пользователя
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* ── Tabs ── */}
            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="gap-2">
                        <UserIcon className="h-4 w-4" /> Профиль
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                        <Activity className="h-4 w-4" /> Аналитика
                    </TabsTrigger>
                </TabsList>

                {/* ══════════════════ PROFILE TAB ══════════════════ */}
                <TabsContent value="profile" className="space-y-6">
                    {/* ── Trips stat tiles ── */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        <StatTile label="Поездок всего" icon={Route} value={summary?.total ?? '—'} />
                        <StatTile label="Как водитель" icon={Car} accent={ACCENT.blue} value={summary?.driver ?? '—'} />
                        <StatTile label="Как пассажир" icon={Users} value={summary?.passenger ?? '—'} />
                        <StatTile label="Активные" icon={Activity} accent={ACCENT.emerald} value={summary?.active ?? '—'} />
                        <StatTile label="Завершённые" icon={CheckCircle} accent={ACCENT.emerald} value={summary?.completed ?? '—'} />
                        <StatTile label="Отменённые" icon={XCircle} accent={ACCENT.rose} value={summary?.cancelled ?? '—'} />
                    </div>

                    <Link
                        href={`/admin/trips?user_id=${user.id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                        <Route className="h-4 w-4" /> Открыть поездки пользователя →
                    </Link>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* ── Identity ── */}
                        <SectionCard title="Идентификация" icon={UserIcon}>
                            <div className="divide-y divide-border">
                                <InfoRow icon={Hash} label="ID" onCopy={() => copy(String(user.id))}>
                                    {user.id}
                                </InfoRow>
                                <InfoRow icon={UserIcon} label="ФИО">
                                    {[user.surname, user.name, user.patronymic].filter(Boolean).join(' ') || '—'}
                                </InfoRow>
                                <InfoRow icon={Fingerprint} label="Username">
                                    @{user.username}
                                </InfoRow>
                                <InfoRow icon={Globe} label="Провайдер">
                                    <span className="capitalize">{user.provider || '—'}</span>
                                </InfoRow>
                                <InfoRow icon={ShieldCheck} label="Роль">
                                    {user.role_slug || '—'}
                                </InfoRow>
                                <InfoRow icon={Calendar} label="Регистрация">
                                    {fmt(user.created_at, false)}
                                </InfoRow>
                                <InfoRow icon={Clock} label="Был онлайн">
                                    {online ? (
                                        <span className="text-emerald-600 dark:text-emerald-400">сейчас</span>
                                    ) : (
                                        fmt(user.last_online_at)
                                    )}
                                </InfoRow>
                            </div>
                        </SectionCard>

                        {/* ── Contacts ── */}
                        <SectionCard title="Контакты" icon={Phone}>
                            <div className="divide-y divide-border">
                                <InfoRow icon={Phone} label="Телефон" onCopy={user.phone ? () => copy(user.phone) : undefined}>
                                    {user.phone || '—'}
                                </InfoRow>
                                <InfoRow icon={Mail} label="Email" onCopy={user.email ? () => copy(user.email) : undefined}>
                                    {user.email || '—'}
                                </InfoRow>
                                <InfoRow icon={UserIcon} label="Пол">
                                    <span className="capitalize">{user.gender || '—'}</span>
                                </InfoRow>
                                <InfoRow icon={Star} label="Рейтинг">
                                    {user.rating ? `${Number(user.rating).toFixed(1)} (${user.review_count ?? 0})` : '—'}
                                </InfoRow>
                            </div>
                        </SectionCard>

                        {/* ── Wallets ── */}
                        <SectionCard
                            title="Кошельки"
                            icon={Wallet}
                            action={
                                Object.keys(totals).length > 0 ? (
                                    <span className="text-sm font-semibold tabular-nums text-foreground">
                                        {Object.entries(totals)
                                            .map(([cur, val]) => `${val.toLocaleString()} ${cur}`)
                                            .join(' · ')}
                                    </span>
                                ) : undefined
                            }
                        >
                            {wallets.isLoading ? (
                                <Skeleton className="h-20 w-full" />
                            ) : walletItems.length === 0 ? (
                                <p className="py-6 text-center text-sm italic text-muted-foreground">
                                    Нет кошельков
                                </p>
                            ) : (
                                <div className="divide-y divide-border">
                                    {walletItems.map(w => (
                                        <div key={w.id} className="flex items-center justify-between gap-3 py-2.5">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {w.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {w.product} · {w.tx_count} операций
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                                                {w.balance.toLocaleString()} {w.currency}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                </TabsContent>

                {/* ══════════════════ ANALYTICS TAB ══════════════════ */}
                <TabsContent value="analytics" className="space-y-5">
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
                                    <>
                                        {/* Mobile: cards */}
                                        <ul className="space-y-2 md:hidden">
                                            {sessions.data.map(s => (
                                                <li key={s.id} className="rounded-xl border bg-card p-3 shadow-sm">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                                                s.is_active
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    s.is_active ? 'bg-green-500' : 'bg-muted-foreground/40'
                                                                }`}
                                                            />
                                                            {s.is_active ? 'активна' : 'неактивна'}
                                                        </span>
                                                        {s.app_version && (
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                v{s.app_version}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1.5 text-sm font-medium text-foreground">
                                                        {s.device_info ?? '—'}
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-xs text-muted-foreground">
                                                        {s.ip_address && <span>{s.ip_address}</span>}
                                                        {s.device_id && <span className="break-all">{s.device_id}</span>}
                                                    </div>
                                                    <div className="mt-1.5 text-xs text-muted-foreground">
                                                        {s.last_used_at
                                                            ? `Активность: ${new Date(s.last_used_at).toLocaleString()}`
                                                            : `Создана: ${new Date(s.created_at).toLocaleString()}`}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Desktop: table */}
                                        <div className="hidden md:block">
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
                                        </div>
                                    </>
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
                                    <>
                                        {/* Mobile: cards */}
                                        <ul className="space-y-2 md:hidden">
                                            {devices.data.map(d => (
                                                <li key={d.id} className="rounded-xl border bg-card p-3 shadow-sm">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <DeviceTypeBadge type={d.device_type} />
                                                        {d.app_version && (
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                v{d.app_version}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1.5 text-sm font-medium text-foreground">
                                                        {d.device_info ?? '—'}
                                                    </div>
                                                    {d.device_id && (
                                                        <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
                                                            {d.device_id}
                                                        </div>
                                                    )}
                                                    <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                        <span className="truncate font-mono" title={d.token}>
                                                            {d.token.slice(0, 16)}…
                                                        </span>
                                                        <span className="whitespace-nowrap">
                                                            {new Date(d.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Desktop: table */}
                                        <div className="hidden md:block">
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
                                        </div>
                                    </>
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
                                <LimitedRows items={vehicles.data.items as any[]}>
                                    {rows => (
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
                                                {rows.map((v: any) => (
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
                                </LimitedRows>
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
                        <CardHeader>
                            <CardTitle>
                                Уведомления{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    (всего {notifications.data?.total ?? 0})
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
                            {notifications.data && notifications.data.total > 0 && (
                                <Pagination
                                    page={notifications.data.page}
                                    total={notifications.data.total}
                                    size={notifications.data.size}
                                    onPageChange={setNotifPage}
                                    onSizeChange={s => {
                                        setNotifSize(s)
                                        setNotifPage(1)
                                    }}
                                />
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
                                <>
                                    {/* Mobile: cards */}
                                    <ul className="space-y-2 md:hidden">
                                        {eventItems.map((ev: any) => (
                                            <li key={ev.id} className="rounded-xl border bg-card p-3 shadow-sm">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="break-all font-mono text-sm font-medium text-foreground">
                                                        {ev.event_type}
                                                    </span>
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
                </TabsContent>
            </Tabs>

            {/* ── Ban confirm ── */}
            <Dialog open={confirmBan} onOpenChange={setConfirmBan}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {user.is_active ? 'Забанить' : 'Разбанить'} {user.username}?
                        </DialogTitle>
                        <DialogDescription>
                            {user.is_active
                                ? 'Пользователь потеряет доступ к аккаунту до разбана.'
                                : 'Пользователю вернётся доступ к аккаунту.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Отмена</Button>
                        </DialogClose>
                        <Button
                            variant={user.is_active ? 'destructive' : 'default'}
                            onClick={handleBan}
                            disabled={banUser.isPending}
                            className="gap-2"
                        >
                            {banUser.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.is_active ? (
                                <Ban className="h-4 w-4" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4" />
                            )}
                            {user.is_active ? 'Забанить' : 'Разбанить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

/* ────────────────────────── analytics sub-components ────────────────────────── */

// Client-side row limiter — renders first `step` rows with a "show more" toggle
// so analytics tables stay compact instead of dumping hundreds of rows.
function LimitedRows<T>({
    items,
    step = 10,
    children,
}: {
    items: T[]
    step?: number
    children: (rows: T[]) => ReactNode
}) {
    const [limit, setLimit] = useState(step)
    const visible = items.slice(0, limit)
    const rest = items.length - limit
    return (
        <div className="space-y-3">
            {children(visible)}
            {rest > 0 && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLimit(l => l + step)}
                    >
                        Показать ещё ({rest})
                    </Button>
                </div>
            )}
            {limit > step && rest <= 0 && (
                <div className="flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => setLimit(step)}>
                        Свернуть
                    </Button>
                </div>
            )}
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
    const [txSize, setTxSize] = useState(10)

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

    const incomeTotals = Object.entries(txs.data?.summary.income_by_currency ?? {})
    const expenseTotals = Object.entries(txs.data?.summary.expense_by_currency ?? {})
    const hasTotals = incomeTotals.length > 0 || expenseTotals.length > 0

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
                    {hasTotals && (
                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                                    <ArrowDownLeft className="h-4 w-4" /> Пополнения
                                    {activeWallet && (
                                        <span className="font-normal normal-case text-emerald-600/70 dark:text-emerald-400/70">
                                            · {activeWallet.name}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    {incomeTotals.length === 0 ? (
                                        <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">—</span>
                                    ) : (
                                        incomeTotals.map(([cur, val]) => (
                                            <span key={cur} className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                                                +{fmtAmount(val)}{' '}
                                                <span className="text-sm font-normal text-emerald-600/70 dark:text-emerald-400/70">{cur}</span>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-red-700 dark:text-red-400">
                                    <ArrowUpRight className="h-4 w-4" /> Расходы
                                    {activeWallet && (
                                        <span className="font-normal normal-case text-red-600/70 dark:text-red-400/70">
                                            · {activeWallet.name}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    {expenseTotals.length === 0 ? (
                                        <span className="text-lg font-semibold text-red-700 dark:text-red-400">—</span>
                                    ) : (
                                        expenseTotals.map(([cur, val]) => (
                                            <span key={cur} className="text-lg font-semibold tabular-nums text-red-700 dark:text-red-400">
                                                −{fmtAmount(val)}{' '}
                                                <span className="text-sm font-normal text-red-600/70 dark:text-red-400/70">{cur}</span>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
                            onSizeChange={s => {
                                setTxSize(s)
                                setTxPage(1)
                            }}
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
                                onSubmit={(value) => freeM.mutate({ userId: uid, value })}
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
                                onSubmit={(value) => creditsM.mutate({ userId: uid, value })}
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
    onSubmit: (value: number) => void
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
