'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAdminTrips } from '@/hooks/queries/admin'
import { useDebounce } from '@doska/shared'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@doska/ui"
import { Trash2, Eye, MapPin, User, Phone, Star, X, RefreshCw } from 'lucide-react'
import { Link } from '@doska/i18n'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"
import { format } from 'date-fns'
import { UserCombobox } from '@/components/admin/selectors/UserCombobox'

const ALL = '__all__'
const TRIP_STATUSES = ['active', 'processing', 'completed', 'cancelled', 'archived']
const TRIP_TYPES = ['rideshare', 'rideshare_city', 'taxi', 'shuttle', 'bus', 'freight', 'freight_city', 'delivery']
const TRIP_ROLES = ['driver', 'passenger', 'cargo_owner']

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
    const searchParams = useSearchParams()
    const userIdParam = searchParams.get('user_id')

    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)
    const [status, setStatus] = useState<string>(ALL)
    const [tripType, setTripType] = useState<string>(ALL)
    const [role, setRole] = useState<string>(ALL)
    const [userId, setUserId] = useState<number | null>(userIdParam ? Number(userIdParam) : null)
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    const { data: trips, isLoading, isFetching, refetch } = useAdminTrips(
        page,
        size,
        dq || undefined,
        status === ALL ? undefined : status,
        {
            trip_type: tripType === ALL ? undefined : tripType,
            role: role === ALL ? undefined : role,
            user_id: userId ?? undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        },
    )
    const deleteTripMutation = useAdminDeleteTrip()

    const handleDelete = (id: number) => {
        if (confirm(`Are you sure you want to delete this trip (ID: ${id})?`)) {
            deleteTripMutation.mutate(id)
        }
    }

    const resetFilters = () => {
        setQ('')
        setStatus(ALL)
        setTripType(ALL)
        setRole(ALL)
        setUserId(null)
        setDateFrom('')
        setDateTo('')
        setPage(1)
    }

    const hasActiveFilters =
        !!q ||
        status !== ALL ||
        tripType !== ALL ||
        role !== ALL ||
        userId !== null ||
        !!dateFrom ||
        !!dateTo

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
                                value={userId}
                                onChange={(id) => {
                                    setUserId(id)
                                    setPage(1)
                                }}
                                placeholder="Все пользователи"
                                allowClear
                            />
                        </div>
                        <Input
                            placeholder="Поиск по телефону/id…"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value)
                                setPage(1)
                            }}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={status}
                            onValueChange={(v) => {
                                setStatus(v)
                                setPage(1)
                            }}
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
                            value={tripType}
                            onValueChange={(v) => {
                                setTripType(v)
                                setPage(1)
                            }}
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
                            value={role}
                            onValueChange={(v) => {
                                setRole(v)
                                setPage(1)
                            }}
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
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Дата от</span>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value)
                                    setPage(1)
                                }}
                                className="w-full sm:w-40"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Дата до</span>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value)
                                    setPage(1)
                                }}
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
                            onPageChange={setPage}
                            onSizeChange={setSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
