'use client'

import { useState } from 'react'
import { useAdminVehicles } from '@doska/shared'
import { useAdminDeleteVehicle } from '@doska/shared'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@doska/ui"
import { Button } from "@doska/ui"
import { Trash2, Eye, Car } from 'lucide-react'
import { Link } from '@doska/i18n'
import { Pagination } from '@doska/ui'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"

export default function AdminVehiclesPage() {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(40)
    const { data: vehicles, isLoading } = useAdminVehicles(page, size)
    const deleteVehicleMutation = useAdminDeleteVehicle()

    const handleDelete = (id: number, model: string) => {
        if (confirm(`Are you sure you want to delete vehicle "${model}"?`)) {
            deleteVehicleMutation.mutate(id)
        }
    }

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Vehicles</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
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
