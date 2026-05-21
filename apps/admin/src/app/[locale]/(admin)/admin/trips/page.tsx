'use client'

import { useState } from 'react'
import { useAdminTrips, useDebounce } from '@doska/shared'
import { useAdminDeleteTrip } from '@doska/shared'
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
import { Trash2, Eye, MapPin } from 'lucide-react'
import { Link } from '@doska/i18n'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"
import { format } from 'date-fns'

const ALL = '__all__'
const TRIP_STATUSES = ['active', 'processing', 'completed', 'cancelled', 'archived']

export default function AdminTripsPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)
    const [status, setStatus] = useState<string>(ALL)
    const { data: trips, isLoading } = useAdminTrips(
        page,
        size,
        dq || undefined,
        status === ALL ? undefined : status,
    )
    const deleteTripMutation = useAdminDeleteTrip()

    const handleDelete = (id: number) => {
        if (confirm(`Are you sure you want to delete this trip (ID: ${id})?`)) {
            deleteTripMutation.mutate(id)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Trips</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Trip Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Input
                            placeholder="Поиск по телефону/id…"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value)
                                setPage(1)
                            }}
                            className="max-w-xs"
                        />
                        <Select
                            value={status}
                            onValueChange={(v) => {
                                setStatus(v)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-44">
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
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trips?.items.map((trip: any) => (
                                    <TableRow key={trip.id}>
                                        <TableCell>{trip.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="flex items-center text-sm">
                                                    <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                                                    {trip.from_location?.name || 'Unknown'}
                                                </span>
                                                <span className="flex items-center text-sm">
                                                    <MapPin className="h-3 w-3 mr-1 text-green-500" />
                                                    {trip.to_location?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {trip.departure_date ? format(new Date(trip.departure_date), 'dd.MM.yyyy HH:mm') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="capitalize">{trip.trip_type}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {trip.status}
                                            </span>
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
