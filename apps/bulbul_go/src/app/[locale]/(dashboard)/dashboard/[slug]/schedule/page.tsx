'use client';

import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams } from 'next/navigation';
import { useRouter } from '@doska/i18n';
import {
    useCompanyDrivers,
    useCompanyVehicles,
    useCreateCompanyTrip,
} from '@/hooks/useCompanyTransport';
import {
    Button, Input, Label, Card, CardContent,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@doska/ui';
import { CalendarClock } from 'lucide-react';
import RegionSelect from '../_components/RegionSelect';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const TRIP_TYPES = [
    { value: 'rideshare', label: 'Поездка' },
    { value: 'bus', label: 'Автобус' },
    { value: 'shuttle', label: 'Шаттл' },
    { value: 'freight', label: 'Груз' },
];
const MAX_DATES = 31; // лимит расписания на одну поездку (бэкенд)

const schema = z.object({
    trip_type: z.string(),
    from_location_id: z.number().int().positive('Укажите откуда'),
    to_location_id: z.number().int().positive('Укажите куда'),
    weekdays: z.number().int().min(1, 'Выберите дни недели'),
    date_from: z.string().min(1, 'Укажите дату начала'),
    date_to: z.string().min(1, 'Укажите дату конца'),
    time: z.string().optional(),
    seats: z.string().optional(),
    price: z.string().optional(),
    driver_user_id: z.string().optional(),
    vehicle_id: z.string().optional(),
}).refine((d) => d.from_location_id !== d.to_location_id, {
    message: 'Откуда и куда не могут совпадать', path: ['to_location_id'],
});

type FormValues = z.infer<typeof schema>;

// Даты в [from..to], попадающие в выбранные дни недели (Пн=бит0 … Вс=бит6).
function computeDates(weekdays: number, from: string, to: string): string[] {
    if (!from || !to || !weekdays) return [];
    const out: string[] = [];
    const end = new Date(`${to}T12:00:00`);
    const cur = new Date(`${from}T12:00:00`);
    if (isNaN(cur.getTime()) || isNaN(end.getTime())) return [];
    let guard = 0;
    while (cur <= end && guard++ < 400) {
        const idx = (cur.getDay() + 6) % 7; // Mon=0 … Sun=6
        if (weekdays & (1 << idx)) out.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
    }
    return out;
}

export default function SchedulePage() {
    const { slug } = useParams() as { slug: string };
    const router = useRouter();
    const { data: drivers = [] } = useCompanyDrivers(slug);
    const { data: vehicles = [] } = useCompanyVehicles(slug);
    const createM = useCreateCompanyTrip(slug);

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            trip_type: 'bus', from_location_id: 0, to_location_id: 0, weekdays: 0,
            date_from: '', date_to: '', time: '', seats: '', price: '', driver_user_id: '', vehicle_id: '',
        },
    });

    const [weekdays, dateFrom, dateTo] = useWatch({ control, name: ['weekdays', 'date_from', 'date_to'] });
    const dates = computeDates(weekdays || 0, dateFrom || '', dateTo || '');
    const tooMany = dates.length > MAX_DATES;

    const submit = async (v: FormValues) => {
        const list = computeDates(v.weekdays, v.date_from, v.date_to).slice(0, MAX_DATES);
        if (list.length === 0) return;
        const seats = v.seats ? Number(v.seats) : null;
        await createM.mutateAsync({
            role: 'driver',
            trip_type: v.trip_type,
            from_location_id: v.from_location_id,
            to_location_id: v.to_location_id,
            departure_date: list[0],
            time: v.time || null,
            seats: seats ?? undefined,
            price: v.price ? Number(v.price) : undefined,
            driver_user_id: v.driver_user_id ? Number(v.driver_user_id) : null,
            vehicle_id: v.vehicle_id ? Number(v.vehicle_id) : null,
            schedules: list.map((date) => ({ date, time: v.time || null, seats })),
        });
        router.push(`/dashboard/${slug}/trips`);
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Регулярный рейс</h2>
                <p className="text-sm text-muted-foreground">
                    Задайте маршрут, дни недели и период — создастся поездка с расписанием на эти даты.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Тип</Label>
                            <Controller control={control} name="trip_type" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{TRIP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1">
                            <Label>Время</Label>
                            <Input type="time" {...register('time')} />
                        </div>
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
                        <div className="space-y-1">
                            <Label>Дата начала</Label>
                            <Input type="date" {...register('date_from')} />
                            {errors.date_from && <p className="text-sm text-red-500">{errors.date_from.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Дата конца</Label>
                            <Input type="date" {...register('date_to')} />
                            {errors.date_to && <p className="text-sm text-red-500">{errors.date_to.message}</p>}
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label>Дни недели</Label>
                            <Controller control={control} name="weekdays" render={({ field }) => (
                                <div className="flex flex-wrap gap-1">
                                    {WEEKDAYS.map((d, i) => (
                                        <Button key={d} type="button" size="sm"
                                            variant={field.value & (1 << i) ? 'default' : 'outline'}
                                            onClick={() => field.onChange(field.value ^ (1 << i))}>{d}</Button>
                                    ))}
                                </div>
                            )} />
                            {errors.weekdays && <p className="text-sm text-red-500">{errors.weekdays.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Мест</Label>
                            <Input type="number" {...register('seats')} />
                        </div>
                        <div className="space-y-1">
                            <Label>Цена</Label>
                            <Input type="number" {...register('price')} />
                        </div>
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

                        <div className="col-span-2 flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarClock className="h-4 w-4" />
                                {dates.length === 0 ? 'Дат не выбрано' : `Будет дат в расписании: ${dates.length}`}
                                {tooMany && <span className="text-red-500">— максимум {MAX_DATES}, лишние отбросятся</span>}
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/${slug}/trips`)}>Отмена</Button>
                                <Button type="submit" disabled={dates.length === 0 || createM.isPending}>Создать рейс</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
