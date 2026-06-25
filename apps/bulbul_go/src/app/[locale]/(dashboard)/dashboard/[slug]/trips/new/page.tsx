'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@doska/i18n';
import { useCreateCompanyTrip } from '@/hooks/useCompanyTransport';
import TripForm, { TripFormValues } from '../_components/TripForm';

export default function NewTripPage() {
    const { slug } = useParams() as { slug: string };
    const router = useRouter();
    const createM = useCreateCompanyTrip(slug);
    const back = () => router.push(`/dashboard/${slug}/trips`);

    const submit = async (v: TripFormValues) => {
        const seats = v.seats ? Number(v.seats) : null;
        await createM.mutateAsync({
            role: 'driver',
            trip_type: v.trip_type,
            from_location_id: v.from_location_id,
            to_location_id: v.to_location_id,
            departure_date: v.departure_date || null,
            time: v.time || null,
            seats: seats ?? undefined,
            price: v.price ? Number(v.price) : undefined,
            driver_user_id: v.driver_user_id ? Number(v.driver_user_id) : null,
            vehicle_id: v.vehicle_id ? Number(v.vehicle_id) : null,
            schedules: v.departure_date ? [{ date: v.departure_date, time: v.time || null, seats }] : undefined,
        });
        back();
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Новая поездка</h2>
            <TripForm mode="create" onSubmit={submit} onCancel={back} isPending={createM.isPending} submitLabel="Создать" />
        </div>
    );
}
