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
import { Trash2, Eye, MapPin, User, Phone, Star, X, RefreshCw } from 'lucide-react'
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

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    status: ALL,
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
    only_real: true,
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
            only_real: values.only_real,
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
        !values.only_real

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Trips</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Trip Management</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-2">
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
                        <div className="flex h-10 items-center gap-2 rounded-md border px-3">
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
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Откуда</span>
                            <div className="w-full sm:w-44">
                                <RegionCombobox
                                    value={values.from_location_id || null}
                                    onChange={(id) => setValues({ from_location_id: id ?? 0 })}
                                    placeholder="Откуда"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Куда</span>
                            <div className="w-full sm:w-44">
                                <RegionCombobox
                                    value={values.to_location_id || null}
                                    onChange={(id) => setValues({ to_location_id: id ?? 0 })}
                                    placeholder="Куда"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Цена</span>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="от"
                                    value={priceMinInput}
                                    onChange={(e) => setPriceMinInput(e.target.value)}
                                    className="w-24"
                                />
                                <span className="text-muted-foreground">—</span>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="до"
                                    value={priceMaxInput}
                                    onChange={(e) => setPriceMaxInput(e.target.value)}
                                    className="w-24"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Места</span>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="от"
                                    value={seatsMinInput}
                                    onChange={(e) => setSeatsMinInput(e.target.value)}
                                    className="w-20"
                                />
                                <span className="text-muted-foreground">—</span>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="до"
                                    value={seatsMaxInput}
                                    onChange={(e) => setSeatsMaxInput(e.target.value)}
                                    className="w-20"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Дата от</span>
                            <Input
                                type="date"
                                value={values.date_from}
                                onChange={(e) => setValues({ date_from: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
                        <div className="flex flex-col">
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
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>From - To</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type / Role</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Seats</TableHead>
                                    <TableHead>Bookings</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trips?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center text-muted-foreground py-6">
                                            Ничего не найдено
                                        </TableCell>
                                    </TableRow>
                                )}
                                {trips?.items.map((trip: any) => (
                                    <TableRow key={trip.id}>
                                        <TableCell>{trip.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="flex items-center text-sm">
                                                    <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                                                    {trip.from_location?.name || trip.from_address || 'Unknown'}
                                                </span>
                                                <span className="flex items-center text-sm">
                                                    <MapPin className="h-3 w-3 mr-1 text-green-500" />
                                                    {trip.to_location?.name || trip.to_address || 'Unknown'}
                                                </span>
                                            </div>
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
                                                <span>
                                                    {trip.departure_date ? format(new Date(trip.departure_date), 'dd.MM.yyyy') : 'N/A'}
                                                </span>
                                                {trip.time && (
                                                    <span className="text-muted-foreground">{String(trip.time).slice(0, 5)}</span>
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
                                            {trip.price != null
                                                ? `${trip.price} ${trip.currency?.symbol || trip.currency?.code || ''}`.trim()
                                                : '—'}
                                        </TableCell>
                                        <TableCell>{trip.seats ?? '—'}</TableCell>
                                        <TableCell>
                                            {trip.booking_stats ? (
                                                <div className="flex flex-col text-xs">
                                                    <span className="text-green-700">✓ {trip.booking_stats.accepted}</span>
                                                    {trip.booking_stats.pending > 0 && (
                                                        <span className="text-yellow-700">⧗ {trip.booking_stats.pending}</span>
                                                    )}
                                                    <span className="text-muted-foreground">
                                                        мест: {trip.booking_stats.seats_left}
                                                    </span>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${statusClass(trip.status)}`}>
                                                {trip.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {trip.created_at ? format(new Date(trip.created_at), 'dd.MM.yyyy HH:mm') : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/admin/trips/${trip.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(trip.id)}
                                                    disabled={deleteTripMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
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
