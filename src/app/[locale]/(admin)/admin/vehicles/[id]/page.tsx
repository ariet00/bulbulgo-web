'use client'

import { useAdminVehicle } from '@/hooks/queries/admin'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from '@/components/ui/back-button'
import { Car, User, Info, FileText } from 'lucide-react'

export default function AdminVehicleDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const { data: vehicle, isLoading } = useAdminVehicle(id)

    if (isLoading) return <div>Loading...</div>
    if (!vehicle) return <div>Vehicle not found</div>

    return (
        <div className="space-y-6">
            <BackButton />
            
            <h1 className="text-2xl font-bold">Vehicle Details: {vehicle.brand} {vehicle.model}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Car className="mr-2 h-5 w-5" />
                            General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Brand</p>
                                <p className="font-medium">{vehicle.brand}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Model</p>
                                <p className="font-medium">{vehicle.model}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">License Plate</p>
                                <p className="font-medium">{vehicle.plate_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Year</p>
                                <p className="font-medium">{vehicle.year || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Color</p>
                                <p className="font-medium">{vehicle.color || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Capacity</p>
                                <p className="font-medium">{vehicle.capacity} seats</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Owner Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vehicle.user ? (
                            <div className="space-y-2">
                                <p className="font-medium text-lg">{vehicle.user.username}</p>
                                <p className="text-sm text-gray-500">{vehicle.user.email}</p>
                                <p className="text-sm text-gray-500">{vehicle.user.phone || 'No phone'}</p>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No owner info available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {vehicle.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <FileText className="mr-2 h-5 w-5" />
                            Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {vehicle.description}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
