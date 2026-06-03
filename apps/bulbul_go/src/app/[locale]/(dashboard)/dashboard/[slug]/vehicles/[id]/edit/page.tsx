'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@doska/i18n';
import { useCompanyVehicle, useUpdateVehicle } from '@/hooks/useCompanyTransport';
import VehicleForm, { VehicleFormValues } from '../../_components/VehicleForm';

export default function EditVehiclePage() {
    const { slug, id } = useParams() as { slug: string; id: string };
    const vehicleId = Number(id);
    const router = useRouter();
    const { data: vehicle, isLoading } = useCompanyVehicle(slug, vehicleId);
    const updateM = useUpdateVehicle(slug);
    const back = () => router.push(`/dashboard/${slug}/vehicles`);

    const submit = async (v: VehicleFormValues) => {
        await updateM.mutateAsync({
            id: vehicleId,
            data: {
                brand: v.brand,
                model: v.model,
                color: v.color || undefined,
                plate_number: v.plate_number || undefined,
                year: v.year ? Number(v.year) : undefined,
            },
        });
        back();
    };

    if (isLoading || !vehicle) return <p className="text-muted-foreground">Загрузка…</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Редактировать машину</h2>
            <VehicleForm
                defaultValues={{
                    brand: vehicle.brand,
                    model: vehicle.model,
                    color: vehicle.color || '',
                    plate_number: vehicle.plate_number || '',
                    year: vehicle.year ? String(vehicle.year) : '',
                }}
                onSubmit={submit}
                onCancel={back}
                isPending={updateM.isPending}
                submitLabel="Сохранить"
            />
        </div>
    );
}
