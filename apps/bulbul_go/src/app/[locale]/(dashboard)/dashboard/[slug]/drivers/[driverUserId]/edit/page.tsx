'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@doska/i18n';
import { useCompanyDriver, useUpdateDriver } from '@/hooks/useCompanyTransport';
import DriverForm, { DriverFormValues } from '../../_components/DriverForm';

export default function EditDriverPage() {
    const { slug, driverUserId } = useParams() as { slug: string; driverUserId: string };
    const userId = Number(driverUserId);
    const router = useRouter();
    const { data: driver, isLoading } = useCompanyDriver(slug, userId);
    const updateM = useUpdateDriver(slug);
    const back = () => router.push(`/dashboard/${slug}/drivers`);

    const submit = async (v: DriverFormValues) => {
        await updateM.mutateAsync({
            driverUserId: userId,
            data: {
                full_name: v.full_name,
                phone: v.phone || undefined,
                license_number: v.license_number || undefined,
                license_categories: v.license_categories || undefined,
                default_vehicle_id: v.default_vehicle_id ? Number(v.default_vehicle_id) : null,
            },
        });
        back();
    };

    if (isLoading || !driver) return <p className="text-muted-foreground">Загрузка…</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Редактировать водителя</h2>
            <DriverForm
                defaultValues={{
                    full_name: driver.full_name,
                    phone: driver.phone || '',
                    license_number: driver.license_number || '',
                    license_categories: driver.license_categories || '',
                    default_vehicle_id: driver.default_vehicle_id ? String(driver.default_vehicle_id) : '',
                }}
                onSubmit={submit}
                onCancel={back}
                isPending={updateM.isPending}
                submitLabel="Сохранить"
            />
        </div>
    );
}
