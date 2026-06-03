'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCompanyVehicles } from '@/hooks/useCompanyTransport';
import { useParams } from 'next/navigation';
import {
    Button, Input, Label, Card, CardContent,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@doska/ui';

export const driverSchema = z.object({
    full_name: z.string().min(1, 'Укажите ФИО'),
    phone: z.string().optional(),
    license_number: z.string().optional(),
    license_categories: z.string().optional(),
    default_vehicle_id: z.string().optional(),
});

export type DriverFormValues = z.infer<typeof driverSchema>;

interface DriverFormProps {
    defaultValues?: Partial<DriverFormValues>;
    onSubmit: (values: DriverFormValues) => void | Promise<void>;
    onCancel: () => void;
    isPending?: boolean;
    submitLabel?: string;
}

export default function DriverForm({
    defaultValues, onSubmit, onCancel, isPending, submitLabel = 'Сохранить',
}: DriverFormProps) {
    const { slug } = useParams() as { slug: string };
    const { data: vehicles = [] } = useCompanyVehicles(slug);

    const { register, handleSubmit, control, formState: { errors } } = useForm<DriverFormValues>({
        resolver: zodResolver(driverSchema),
        defaultValues: {
            full_name: '', phone: '', license_number: '', license_categories: '', default_vehicle_id: '',
            ...defaultValues,
        },
    });

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                        <Label>ФИО</Label>
                        <Input {...register('full_name')} />
                        {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Телефон</Label>
                        <Input {...register('phone')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Номер прав</Label>
                        <Input {...register('license_number')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Категории</Label>
                        <Input placeholder="B, C, D" {...register('license_categories')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Машина по умолчанию</Label>
                        <Controller
                            control={control}
                            name="default_vehicle_id"
                            render={({ field }) => (
                                <Select value={field.value || undefined} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Не выбрана" /></SelectTrigger>
                                    <SelectContent>
                                        {vehicles.map((v) => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                {v.brand} {v.model} {v.plate_number ? `(${v.plate_number})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>
                        <Button type="submit" disabled={isPending}>{submitLabel}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
