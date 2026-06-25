'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Label, Card, CardContent } from '@doska/ui';

export const vehicleSchema = z.object({
    brand: z.string().min(1, 'Укажите марку'),
    model: z.string().min(1, 'Укажите модель'),
    color: z.string().optional(),
    plate_number: z.string().optional(),
    year: z.string().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
    defaultValues?: Partial<VehicleFormValues>;
    onSubmit: (values: VehicleFormValues) => void | Promise<void>;
    onCancel: () => void;
    isPending?: boolean;
    submitLabel?: string;
}

export default function VehicleForm({
    defaultValues,
    onSubmit,
    onCancel,
    isPending,
    submitLabel = 'Сохранить',
}: VehicleFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: { brand: '', model: '', color: '', plate_number: '', year: '', ...defaultValues },
    });

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Марка</Label>
                        <Input {...register('brand')} />
                        {errors.brand && <p className="text-sm text-red-500">{errors.brand.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Модель</Label>
                        <Input {...register('model')} />
                        {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Цвет</Label>
                        <Input {...register('color')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Госномер</Label>
                        <Input {...register('plate_number')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Год</Label>
                        <Input type="number" {...register('year')} />
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
