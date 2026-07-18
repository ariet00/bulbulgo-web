'use client'

import { useEffect, useState } from 'react'
import { useAdminTrips } from '@/hooks/queries/admin'
import { useDebounce } from '@doska/shared'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useAdminDeleteTrip } from '@/hooks/mutations/admin'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@doska/ui"
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from "@doska/ui"
import { Trash2, Eye, MapPin, User, Phone, Star, X, RefreshCw, Ban, BarChart3, Zap, Flame } from 'lucide-react'
import { Link } from '@doska/i18n'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"
import { format } from 'date-fns'
import { UserCombobox } from '@/components/admin/selectors/UserCombobox'
import { RegionCombobox } from '@/components/admin/selectors/RegionCombobox'

const ALL = '__all__'
const TRIP_STATUSES = ['active', 'processing', 'completed', 'cancelled', 'archived']
const TRIP_TYPES = ['rideshare', 'rideshare_city', 'taxi', 'shuttle', 'bus', 'freight', 'freight_city', 'delivery']
const TRIP_ROLES = ['driver', 'passenger', 'cargo_owner']
const SERVICE_OPTIONS = [
    { value: 'any', label: 'Любая активная' },
    { value: 'auto_bump', label: 'Авто-подъём (активен)' },
    { value: 'urgent', label: 'Срочно (активен)' },
    { value: 'ever', label: 'Когда-либо подключали' },
]

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    status: 'active',
    trip_type: ALL,
    role: ALL,
    user_id: 0,
    from_location_id: 0,
    to_location_id: 0,
    price_min: 0,
    price_max: 0,
    seats_min: 0,
    seats_max: 0,
    date_from: '',
    date_to: '',
    service: ALL,
    only_real: true,
    include_deleted: true,
}

// Подключённые платные услуги объявления (живут в trip.data). Услуга с
// истёкшим `*_until` показывается погашенной.
const tripServices = (trip: any) => {
    const now = Date.now()
    const services: Array<{
        key: string
        label: string
        icon: 'zap' | 'flame'
        active: boolean
        until: string | null
    }> = []
    if (trip.data?.is_auto_bump) {
        const until = trip.data.auto_bump_until ?? null
        services.push({
            key: 'auto_bump',
            label: 'авто-подъём',
            icon: 'zap',
            active: !until || new Date(until).getTime() > now,
            until,
        })
    }
    if (trip.data?.is_urgent) {
        const until = trip.data.urgent_until ?? null
        services.push({
            key: 'urgent',
            label: 'срочно',
            icon: 'flame',
            active: !until || new Date(until).getTime() > now,
            until,
        })
    }
    return services
}

function ServiceBadges({ trip }: { trip: any }) {
    const services = tripServices(trip)
    if (services.length === 0) return <span className="text-muted-foreground">—</span>
    return (
        <div className="flex flex-wrap gap-1">
            {services.map(s => (
                <span
                    key={s.key}
                    title={
                        s.until
                            ? `${s.active ? 'до' : 'истекла'} ${format(new Date(s.until), 'dd.MM.yyyy HH:mm')}`
                            : undefined
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
                        s.active
                            ? s.key === 'urgent'
                                ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-muted text-muted-foreground line-through'
                    }`}
                >
                    {s.icon === 'zap' ? (
                        <Zap className="h-3 w-3" />
                    ) : (
                        <Flame className="h-3 w-3" />
                    )}
                    {s.label}
                </span>
            ))}
        </div>
    )
}

const statusClass = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800'
        case 'processing':
            return 'bg-yellow-100 text-yellow-800'
        case 'completed':
            return 'bg-blue-100 text-blue-800'
        case 'cancelled':
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

export default function AdminTripsPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    // Debounced text/number inputs keep a local mirror for snappy typing;
    // the URL (via setValues) is updated only after the debounce settles.
    const [qInput, setQInput] = useState(values.q)
    const [priceMinInput, setPriceMinInput] = useState(values.price_min ? String(values.price_min) : '')
    const [priceMaxInput, setPriceMaxInput] = useState(values.price_max ? String(values.price_max) : '')
    const [seatsMinInput, setSeatsMinInput] = useState(values.seats_min ? String(values.seats_min) : '')
    const [seatsMaxInput, setSeatsMaxInput] = useState(values.seats_max ? String(values.seats_max) : '')

    const dq = useDebounce(qInput, 300)
    const dPriceMin = useDebounce(priceMinInput, 400)
    const dPriceMax = useDebounce(priceMaxInput, 400)
    const dSeatsMin = useDebounce(seatsMinInput, 400)
    const dSeatsMax = useDebounce(seatsMaxInput, 400)

    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])
    useEffect(() => {
        const n = dPriceMin === '' ? 0 : Number(dPriceMin)
        if (n !== values.price_min) setValues({ price_min: n })
    }, [dPriceMin, values.price_min, setValues])
    useEffect(() => {
        const n = dPriceMax === '' ? 0 : Number(dPriceMax)
        if (n !== values.price_max) setValues({ price_max: n })
    }, [dPriceMax, values.price_max, setValues])
    useEffect(() => {
        const n = dSeatsMin === '' ? 0 : Number(dSeatsMin)
        if (n !== values.seats_min) setValues({ seats_min: n })
    }, [dSeatsMin, values.seats_min, setValues])
    useEffect(() => {
        const n = dSeatsMax === '' ? 0 : Number(dSeatsMax)
        if (n !== values.seats_max) setValues({ seats_max: n })
    }, [dSeatsMax, values.seats_max, setValues])

    const { data: trips, isLoading, isFetching, refetch } = useAdminTrips(
        values.page,
        values.size,
        values.q || undefined,
        values.status === ALL ? undefined : values.status,
        {
            trip_type: values.trip_type === ALL ? undefined : values.trip_type,
            role: values.role === ALL ? undefined : values.role,
            user_id: values.user_id || undefined,
            from_location_id: values.from_location_id || undefined,
            to_location_id: values.to_location_id || undefined,
            price_min: values.price_min || undefined,
            price_max: values.price_max || undefined,
            seats_min: values.seats_min || undefined,
            seats_max: values.seats_max || undefined,
            date_from: values.date_from || undefined,
            date_to: values.date_to || undefined,
            service: values.service === ALL ? undefined : values.service,
            only_real: values.only_real,
            include_deleted: values.include_deleted,
        },
    )
    const deleteTripMutation = useAdminDeleteTrip()

    const handleDelete = (id: number) => {
        if (confirm(`Are you sure you want to delete this trip (ID: ${id})?`)) {
            deleteTripMutation.mutate(id)
        }
    }

    const resetFilters = () => {
        setQInput('')
        setPriceMinInput('')
        setPriceMaxInput('')
        setSeatsMinInput('')
        setSeatsMaxInput('')
        reset()
    }

    const hasActiveFilters =
        !!values.q ||
        values.status !== ALL ||
        values.trip_type !== ALL ||
        values.role !== ALL ||
        !!values.user_id ||
        !!values.from_location_id ||
        !!values.to_location_id ||
        !!values.price_min ||
        !!values.price_max ||
        !!values.seats_min ||
        !!values.seats_max ||
        !!values.date_from ||
        !!values.date_to ||
        values.service !== ALL ||
        !values.only_real ||
        values.include_deleted

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Trips</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Trip Management</CardTitle>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/analytics/bulbulgo">
                            <Button variant="outline" size="sm" title="Аналитика BulBul Go">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Аналитика
                            </Button>
                        </Link>
                        <Link href="/admin/trips/blocked-authors">
                            <Button variant="outline" size="icon" title="Заблокированные ТГ аккаунты">
                                <Ban className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            title="Обновить"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                        <div className="w-full sm:w-64">
                            <UserCombobox
                                value={values.user_id || null}
                                onChange={(id) => setValues({ user_id: id ?? 0 })}
                                placeholder="Все пользователи"
                                allowClear
                            />
                        </div>
                        <Input
                            placeholder="Поиск по телефону/id…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.status}
                            onValueChange={(v) => setValues({ status: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                {TRIP_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.trip_type}
                            onValueChange={(v) => setValues({ trip_type: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все типы</SelectItem>
                                {TRIP_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="capitalize">
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.role}
                            onValueChange={(v) => setValues({ role: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Роль" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все роли</SelectItem>
                                {TRIP_ROLES.map((r) => (
                                    <SelectItem key={r} value={r} className="capitalize">
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.service}
                            onValueChange={(v) => setValues({ service: v })}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Услуги" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Услуги: не важно</SelectItem>
                                {SERVICE_OPTIONS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex h-10 w-full items-center gap-2 rounded-md border px-3 sm:w-auto">
                            <Switch
                                id="only-real"
                                checked={values.only_real}
                                onCheckedChange={(v) => setValues({ only_real: v })}
                            />
                            <Label
                                htmlFor="only-real"
                                className="cursor-pointer whitespace-nowrap text-sm"
                                title="Скрыть объявления, созданные парсером (chat_parser_user, gettik_parser_user)"
                            >
                                Только реальные
                            </Label>
                        </div>
                        <div className="flex h-10 w-full items-center gap-2 rounded-md border px-3 sm:w-auto">
                            <Switch
                                id="include-deleted"
                                checked={values.include_deleted}
                                onCheckedChange={(v) => setValues({ include_deleted: v })}
                            />
                            <Label
                                htmlFor="include-deleted"
                                className="cursor-pointer whitespace-nowrap text-sm"
                            >
                                Показывать удалённые
                            </Label>
                        </div>
                        <div className="flex w-full flex-col sm:w-auto">
                            <span className="text-xs text-muted-foreground mb-1">Откуда</span>
                            <div className="w-full sm:w-44">
                                <RegionCombobox
                                    value={values.from_location_id || null}
                                    onChange={(id) => setValues({ from_location_id: id ?? 0 })}
                                    placeholder="Откуда"
                                />
                            </div>
                        </div>
                        <div className="flex w-full flex-col sm:w-auto">
                            <span className="text-xs text-muted-foreground mb-1">Куда</span>
                            <div className="w-full sm:w-44">
                                <RegionCombobox
                                    value={values.to_location_id || null}
                                    onChange={(id) => setValues({ to_location_id: id ?? 0 })}
                                    placeholder="Куда"
                                />
                            </div>
                        </div>
                        <div className="flex w-full flex-col sm:w-auto">
                            <span className="text-xs text-muted-foreground mb-1">Цена</span>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="от"
                                    value={priceMinInput}
                                    onChange={(e) => setPriceMinInput(e.target.value)}
                                    className="flex-1 sm:flex-none sm:w-24"
                                />
                                <span className="text-muted-foreground">—</span>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="до"
                                    value={priceMaxInput}
                                    onChange={(e) => setPriceMaxInput(e.target.value)}
                                    className="flex-1 sm:flex-none sm:w-24"
                                />
                            </div>
                        </div>
                        <div className="flex w-full flex-col sm:w-auto">
                            <span className="text-xs text-muted-foreground mb-1">Места</span>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="от"
                                    value={seatsMinInput}
                                    onChange={(e) => setSeatsMinInput(e.target.value)}
                                    className="flex-1 sm:flex-none sm:w-20"
                                />
                                <span className="text-muted-foreground">—</span>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="до"
                                    value={seatsMaxInput}
                                    onChange={(e) => setSeatsMaxInput(e.target.value)}
                                    className="flex-1 sm:flex-none sm:w-20"
                                />
                            </div>
                        </div>
                        <div className="flex w-full flex-col sm:w-auto">
                            <span className="text-xs text-muted-foreground mb-1">Дата от</span>
                            <Input
                                type="date"
                                value={values.date_from}
                                onChange={(e) => setValues({ date_from: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
                        <div className="flex w-full flex-col sm:w-auto">
                            <span className="text-xs text-muted-foreground mb-1">Дата до</span>
                            <Input
                                type="date"
                                value={values.date_to}
                                onChange={(e) => setValues({ date_to: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Сбросить
                            </Button>
                        )}
                    </div>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                    <>
                    {/* Mobile: cards */}
                    <div className="space-y-3 md:hidden">
                        {trips?.items.length === 0 && (
                            <div className="rounded-md border py-6 text-center text-muted-foreground">
                                Ничего не найдено
                            </div>
                        )}
                        {trips?.items.map((trip: any) => (
                            <div key={trip.id} className="rounded-md border p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <Link
                                        href={`/admin/trips/${trip.id}`}
                                        className="flex flex-col text-sm min-w-0 hover:underline"
                                    >
                                        <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1 shrink-0 text-blue-500" />
                                            <span className="truncate">
                                                {trip.from_location?.name || trip.from_address || 'Unknown'}
                                            </span>
                                        </span>
                                        <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1 shrink-0 text-green-500" />
                                            <span className="truncate">
                                                {trip.to_location?.name || trip.to_address || 'Unknown'}
                                            </span>
                                        </span>
                                    </Link>
                                    {trip.is_deleted ? (
                                        <span className="shrink-0 px-2 py-1 rounded-full text-xs bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900">
                                            Удален
                                        </span>
                                    ) : (
                                        <span className={`shrink-0 px-2 py-1 rounded-full text-xs ${statusClass(trip.status)}`}>
                                            {trip.status}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                    <span className="text-muted-foreground">#{trip.id}</span>
                                    <span>
                                        {trip.departure_date ? format(new Date(trip.departure_date), 'dd.MM.yyyy') : 'N/A'}
                                        {trip.time ? ` ${String(trip.time).slice(0, 5)}` : ''}
                                    </span>
                                    <span className="capitalize text-muted-foreground">
                                        {trip.trip_type || '—'} / {trip.role}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                    <span className="font-medium">
                                        {trip.price != null
                                            ? `${trip.price} ${trip.currency?.symbol || trip.currency?.code || ''}`.trim()
                                            : 'Цена: —'}
                                    </span>
                                    {trip.seats != null && (
                                        <span className="text-muted-foreground">мест: {trip.seats}</span>
                                    )}
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                        title="Просмотры номера телефона"
                                    >
                                        <Phone className="h-3 w-3" />
                                        {trip.data?.phone_view_count ?? 0}
                                    </span>
                                    {tripServices(trip).length > 0 && <ServiceBadges trip={trip} />}
                                </div>
                                <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                                    <span title="Создано">
                                        {trip.created_at ? format(new Date(trip.created_at), 'dd.MM.yyyy HH:mm') : '—'}
                                    </span>
                                    {trip.updated_at && trip.updated_at !== trip.created_at && (
                                        <span title="Обновлено">
                                            ↻ {format(new Date(trip.updated_at), 'dd.MM.yyyy HH:mm')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-2 pt-1 border-t">
                                    <div className="flex flex-col text-sm min-w-0">
                                        {trip.user_id ? (
                                            <Link
                                                href={`/admin/users/${trip.user_id}`}
                                                className="flex items-center text-blue-600 hover:underline"
                                            >
                                                <User className="h-3 w-3 mr-1 shrink-0" />
                                                <span className="truncate">
                                                    {trip.user?.full_name || trip.user?.name || trip.user?.username || `#${trip.user_id}`}
                                                </span>
                                            </Link>
                                        ) : (
                                            <span className="flex items-center">
                                                <User className="h-3 w-3 mr-1 shrink-0 text-muted-foreground" />
                                                <span className="truncate">
                                                    {trip.user?.full_name || trip.user?.name || trip.user?.username || '—'}
                                                </span>
                                            </span>
                                        )}
                                        {(trip.phone || trip.user?.phone) && (
                                            <span className="flex items-center text-muted-foreground">
                                                <Phone className="h-3 w-3 mr-1 shrink-0" />
                                                {trip.phone || trip.user?.phone}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 space-x-2">
                                        <Link href={`/admin/trips/${trip.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        {!trip.is_deleted && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(trip.id)}
                                                disabled={deleteTripMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Desktop: table */}
                    <div className="hidden md:block rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Trip</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Type / Role</TableHead>
                                    <TableHead>Price / Seats</TableHead>
                                    <TableHead title="Просмотры номера телефона">
                                        <span className="flex items-center whitespace-nowrap">
                                            <Phone className="h-3 w-3 mr-1" />
                                            Views
                                        </span>
                                    </TableHead>
                                    <TableHead title="Подключённые платные услуги">Услуги</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created / Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trips?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                                            Ничего не найдено
                                        </TableCell>
                                    </TableRow>
                                )}
                                {trips?.items.map((trip: any) => (
                                    <TableRow key={trip.id}>
                                        <TableCell>{trip.id}</TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/admin/trips/${trip.id}`}
                                                className="flex flex-col hover:underline"
                                            >
                                                <span className="flex items-center text-sm">
                                                    <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                                                    {trip.from_location?.name || trip.from_address || 'Unknown'}
                                                </span>
                                                <span className="flex items-center text-sm">
                                                    <MapPin className="h-3 w-3 mr-1 text-green-500" />
                                                    {trip.to_location?.name || trip.to_address || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {trip.departure_date ? format(new Date(trip.departure_date), 'dd.MM.yyyy') : 'N/A'}
                                                    {trip.time ? ` ${String(trip.time).slice(0, 5)}` : ''}
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                {trip.user_id ? (
                                                    <Link
                                                        href={`/admin/users/${trip.user_id}`}
                                                        className="flex items-center text-blue-600 hover:underline"
                                                    >
                                                        <User className="h-3 w-3 mr-1" />
                                                        {trip.user?.full_name || trip.user?.name || trip.user?.username || `#${trip.user_id}`}
                                                    </Link>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <User className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        {trip.user?.full_name || trip.user?.name || trip.user?.username || '—'}
                                                    </span>
                                                )}
                                                {(trip.phone || trip.user?.phone) && (
                                                    <span className="flex items-center text-muted-foreground">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {trip.phone || trip.user?.phone}
                                                    </span>
                                                )}
                                                {!!trip.user?.rating && (
                                                    <span className="flex items-center text-muted-foreground">
                                                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                                        {trip.user.rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="capitalize">{trip.trip_type || '—'}</span>
                                                <span className="capitalize text-muted-foreground">{trip.role}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex flex-col text-sm">
                                                <span>
                                                    {trip.price != null
                                                        ? `${trip.price} ${trip.currency?.symbol || trip.currency?.code || ''}`.trim()
                                                        : '—'}
                                                </span>
                                                {trip.seats != null && (
                                                    <span className="text-xs text-muted-foreground">мест: {trip.seats}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {trip.data?.phone_view_count ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                    <Phone className="h-3 w-3" />
                                                    {trip.data.phone_view_count}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">0</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <ServiceBadges trip={trip} />
                                        </TableCell>
                                        <TableCell>
                                            {trip.is_deleted ? (
                                                <span className="px-2 py-1 rounded-full text-xs bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900">
                                                    Удален
                                                </span>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-full text-xs ${statusClass(trip.status)}`}>
                                                    {trip.status}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            <div className="flex flex-col text-xs">
                                                <span title="Создано">
                                                    {trip.created_at ? format(new Date(trip.created_at), 'dd.MM.yyyy HH:mm') : '—'}
                                                </span>
                                                {trip.updated_at && trip.updated_at !== trip.created_at && (
                                                    <span title="Обновлено">
                                                        ↻ {format(new Date(trip.updated_at), 'dd.MM.yyyy HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    </>
                    )}
                    {trips && (
                        <Pagination
                            page={trips.page}
                            total={trips.total}
                            size={trips.size}
                            onPageChange={(p) => setValues({ page: p })}
                            onSizeChange={(s) => setValues({ size: s })}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
