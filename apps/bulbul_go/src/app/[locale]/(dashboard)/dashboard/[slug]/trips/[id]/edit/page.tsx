'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@doska/i18n';
import { useCompanyTrip, useUpdateCompanyTrip, useAssignTripDriverVehicle } from '@/hooks/useCompanyTransport';
import TripForm, { TripFormValues } from '../../_components/TripForm';

export default function EditTripPage() {
    const { slug, id } = useParams() as { slug: string; id: string };
    const tripId = Number(id);
    const router = useRouter();
    const { data: trip, isLoading } = useCompanyTrip(slug, tripId);
    const updateM = useUpdateCompanyTrip(slug);
    const assignM = useAssignTripDriverVehicle(slug);
    const back = () => router.push(`/dashboard/${slug}/trips`);

    const submit = async (v: TripFormValues) => {
        await updateM.mutateAsync({
            id: tripId,
            data: {
                trip_type: v.trip_type,
                time: v.time || null,
                seats: v.seats ? Number(v.seats) : undefined,
                price: v.price ? Number(v.price) : undefined,
                status: v.status,
                vehicle_id: v.vehicle_id ? Number(v.vehicle_id) : null,
            },
        });
        // Driver change goes through the dedicated assignment endpoint (PUT
        // doesn't touch Trip.user_id).
        const newDriver = v.driver_user_id ? Number(v.driver_user_id) : null;
        if (newDriver !== (trip?.user_id ?? null)) {
            await assignM.mutateAsync({ id: tripId, data: { driver_user_id: newDriver } });
        }
        back();
    };

    if (isLoading || !trip) return <p className="text-muted-foreground">Загрузка…</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">
                Редактировать поездку: {(trip.from_location?.name || trip.from_location_id)} → {(trip.to_location?.name || trip.to_location_id)}
                {trip.departure_date ? `, ${trip.departure_date}` : ''}
            </h2>
            <TripForm
                mode="edit"
                defaultValues={{
                    trip_type: trip.trip_type || 'rideshare',
                    from_location_id: trip.from_location_id,
                    to_location_id: trip.to_location_id,
                    time: trip.time ? trip.time.slice(0, 5) : '',
                    seats: trip.seats != null ? String(trip.seats) : '',
                    price: trip.price != null ? String(trip.price) : '',
                    status: trip.status,
                    driver_user_id: trip.user_id ? String(trip.user_id) : '',
                    vehicle_id: trip.vehicle_id ? String(trip.vehicle_id) : '',
                }}
                onSubmit={submit}
                onCancel={back}
                isPending={updateM.isPending || assignM.isPending}
                submitLabel="Сохранить"
            />
        </div>
    );
}
