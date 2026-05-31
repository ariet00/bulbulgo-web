'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAdminVehicles, useDebounce } from '@doska/shared'
import { useAdminDeleteVehicle } from '@doska/shared'
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
import { Trash2, Eye, Car, User, X, RefreshCw } from 'lucide-react'
import { Link } from '@doska/i18n'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"
import { UserCombobox } from '@/components/admin/selectors/UserCombobox'

const ALL = '__all__'
const VEHICLE_TYPES = ['passenger', 'cargo']

export default function AdminVehiclesPage() {
    const searchParams = useSearchParams()
    const userIdParam = searchParams.get('user_id')

    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)
    const [vehicleType, setVehicleType] = useState<string>(ALL)
    const [year, setYear] = useState('')
    const [userId, setUserId] = useState<number | null>(userIdParam ? Number(userIdParam) : null)

    const { data: vehicles, isLoading, isFetching, refetch } = useAdminVehicles(
        page,
        size,
        dq || undefined,
        {
            vehicle_type: vehicleType === ALL ? undefined : vehicleType,
            year: year ? Number(year) : undefined,
            user_id: userId ?? undefined,
        },
    )
    const deleteVehicleMutation = useAdminDeleteVehicle()

    const handleDelete = (id: number, model: string) => {
        if (confirm(`Are you sure you want to delete vehicle "${model}"?`)) {
            deleteVehicleMutation.mutate(id)
        }
    }

    const resetFilters = () => {
        setQ('')
        setVehicleType(ALL)
        setYear('')
        setUserId(null)
        setPage(1)
    }

    const hasActiveFilters = !!q || vehicleType !== ALL || !!year || userId !== null

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Vehicles</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Vehicle Management</CardTitle>
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
                                placeholder="Все владельцы"
                                allowClear
                            />
                        </div>
                        <Input
                            placeholder="Поиск по марке/модели/номеру/id…"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value)
                                setPage(1)
                            }}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={vehicleType}
                            onValueChange={(v) => {
                                setVehicleType(v)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все типы</SelectItem>
                                {VEHICLE_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="capitalize">
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="Год"
                            value={year}
                            onChange={(e) => {
                                setYear(e.target.value)
                                setPage(1)
                            }}
                            className="w-full sm:w-28"
                        />
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
                                    <TableHead>Model</TableHead>
                                    <TableHead>License Plate</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                                            Ничего не найдено
                                        </TableCell>
                                    </TableRow>
                                )}
                                {vehicles?.items.map((vehicle: any) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell>{vehicle.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Car className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{vehicle.plate_number || '—'}</TableCell>
                                        <TableCell className="capitalize">{vehicle.color || '—'}</TableCell>
                                        <TableCell>{vehicle.year || '—'}</TableCell>
                                        <TableCell className="capitalize">{vehicle.vehicle_type || '—'}</TableCell>
                                        <TableCell>
                                            {vehicle.user_id ? (
                                                <Link
                                                    href={`/admin/users/${vehicle.user_id}`}
                                                    className="flex items-center text-blue-600 hover:underline"
                                                >
                                                    <User className="h-3 w-3 mr-1" />
                                                    {vehicle.user?.full_name || vehicle.user?.name || vehicle.user?.username || `#${vehicle.user_id}`}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/admin/vehicles/${vehicle.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                                                    disabled={deleteVehicleMutation.isPending}
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
                    {vehicles && (
                        <Pagination
                            page={vehicles.page}
                            total={vehicles.total}
                            size={vehicles.size}
                            onPageChange={setPage}
                            onSizeChange={setSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
