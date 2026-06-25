'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@doska/i18n';
import { useCreateDriver } from '@/hooks/useCompanyTransport';
import DriverForm, { DriverFormValues } from '../_components/DriverForm';

export default function NewDriverPage() {
    const { slug } = useParams() as { slug: string };
    const router = useRouter();
    const createM = useCreateDriver(slug);
    const back = () => router.push(`/dashboard/${slug}/drivers`);

    const submit = async (v: DriverFormValues) => {
        await createM.mutateAsync({
            full_name: v.full_name,
            phone: v.phone || undefined,
            license_number: v.license_number || undefined,
            license_categories: v.license_categories || undefined,
            default_vehicle_id: v.default_vehicle_id ? Number(v.default_vehicle_id) : null,
        });
        back();
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Новый водитель</h2>
            <DriverForm onSubmit={submit} onCancel={back} isPending={createM.isPending} submitLabel="Создать" />
        </div>
    );
}
