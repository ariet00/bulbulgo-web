'use client'

import { useState } from 'react'
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
import { Button, Input } from "@doska/ui"
import { Trash2, Eye, Car } from 'lucide-react'
import { Link } from '@doska/i18n'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"

export default function AdminVehiclesPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 300)
    const { data: vehicles, isLoading } = useAdminVehicles(page, size, dq || undefined)
    const deleteVehicleMutation = useAdminDeleteVehicle()

    const handleDelete = (id: number, model: string) => {
        if (confirm(`Are you sure you want to delete vehicle "${model}"?`)) {
            deleteVehicleMutation.mutate(id)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Vehicles</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Поиск по марке/модели/номеру/id…"
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value)
                            setPage(1)
                        }}
                        className="max-w-xs"
                    />
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
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles?.items.map((vehicle: any) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell>{vehicle.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Car className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{vehicle.plate_number}</TableCell>
                                        <TableCell>{vehicle.capacity} seats</TableCell>
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
