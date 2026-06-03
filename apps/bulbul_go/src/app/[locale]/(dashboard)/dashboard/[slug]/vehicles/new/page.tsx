'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@doska/i18n';
import { useCreateVehicle } from '@/hooks/useCompanyTransport';
import VehicleForm, { VehicleFormValues } from '../_components/VehicleForm';

export default function NewVehiclePage() {
    const { slug } = useParams() as { slug: string };
    const router = useRouter();
    const createM = useCreateVehicle(slug);
    const back = () => router.push(`/dashboard/${slug}/vehicles`);

    const submit = async (v: VehicleFormValues) => {
        await createM.mutateAsync({
            brand: v.brand,
            model: v.model,
            color: v.color || undefined,
            plate_number: v.plate_number || undefined,
            year: v.year ? Number(v.year) : undefined,
        });
        back();
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Новая машина</h2>
            <VehicleForm onSubmit={submit} onCancel={back} isPending={createM.isPending} submitLabel="Создать" />
        </div>
    );
}
