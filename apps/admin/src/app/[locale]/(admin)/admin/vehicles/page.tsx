'use client'

import { useEffect, useState } from 'react'
import { useAdminVehicles } from '@/hooks/queries/admin'
import { useDebounce } from '@doska/shared'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useAdminDeleteVehicle } from '@/hooks/mutations/admin'
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

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    vehicle_type: ALL,
    year: 0,
    user_id: 0,
}

export default function AdminVehiclesPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const [yearInput, setYearInput] = useState(values.year ? String(values.year) : '')
    const dq = useDebounce(qInput, 300)
    const dYear = useDebounce(yearInput, 400)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])
    useEffect(() => {
        const n = dYear === '' ? 0 : Number(dYear)
        if (n !== values.year) setValues({ year: n })
    }, [dYear, values.year, setValues])

    const { data: vehicles, isLoading, isFetching, refetch } = useAdminVehicles(
        values.page,
        values.size,
        values.q || undefined,
        {
            vehicle_type: values.vehicle_type === ALL ? undefined : values.vehicle_type,
            year: values.year || undefined,
            user_id: values.user_id || undefined,
        },
    )
    const deleteVehicleMutation = useAdminDeleteVehicle()

    const handleDelete = (id: number, model: string) => {
        if (confirm(`Are you sure you want to delete vehicle "${model}"?`)) {
            deleteVehicleMutation.mutate(id)
        }
    }

    const resetFilters = () => {
        setQInput('')
        setYearInput('')
        reset()
    }

    const hasActiveFilters =
        !!values.q || values.vehicle_type !== ALL || !!values.year || !!values.user_id

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
                                value={values.user_id || null}
                                onChange={(id) => setValues({ user_id: id ?? 0 })}
                                placeholder="Все владельцы"
                                allowClear
                            />
                        </div>
                        <Input
                            placeholder="Поиск по марке/модели/номеру/id…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.vehicle_type}
                            onValueChange={(v) => setValues({ vehicle_type: v })}
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
                            value={yearInput}
                            onChange={(e) => setYearInput(e.target.value)}
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
                            onPageChange={(p) => setValues({ page: p })}
                            onSizeChange={(s) => setValues({ size: s })}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
