'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams } from 'next/navigation';
import { useCompanyDrivers, useCompanyVehicles } from '@/hooks/useCompanyTransport';
import {
    Button, Input, Label, Card, CardContent,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@doska/ui';
import RegionSelect from '../../_components/RegionSelect';

const TRIP_TYPES = [
    { value: 'rideshare', label: 'Поездка' },
    { value: 'bus', label: 'Автобус' },
    { value: 'shuttle', label: 'Шаттл' },
    { value: 'freight', label: 'Груз' },
];
const STATUSES = [
    { value: 'active', label: 'Активна' },
    { value: 'processing', label: 'Обработка' },
    { value: 'completed', label: 'Завершена' },
    { value: 'cancelled', label: 'Отменена' },
    { value: 'archived', label: 'В архиве' },
];

export const tripSchema = z.object({
    trip_type: z.string(),
    from_location_id: z.number().int().positive('Укажите откуда'),
    to_location_id: z.number().int().positive('Укажите куда'),
    departure_date: z.string().optional(),
    time: z.string().optional(),
    seats: z.string().optional(),
    price: z.string().optional(),
    status: z.string().optional(),
    driver_user_id: z.string().optional(),
    vehicle_id: z.string().optional(),
}).refine((d) => d.from_location_id !== d.to_location_id, {
    message: 'Откуда и куда не могут совпадать',
    path: ['to_location_id'],
});

export type TripFormValues = z.infer<typeof tripSchema>;

interface Props {
    defaultValues?: Partial<TripFormValues>;
    onSubmit: (values: TripFormValues) => void | Promise<void>;
    onCancel: () => void;
    isPending?: boolean;
    submitLabel?: string;
    /** Edit mode: route/date are immutable, status is editable. */
    mode?: 'create' | 'edit';
}

export default function TripForm({ defaultValues, onSubmit, onCancel, isPending, submitLabel = 'Сохранить', mode = 'create' }: Props) {
    const { slug } = useParams() as { slug: string };
    const { data: drivers = [] } = useCompanyDrivers(slug);
    const { data: vehicles = [] } = useCompanyVehicles(slug);
    const isEdit = mode === 'edit';

    const { register, handleSubmit, control, formState: { errors } } = useForm<TripFormValues>({
        resolver: zodResolver(tripSchema),
        defaultValues: {
            trip_type: 'rideshare', from_location_id: 0, to_location_id: 0,
            departure_date: '', time: '', seats: '', price: '', status: 'active',
            driver_user_id: '', vehicle_id: '', ...defaultValues,
        },
    });

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Тип</Label>
                        <Controller control={control} name="trip_type" render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{TRIP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </div>

                    {!isEdit && (
                        <div className="space-y-1">
                            <Label>Дата</Label>
                            <Input type="date" {...register('departure_date')} />
                        </div>
                    )}

                    {!isEdit && (
                        <>
                            <div className="space-y-1">
                                <Label>Откуда</Label>
                                <Controller control={control} name="from_location_id" render={({ field }) => (
                                    <RegionSelect value={field.value} onChange={field.onChange} />
                                )} />
                                {errors.from_location_id && <p className="text-sm text-red-500">{errors.from_location_id.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Куда</Label>
                                <Controller control={control} name="to_location_id" render={({ field }) => (
                                    <RegionSelect value={field.value} onChange={field.onChange} />
                                )} />
                                {errors.to_location_id && <p className="text-sm text-red-500">{errors.to_location_id.message}</p>}
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <Label>Время</Label>
                        <Input type="time" {...register('time')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Мест</Label>
                        <Input type="number" {...register('seats')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Цена</Label>
                        <Input type="number" {...register('price')} />
                    </div>

                    {isEdit && (
                        <div className="space-y-1">
                            <Label>Статус</Label>
                            <Controller control={control} name="status" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                </Select>
                            )} />
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label>Водитель</Label>
                        <Controller control={control} name="driver_user_id" render={({ field }) => (
                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                                <SelectTrigger><SelectValue placeholder="Не назначен" /></SelectTrigger>
                                <SelectContent>{drivers.map((d) => <SelectItem key={d.user_id} value={String(d.user_id)}>{d.full_name}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </div>
                    <div className="space-y-1">
                        <Label>Машина</Label>
                        <Controller control={control} name="vehicle_id" render={({ field }) => (
                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                                <SelectTrigger><SelectValue placeholder="Не назначена" /></SelectTrigger>
                                <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} {v.plate_number ? `(${v.plate_number})` : ''}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
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
