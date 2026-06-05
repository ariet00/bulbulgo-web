'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter, Link } from '@doska/i18n'
import { useAdminTrip } from '@/hooks/queries/admin'
import { useAdminUpdateTripStatus, useAdminDeleteTrip } from '@/hooks/mutations/admin'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    BackButton,
    Badge,
    Button,
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
    Map as MapIcon,
    CalendarClock,
    Repeat,
    Cake,
    MapPinned,
} from 'lucide-react'
import { format } from 'date-fns'

/* ────────────────────────────── helpers ────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    processing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    archived: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20',
}

const STATUS_OPTIONS = [
    { value: 'active', label: 'Активировать', icon: Play },
    { value: 'processing', label: 'В обработку', icon: Loader2 },
    { value: 'completed', label: 'Завершить', icon: CheckCircle2 },
    { value: 'cancelled', label: 'Отменить', icon: XCircle },
    { value: 'archived', label: 'В архив', icon: Archive },
]

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
            <span className="flex items-center gap-2 text-sm text-zinc-500">
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {label}
            </span>
            <span className="text-right text-sm font-medium text-zinc-900">{children}</span>
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
        <Card className={`overflow-hidden border-zinc-200/80 shadow-sm ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-zinc-100 bg-zinc-50/60 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-800">
                    <Icon className="h-[18px] w-[18px] text-zinc-500" />
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
    accent = 'text-zinc-900',
    icon: Icon,
}: {
    label: string
    value: React.ReactNode
    accent?: string
    icon: React.ElementType
}) {
    return (
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
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
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-zinc-100 text-zinc-400 line-through decoration-zinc-300'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
            {label}
        </span>
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
                <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-400">
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

            {/* ── Hero header ── */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white shadow-lg">
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
                                            <span className="ml-auto text-xs text-zinc-400">текущий</span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-rose-600 focus:text-rose-600"
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <StatTile
                    label="Цена"
                    icon={Banknote}
                    accent="text-emerald-600"
                    value={trip.price ? `${trip.price} ${currencySymbol}` : '—'}
                />
                <StatTile label="Всего мест" icon={Users} value={trip.seats ?? '—'} />
                <StatTile
                    label="Свободно"
                    icon={Users}
                    accent="text-blue-600"
                    value={stats ? stats.seats_left : '—'}
                />
                <StatTile
                    label="Брони"
                    icon={CheckCircle2}
                    accent="text-emerald-600"
                    value={stats ? stats.accepted : '—'}
                />
                <StatTile
                    label="Ожидают"
                    icon={Clock}
                    accent="text-amber-600"
                    value={stats ? stats.pending : '—'}
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
                                <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-500">
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
                    <div className="divide-y divide-zinc-100">
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
                                <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-500">
                                    <ExternalLink className="h-4 w-4" /> Профиль
                                </Button>
                            </Link>
                        ) : undefined
                    }
                >
                    {driver ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 ring-2 ring-zinc-100">
                                    <AvatarImage src={driver.avatar_thumbnail_url || driver.avatar_url} />
                                    <AvatarFallback className="bg-zinc-900 text-white">
                                        {(driver.full_name || driver.username || '?')
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold text-zinc-900">
                                        {driver.full_name || driver.username}
                                    </p>
                                    <p className="flex items-center gap-1.5 text-sm text-zinc-500">
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
                            <div className="divide-y divide-zinc-100">
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
                        <p className="py-6 text-center text-sm italic text-zinc-400">Нет данных о водителе</p>
                    )}
                </SectionCard>

                {/* ── Vehicle ── */}
                <SectionCard
                    title="Транспорт"
                    icon={Car}
                    action={
                        vehicle ? (
                            <Link href={`/admin/vehicles/${vehicle.id}`}>
                                <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-500">
                                    <ExternalLink className="h-4 w-4" /> Открыть
                                </Button>
                            </Link>
                        ) : undefined
                    }
                >
                    {vehicle ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-white">
                                    <Car className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-zinc-900">
                                        {vehicle.brand} {vehicle.model}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {vehicle.year || '—'} · <span className="capitalize">{vehicle.vehicle_type || '—'}</span>
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="divide-y divide-zinc-100">
                                <InfoRow label="Гос. номер">
                                    {vehicle.plate_number ? (
                                        <span className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-0.5 font-mono tracking-wider">
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
                        <p className="py-6 text-center text-sm italic text-zinc-400">Нет данных о транспорте</p>
                    )}
                </SectionCard>
            </div>

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
                                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm"
                            >
                                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                <span className="font-medium text-zinc-800">{fmtDate(s.date)}</span>
                                {s.time && <span className="text-zinc-500">· {s.time}</span>}
                                {s.seats != null && (
                                    <span className="text-zinc-400">· {s.seats} мест</span>
                                )}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* ── Comment ── */}
            {trip.comment && (
                <SectionCard title="Комментарий" icon={MessageSquare}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                        {trip.comment}
                    </p>
                </SectionCard>
            )}

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
                <span className="absolute left-[7px] top-5 h-full w-px bg-gradient-to-b from-zinc-300 to-zinc-200" />
            )}
            <span className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full ${color} ring-4 ring-white`} />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</p>
                <p className="text-lg font-semibold text-zinc-900">
                    {name || address || 'Неизвестно'}
                    {sub && <span className="ml-2 text-sm font-normal text-zinc-400">{sub}</span>}
                </p>
                {address && name && <p className="text-sm text-zinc-500">{address}</p>}
                {lat != null && lng != null && (
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-zinc-400">
                        <MapPin className="h-3 w-3" />
                        {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                    </p>
                )}
            </div>
        </div>
    )
}
