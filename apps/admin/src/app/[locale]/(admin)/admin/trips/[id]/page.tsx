'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter, Link } from '@doska/i18n'
import {
    useAdminTrip,
    useAdminTripPhoneViewers,
    useAdminTripServicePayments,
    useAdminBlockedAuthors,
} from '@/hooks/queries/admin'
import {
    useAdminUpdateTripStatus,
    useAdminDeleteTrip,
    useAdminBlockAuthor,
    useAdminUnblockAuthor,
    useAdminExtendTripService,
} from '@/hooks/mutations/admin'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    BackButton,
    Badge,
    Button,
    Input,
    Separator,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Skeleton,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@doska/ui'
import {
    MapPin,
    Navigation,
    Calendar,
    Clock,
    User as UserIcon,
    Car,
    Phone,
    Mail,
    Star,
    Banknote,
    Users,
    MessageSquare,
    Settings2,
    ChevronDown,
    Trash2,
    Archive,
    CheckCircle2,
    XCircle,
    Loader2,
    Play,
    Zap,
    TrendingUp,
    Hash,
    Building2,
    ExternalLink,
    Rss,
    Map as MapIcon,
    CalendarClock,
    Repeat,
    Cake,
    MapPinned,
    Eye,
    Ban,
    ShieldOff,
} from 'lucide-react'
import { format } from 'date-fns'

/* ────────────────────────────── helpers ────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
    active:
        'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-400/20',
    processing:
        'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-400/20',
    completed:
        'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-400/20',
    cancelled:
        'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-400/20',
    archived:
        'bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/20',
}

const STATUS_OPTIONS = [
    { value: 'active', label: 'Активировать', icon: Play },
    { value: 'processing', label: 'В обработку', icon: Loader2 },
    { value: 'completed', label: 'Завершить', icon: CheckCircle2 },
    { value: 'cancelled', label: 'Отменить', icon: XCircle },
    { value: 'archived', label: 'В архив', icon: Archive },
]

const ACCENT = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
}

function StatusPill({ status }: { status?: string }) {
    const s = status || 'active'
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold capitalize ring-1 ring-inset ${
                STATUS_STYLES[s] || STATUS_STYLES.archived
            }`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {s}
        </span>
    )
}

function fmtDate(v?: string | null, withTime = false) {
    if (!v) return '—'
    try {
        return format(new Date(v), withTime ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy')
    } catch {
        return String(v)
    }
}

function InfoRow({
    icon: Icon,
    label,
    children,
}: {
    icon?: React.ElementType
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {label}
            </span>
            <span className="text-right text-sm font-medium text-foreground">{children}</span>
        </div>
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

function FlagBadge({ on, label }: { on?: boolean; label: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                on
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground line-through decoration-muted-foreground/40'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
            {label}
        </span>
    )
}

function SourceAuthorControl({
    tripId,
    author,
}: {
    tripId: number
    author: { author_id: number; username?: string | null; name?: string | null }
}) {
    const { data: blocked } = useAdminBlockedAuthors()
    const blockAuthor = useAdminBlockAuthor()
    const unblockAuthor = useAdminUnblockAuthor()

    const isBlocked = (blocked ?? []).some((b) => b.author_id === author.author_id)
    const busy = blockAuthor.isPending || unblockAuthor.isPending
    const displayName =
        author.name || (author.username ? `@${author.username}` : `id ${author.author_id}`)

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="min-w-0 space-y-0.5">
                <div className="text-xs uppercase text-muted-foreground">Автор сообщения</div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{displayName}</span>
                    {author.username && author.name && (
                        <span className="text-sm text-muted-foreground">@{author.username}</span>
                    )}
                    <span className="font-mono text-xs text-muted-foreground">
                        id {author.author_id}
                    </span>
                    {isBlocked && (
                        <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" /> Заблокирован
                        </Badge>
                    )}
                </div>
            </div>
            {isBlocked ? (
                <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => unblockAuthor.mutate(author.author_id)}
                    className="gap-1.5"
                >
                    {unblockAuthor.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ShieldOff className="h-4 w-4" />
                    )}
                    Разблокировать
                </Button>
            ) : (
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                        blockAuthor.mutate({
                            author_id: author.author_id,
                            username: author.username,
                            name: author.name,
                            trip_id: tripId,
                        })
                    }
                    className="gap-1.5"
                >
                    {blockAuthor.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Ban className="h-4 w-4" />
                    )}
                    Заблокировать автора
                </Button>
            )}
        </div>
    )
}

function PhoneViewersCard({ tripId }: { tripId: number }) {
    const { data, isLoading } = useAdminTripPhoneViewers(tripId)
    const viewers = data?.viewers ?? []

    return (
        <SectionCard
            title="Кто смотрел номер"
            icon={Eye}
            action={
                data ? (
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {data.total_viewers} польз. · {data.total_views} просм.
                    </span>
                ) : undefined
            }
        >
            <p className="mb-4 text-xs text-muted-foreground">
                Полная история из аналитики — не сбрасывается при поднятии объявления
                (в отличие от счётчика «Просмотры номера»).
            </p>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : viewers.length === 0 ? (
                <p className="py-6 text-center text-sm italic text-muted-foreground">
                    Номер ещё никто не смотрел
                </p>
            ) : (
                <div className="divide-y divide-border">
                    {viewers.map((v, i) => {
                        const row = (
                            <div className="flex items-center gap-3 py-2.5">
                                <Avatar className="h-10 w-10 ring-1 ring-border">
                                    <AvatarImage src={v.avatar_url || undefined} />
                                    <AvatarFallback className="bg-zinc-900 text-xs text-white">
                                        {(v.name || '?').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {v.name || (v.user_id ? `user #${v.user_id}` : 'Аноним')}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {v.phone || '—'}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-semibold tabular-nums text-foreground">
                                        {v.views_count}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            просм.
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground tabular-nums">
                                        {fmtDate(v.last_viewed_at, true)}
                                    </p>
                                </div>
                            </div>
                        )
                        return v.user_id ? (
                            <Link
                                key={`${v.user_id}-${i}`}
                                href={`/admin/users/${v.user_id}`}
                                className="block transition-colors hover:bg-muted/40"
                            >
                                {row}
                            </Link>
                        ) : (
                            <div key={`anon-${i}`}>{row}</div>
                        )
                    })}
                </div>
            )}
        </SectionCard>
    )
}

/* ────────────────────────── trip promo services ────────────────────────── */

const SERVICE_LABELS: Record<string, string> = {
    auto_bump: 'Авто-подъём',
    urgent: 'Срочно',
}

type ServiceState = 'active' | 'expired' | 'never'

function serviceState(flag: unknown, until: string | null | undefined): ServiceState {
    const u = until ? new Date(until) : null
    if (flag && (!u || u.getTime() > Date.now())) return 'active'
    if (u) return 'expired'
    return 'never'
}

const SERVICE_STATE_META: Record<ServiceState, { label: string; cls: string }> = {
    active: {
        label: 'Активна',
        cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    expired: {
        label: 'Истекла',
        cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    },
    never: { label: 'Не подключалась', cls: 'bg-muted text-muted-foreground' },
}

function ServiceStateBlock({
    title,
    icon: Icon,
    state,
    adminExtended,
    rows,
    onExtend,
}: {
    title: string
    icon: React.ElementType
    state: ServiceState
    adminExtended?: boolean
    rows: Array<{ label: string; value: React.ReactNode }>
    onExtend: () => void
}) {
    const meta = SERVICE_STATE_META[state]
    return (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {title}
                </div>
                <div className="flex items-center gap-1.5">
                    {adminExtended && (
                        <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
                            Продлевал админ
                        </span>
                    )}
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${meta.cls}`}>
                        {meta.label}
                    </span>
                </div>
            </div>
            {state !== 'never' && rows.length > 0 && (
                <div className="mt-3 divide-y divide-border/60">
                    {rows.map((r) => (
                        <div
                            key={r.label}
                            className="flex items-center justify-between gap-4 py-1.5 text-sm"
                        >
                            <span className="text-muted-foreground">{r.label}</span>
                            <span className="text-right font-medium text-foreground">
                                {r.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={onExtend}>
                <CalendarClock className="h-4 w-4" />
                {state === 'active' ? 'Продлить' : 'Продлить / активировать'}
            </Button>
        </div>
    )
}

function TripServicesCard({ tripId, data }: { tripId: number; data: any }) {
    const { data: payments, isLoading } = useAdminTripServicePayments(tripId)
    const extendService = useAdminExtendTripService()
    const [extendTarget, setExtendTarget] = useState<string | null>(null)
    const [extendDays, setExtendDays] = useState('7')

    const autoBumpState = serviceState(data.is_auto_bump, data.auto_bump_until)
    const urgentState = serviceState(data.is_urgent, data.urgent_until)

    const submitExtend = () => {
        const days = Number(extendDays)
        if (!extendTarget || !days || days < 1) return
        extendService.mutate(
            { id: tripId, service_type: extendTarget, days },
            { onSuccess: () => setExtendTarget(null) },
        )
    }

    const totalPaid = (payments ?? []).reduce(
        (acc, p) => {
            const cur = p.currency ?? '—'
            acc[cur] = (acc[cur] ?? 0) + p.amount
            return acc
        },
        {} as Record<string, number>,
    )
    const totalStr = Object.entries(totalPaid)
        .map(([cur, sum]) => `${sum.toLocaleString()} ${cur}`)
        .join(' · ')

    return (
        <SectionCard
            title="Подключённые услуги"
            icon={Zap}
            action={
                payments && payments.length > 0 ? (
                    <span className="text-sm text-muted-foreground tabular-nums">
                        оплачено: {totalStr}
                    </span>
                ) : undefined
            }
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ServiceStateBlock
                    title="Авто-подъём"
                    icon={TrendingUp}
                    state={autoBumpState}
                    adminExtended={!!data.auto_bump_admin_extended}
                    onExtend={() => setExtendTarget('auto_bump')}
                    rows={[
                        { label: 'Действует до', value: fmtDate(data.auto_bump_until, true) },
                        {
                            label: 'Интервал подъёма',
                            value: data.auto_bump_interval_hours
                                ? `каждые ${data.auto_bump_interval_hours} ч`
                                : '—',
                        },
                        {
                            label: 'Последний подъём',
                            value: data.auto_bump_last_at
                                ? fmtDate(data.auto_bump_last_at, true)
                                : 'ещё не поднималась',
                        },
                        {
                            label: 'Тариф',
                            value: data.auto_bump_tariff_id ? (
                                <span className="font-mono text-xs">
                                    {data.auto_bump_tariff_id}
                                </span>
                            ) : (
                                '—'
                            ),
                        },
                    ]}
                />
                <ServiceStateBlock
                    title="Срочно"
                    icon={Zap}
                    state={urgentState}
                    adminExtended={!!data.urgent_admin_extended}
                    onExtend={() => setExtendTarget('urgent')}
                    rows={[
                        { label: 'Действует до', value: fmtDate(data.urgent_until, true) },
                    ]}
                />
            </div>

            <div className="mt-5">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    История оплат
                </div>
                {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                ) : !payments || payments.length === 0 ? (
                    <p className="py-4 text-center text-sm italic text-muted-foreground">
                        Оплат услуг по этой поездке не было
                    </p>
                ) : (
                    <div className="divide-y divide-border">
                        {payments.map((p) => (
                            <div
                                key={p.id}
                                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="font-medium text-foreground">
                                        {SERVICE_LABELS[p.service_type ?? ''] ??
                                            p.service_type ??
                                            '—'}
                                    </span>
                                    {p.tariff_id && (
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {p.tariff_id}
                                        </Badge>
                                    )}
                                    <Link
                                        href={`/admin/users/${p.user_id}`}
                                        className="truncate text-muted-foreground hover:text-primary hover:underline"
                                    >
                                        {p.user_name || `user #${p.user_id}`}
                                    </Link>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <span className="font-semibold tabular-nums text-foreground">
                                        {p.amount.toLocaleString()} {p.currency ?? ''}
                                    </span>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {fmtDate(p.created_at, true)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={!!extendTarget}
                onOpenChange={(open) => !open && setExtendTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Продлить «{SERVICE_LABELS[extendTarget ?? ''] ?? extendTarget}»
                        </DialogTitle>
                        <DialogDescription>
                            Услуга будет продлена бесплатно от текущей даты окончания (или от
                            сегодняшнего дня, если уже истекла). Поездка получит отметку, что
                            продление сделал админ.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            min={1}
                            max={90}
                            value={extendDays}
                            onChange={(e) => setExtendDays(e.target.value)}
                            className="w-28"
                        />
                        <span className="text-sm text-muted-foreground">дней (1–90)</span>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Отмена</Button>
                        </DialogClose>
                        <Button
                            onClick={submitExtend}
                            disabled={
                                extendService.isPending ||
                                !Number(extendDays) ||
                                Number(extendDays) < 1 ||
                                Number(extendDays) > 90
                            }
                            className="gap-2"
                        >
                            {extendService.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CalendarClock className="h-4 w-4" />
                            )}
                            Продлить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SectionCard>
    )
}

/* ────────────────────────────── page ────────────────────────────── */

export default function AdminTripDetailPage() {
    const params = useParams()
    const router = useRouter()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const { data: trip, isLoading } = useAdminTrip(id)

    const updateStatus = useAdminUpdateTripStatus()
    const deleteTrip = useAdminDeleteTrip()
    const [confirmDelete, setConfirmDelete] = useState(false)

    if (isLoading) {
        return (
            <div className="space-y-6">
                <BackButton />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        )
    }

    if (!trip) {
        return (
            <div className="space-y-6">
                <BackButton />
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                    Поездка не найдена
                </div>
            </div>
        )
    }

    const data = trip.data || {}
    const currencySymbol = trip.currency?.symbol || 'сом'
    const stats = trip.booking_stats
    const driver = trip.user
    const vehicle = trip.vehicle

    const mapsHref =
        trip.from_latitude && trip.to_latitude
            ? `https://www.google.com/maps/dir/${trip.from_latitude},${trip.from_longitude}/${trip.to_latitude},${trip.to_longitude}`
            : null

    const handleStatus = (status: string) => {
        if (status === trip.status) return
        updateStatus.mutate({ id, status })
    }

    const handleDelete = () => {
        deleteTrip.mutate(id, {
            onSuccess: () => {
                setConfirmDelete(false)
                router.push('/admin/trips')
            },
        })
    }

    const busy = updateStatus.isPending || deleteTrip.isPending

    const prefs: Array<{ label: string; on?: boolean }> = [
        { label: 'Звонки', on: data.allow_calls },
        { label: 'Сообщения', on: data.allow_messages },
        { label: 'Бронирование', on: data.allow_booking },
        { label: 'Курение', on: data.pref_smoking_allowed },
        { label: 'Багаж', on: data.pref_baggage_allowed },
        { label: 'От двери до двери', on: data.pref_door_to_door },
        { label: 'Посылки', on: data.pref_takes_packages },
        { label: 'Кондиционер', on: data.pref_air_conditioning },
        { label: 'Багажник на крыше', on: data.pref_roof_box },
        { label: 'Весь салон', on: data.is_full_car },
    ]

    return (
        <div className="space-y-6 pb-10">
            <BackButton />

            {/* ── Hero header (intentionally dark in both themes) ── */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white shadow-lg">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

                <div className="relative flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Hash className="h-4 w-4" />
                            Поездка #{trip.id}
                        </div>
                        <div className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                            <span>{trip.from_location?.name || trip.from_address || '—'}</span>
                            <Navigation className="h-5 w-5 shrink-0 text-emerald-400" />
                            <span>{trip.to_location?.name || trip.to_address || '—'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <StatusPill status={trip.status} />
                            {trip.trip_type && (
                                <Badge className="bg-white/10 capitalize text-white hover:bg-white/15">
                                    {trip.trip_type}
                                </Badge>
                            )}
                            {trip.role && (
                                <Badge className="bg-white/10 capitalize text-white hover:bg-white/15">
                                    {trip.role}
                                </Badge>
                            )}
                            {trip.is_urgent && (
                                <Badge className="gap-1 bg-rose-500/90 text-white hover:bg-rose-500">
                                    <Zap className="h-3 w-3" /> Срочно
                                </Badge>
                            )}
                            {trip.is_auto_bump && (
                                <Badge className="gap-1 bg-amber-500/90 text-white hover:bg-amber-500">
                                    <TrendingUp className="h-3 w-3" /> Авто-подъём
                                </Badge>
                            )}
                            {trip.company_id && (
                                <Badge className="gap-1 bg-white/10 text-white hover:bg-white/15">
                                    <Building2 className="h-3 w-3" /> Компания #{trip.company_id}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    disabled={busy}
                                    className="gap-2 bg-white text-zinc-900 hover:bg-zinc-100"
                                >
                                    {busy ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Settings2 className="h-4 w-4" />
                                    )}
                                    Действия
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel>Сменить статус</DropdownMenuLabel>
                                {STATUS_OPTIONS.map((o) => (
                                    <DropdownMenuItem
                                        key={o.value}
                                        disabled={o.value === trip.status}
                                        onClick={() => handleStatus(o.value)}
                                    >
                                        <o.icon className="mr-2 h-4 w-4" />
                                        {o.label}
                                        {o.value === trip.status && (
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                текущий
                                            </span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-rose-600 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400"
                                    onClick={() => setConfirmDelete(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Удалить
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* ── Booking stat tiles ── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatTile
                    label="Цена"
                    icon={Banknote}
                    accent={ACCENT.emerald}
                    value={trip.price ? `${trip.price} ${currencySymbol}` : '—'}
                />
                <StatTile label="Всего мест" icon={Users} value={trip.seats ?? '—'} />
                <StatTile
                    label="Свободно"
                    icon={Users}
                    accent={ACCENT.blue}
                    value={stats ? stats.seats_left : '—'}
                />
                <StatTile
                    label="Брони"
                    icon={CheckCircle2}
                    accent={ACCENT.emerald}
                    value={stats ? stats.accepted : '—'}
                />
                <StatTile
                    label="Ожидают"
                    icon={Clock}
                    accent={ACCENT.amber}
                    value={stats ? stats.pending : '—'}
                />
                <StatTile
                    label="Просмотры номера"
                    icon={Phone}
                    value={data.phone_view_count ?? 0}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* ── Route (wide) ── */}
                <SectionCard
                    title="Маршрут"
                    icon={MapIcon}
                    className="lg:col-span-2"
                    action={
                        mapsHref ? (
                            <a href={mapsHref} target="_blank" rel="noreferrer">
                                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                                    <ExternalLink className="h-4 w-4" /> На карте
                                </Button>
                            </a>
                        ) : undefined
                    }
                >
                    <div className="relative pl-2">
                        {/* From */}
                        <RoutePoint
                            color="bg-blue-500"
                            label="Откуда"
                            name={trip.from_location?.name}
                            sub={trip.from_location?.sub_name}
                            address={trip.from_address}
                            lat={trip.from_latitude}
                            lng={trip.from_longitude}
                            connector
                        />

                        {/* Waypoints */}
                        {(trip.waypoints || []).map((w: any) => (
                            <RoutePoint
                                key={w.id}
                                color="bg-zinc-400"
                                label={`Промежуточная точка #${w.order}`}
                                name={w.region?.name}
                                sub={w.region?.sub_name}
                                address={w.address}
                                lat={w.latitude}
                                lng={w.longitude}
                                connector
                            />
                        ))}

                        {/* To */}
                        <RoutePoint
                            color="bg-emerald-500"
                            label="Куда"
                            name={trip.to_location?.name}
                            sub={trip.to_location?.sub_name}
                            address={trip.to_address}
                            lat={trip.to_latitude}
                            lng={trip.to_longitude}
                        />
                    </div>
                </SectionCard>

                {/* ── Schedule & meta ── */}
                <SectionCard title="Расписание и сроки" icon={Calendar}>
                    <div className="divide-y divide-border">
                        <InfoRow icon={Calendar} label="Дата выезда">
                            {fmtDate(trip.departure_date)}
                        </InfoRow>
                        <InfoRow icon={Clock} label="Время">
                            {trip.time || '—'}
                        </InfoRow>
                        <InfoRow icon={MapPinned} label="Часовой пояс">
                            {trip.timezone || '—'}
                        </InfoRow>
                        <InfoRow icon={CalendarClock} label="Длительность">
                            {(data.duration_days || 0) > 0 ? `${data.duration_days} дн ` : ''}
                            {(data.duration_hours || 0) > 0 ? `${data.duration_hours} ч` : ''}
                            {!data.duration_days && !data.duration_hours ? '—' : ''}
                        </InfoRow>
                        <InfoRow icon={Clock} label="Истекает">
                            {fmtDate(trip.expire_at, true)}
                        </InfoRow>
                        {data.tg_message_at && (
                            <InfoRow icon={MessageSquare} label="Сообщение в TG">
                                {fmtDate(data.tg_message_at, true)}
                            </InfoRow>
                        )}
                        <InfoRow icon={Calendar} label="Создана">
                            {fmtDate(trip.created_at, true)}
                        </InfoRow>
                        <InfoRow icon={Calendar} label="Обновлена">
                            {fmtDate(trip.updated_at, true)}
                        </InfoRow>
                    </div>
                </SectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ── Driver ── */}
                <SectionCard
                    title="Водитель / Владелец"
                    icon={UserIcon}
                    action={
                        driver ? (
                            <Link href={`/admin/users/${driver.id}`}>
                                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                                    <ExternalLink className="h-4 w-4" /> Профиль
                                </Button>
                            </Link>
                        ) : undefined
                    }
                >
                    {driver ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 ring-2 ring-border">
                                    <AvatarImage src={driver.avatar_thumbnail_url || driver.avatar_url} />
                                    <AvatarFallback className="bg-zinc-900 text-white">
                                        {(driver.full_name || driver.username || '?')
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold text-foreground">
                                        {driver.full_name || driver.username}
                                    </p>
                                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        @{driver.username}
                                        {!!driver.rating && (
                                            <span className="ml-1 inline-flex items-center gap-0.5 text-amber-500">
                                                <Star className="h-3.5 w-3.5 fill-current" />
                                                {driver.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="divide-y divide-border">
                                <InfoRow icon={Phone} label="Телефон">
                                    {driver.phone || trip.phone || '—'}
                                </InfoRow>
                                <InfoRow icon={Mail} label="Email">
                                    {driver.email || '—'}
                                </InfoRow>
                                <InfoRow icon={UserIcon} label="Пол">
                                    <span className="capitalize">{driver.gender || '—'}</span>
                                </InfoRow>
                                <InfoRow icon={Cake} label="Дата рождения">
                                    {fmtDate(driver.birth_date)}
                                </InfoRow>
                                <InfoRow icon={MapPin} label="Город">
                                    {driver.city?.name || '—'}
                                </InfoRow>
                            </div>
                        </div>
                    ) : (
                        <p className="py-6 text-center text-sm italic text-muted-foreground">
                            Нет данных о водителе
                        </p>
                    )}
                </SectionCard>

                {/* ── Vehicle ── */}
                <SectionCard
                    title="Транспорт"
                    icon={Car}
                    action={
                        vehicle ? (
                            <Link href={`/admin/vehicles/${vehicle.id}`}>
                                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                                    <ExternalLink className="h-4 w-4" /> Открыть
                                </Button>
                            </Link>
                        ) : undefined
                    }
                >
                    {vehicle ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-700">
                                    <Car className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-foreground">
                                        {vehicle.brand} {vehicle.model}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {vehicle.year || '—'} ·{' '}
                                        <span className="capitalize">{vehicle.vehicle_type || '—'}</span>
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="divide-y divide-border">
                                <InfoRow label="Гос. номер">
                                    {vehicle.plate_number ? (
                                        <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono tracking-wider">
                                            {vehicle.plate_number}
                                        </span>
                                    ) : (
                                        '—'
                                    )}
                                </InfoRow>
                                <InfoRow label="Цвет">
                                    <span className="capitalize">{vehicle.color || '—'}</span>
                                </InfoRow>
                            </div>
                        </div>
                    ) : (
                        <p className="py-6 text-center text-sm italic text-muted-foreground">
                            Нет данных о транспорте
                        </p>
                    )}
                </SectionCard>
            </div>

            {/* ── Promo services ── */}
            <TripServicesCard tripId={id} data={data} />

            {/* ── Preferences / options ── */}
            <SectionCard title="Опции и предпочтения" icon={Settings2}>
                <div className="flex flex-wrap gap-2">
                    {prefs.map((p) => (
                        <FlagBadge key={p.label} on={p.on} label={p.label} />
                    ))}
                </div>
            </SectionCard>

            {/* ── Recurring schedules ── */}
            {Array.isArray(trip.schedules) && trip.schedules.length > 0 && (
                <SectionCard title="Регулярные рейсы" icon={Repeat}>
                    <div className="flex flex-wrap gap-2">
                        {trip.schedules.map((s: any) => (
                            <div
                                key={s.id}
                                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm"
                            >
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium text-foreground">{fmtDate(s.date)}</span>
                                {s.time && <span className="text-muted-foreground">· {s.time}</span>}
                                {s.seats != null && (
                                    <span className="text-muted-foreground">· {s.seats} мест</span>
                                )}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* ── Comment ── */}
            {trip.comment && (
                <SectionCard title="Комментарий" icon={MessageSquare}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {trip.comment}
                    </p>
                </SectionCard>
            )}

            {/* ── Source (parsed ads) ── */}
            {trip.source && (
                <SectionCard title="Источник (парсер)" icon={Rss}>
                    <div className="space-y-3 text-sm">
                        {trip.author && (
                            <SourceAuthorControl tripId={id} author={trip.author} />
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                            {trip.source.channel &&
                                (trip.source.channel_url ? (
                                    <a
                                        href={trip.source.channel_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 font-medium hover:underline"
                                    >
                                        @{trip.source.channel}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                ) : (
                                    <span className="font-medium">{trip.source.channel}</span>
                                ))}
                            {data.parser && (
                                <Badge variant="secondary" className="uppercase">
                                    {data.parser}
                                </Badge>
                            )}
                            {trip.source.kind && (
                                <Badge variant="outline">{trip.source.kind}</Badge>
                            )}
                        </div>

                        {trip.source.message_url && (
                            <a
                                href={trip.source.message_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                                <ExternalLink className="h-4 w-4" /> Открыть сообщение в Telegram
                            </a>
                        )}

                        {trip.remote_id && (
                            <div className="font-mono text-xs text-muted-foreground">
                                {trip.remote_id}
                            </div>
                        )}

                        {data.original_message && (
                            <div>
                                <div className="mb-1 text-xs uppercase text-muted-foreground">
                                    Исходный текст
                                </div>
                                <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-sm leading-relaxed">
                                    {data.original_message}
                                </p>
                            </div>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* ── Phone viewers ── */}
            <PhoneViewersCard tripId={id} />

            {/* ── Delete confirm ── */}
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить поездку #{trip.id}?</DialogTitle>
                        <DialogDescription>
                            Поездка будет помечена как удалённая и отправлена в архив. Это действие убирает
                            её из всех списков.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Отмена</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteTrip.isPending}
                            className="gap-2"
                        >
                            {deleteTrip.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

/* ────────────────────────────── route point ────────────────────────────── */

function RoutePoint({
    color,
    label,
    name,
    sub,
    address,
    lat,
    lng,
    connector = false,
}: {
    color: string
    label: string
    name?: string | null
    sub?: string | null
    address?: string | null
    lat?: number | null
    lng?: number | null
    connector?: boolean
}) {
    return (
        <div className="relative flex gap-4 pb-6 last:pb-0">
            {connector && (
                <span className="absolute left-[7px] top-5 h-full w-px bg-border" />
            )}
            <span className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full ${color} ring-4 ring-card`} />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold text-foreground">
                    {name || address || 'Неизвестно'}
                    {sub && <span className="ml-2 text-sm font-normal text-muted-foreground">{sub}</span>}
                </p>
                {address && name && <p className="text-sm text-muted-foreground">{address}</p>}
                {lat != null && lng != null && (
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                    </p>
                )}
            </div>
        </div>
    )
}
