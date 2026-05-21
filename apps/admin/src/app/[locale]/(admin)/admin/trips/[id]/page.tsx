'use client'

import { useAdminTrip } from '@doska/shared'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@doska/ui"
import { BackButton } from '@doska/ui'
import { MapPin, Calendar, Clock, User, Car, Info } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from "@doska/ui"

export default function AdminTripDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const { data: trip, isLoading } = useAdminTrip(id)

    if (isLoading) return <div>Loading...</div>
    if (!trip) return <div>Trip not found</div>

    return (
        <div className="space-y-6">
            <BackButton />
            
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Trip Details #{trip.id}</h1>
                <Badge variant={trip.status === 'active' ? 'default' : 'secondary'}>
                    {trip.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <MapPin className="mr-2 h-5 w-5" />
                            Route Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start">
                            <div className="mr-4 mt-1 p-2 rounded-full bg-blue-100 text-blue-600">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">From</p>
                                <p className="font-medium text-lg">{trip.from_location?.name || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="mr-4 mt-1 p-2 rounded-full bg-green-100 text-green-600">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">To</p>
                                <p className="font-medium text-lg">{trip.to_location?.name || 'Unknown'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            Schedule & Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Departure Date</p>
                                <p className="font-medium">
                                    {trip.departure_date ? format(new Date(trip.departure_date), 'dd MMMM yyyy') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Departure Time</p>
                                <p className="font-medium">{trip.time || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Trip Type</p>
                                <p className="font-medium capitalize">{trip.trip_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Price</p>
                                <p className="font-medium text-green-600">{trip.price || 0} Som</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Driver Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {trip.user ? (
                            <div className="space-y-2">
                                <p className="font-medium text-lg">{trip.user.username}</p>
                                <p className="text-sm text-gray-500">{trip.user.email}</p>
                                <p className="text-sm text-gray-500">{trip.user.phone || 'No phone'}</p>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No driver info available</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Car className="mr-2 h-5 w-5" />
                            Vehicle Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {trip.vehicle ? (
                            <div className="space-y-2">
                                <p className="font-medium text-lg">{trip.vehicle.brand} {trip.vehicle.model}</p>
                                <p className="text-sm"><strong>License Plate:</strong> {trip.vehicle.plate_number}</p>
                                <p className="text-sm"><strong>Color:</strong> {trip.vehicle.color || 'N/A'}</p>
                                <p className="text-sm"><strong>Capacity:</strong> {trip.vehicle.capacity} seats</p>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No vehicle info available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
