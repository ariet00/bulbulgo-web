'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@doska/i18n';
import {
    useCompanyTrips,
    useCompanyDrivers,
    useCompanyVehicles,
    useDeleteCompanyTrip,
} from '@/hooks/useCompanyTransport';
import {
    Button, Badge,
    Card, CardContent,
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@doska/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const TRIP_TYPES: Record<string, string> = { rideshare: 'Поездка', bus: 'Автобус', shuttle: 'Шаттл', freight: 'Груз' };
const STATUS_LABELS: Record<string, string> = {
    active: 'Активна', processing: 'Обработка', completed: 'Завершена', cancelled: 'Отменена', archived: 'В архиве',
};

export default function TripsPage() {
    const { slug } = useParams() as { slug: string };
    const [statusFilter, setStatusFilter] = useState<string>('');
    const { data: trips = [], isLoading } = useCompanyTrips(slug, statusFilter ? { status: statusFilter } : {});
    const { data: drivers = [] } = useCompanyDrivers(slug);
    const { data: vehicles = [] } = useCompanyVehicles(slug);
    const deleteM = useDeleteCompanyTrip(slug);
    const base = `/dashboard/${slug}/trips`;

    const driverName = (id?: number | null) => drivers.find((d) => d.user_id === id)?.full_name || '—';
    const vehicleLabel = (id?: number | null) => {
        const v = vehicles.find((x) => x.id === id);
        return v ? `${v.brand} ${v.model}` : '—';
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">Поездки</h2>
                <div className="flex items-center gap-2">
                    <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Все статусы" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все статусы</SelectItem>
                            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Link href={`${base}/new`}>
                        <Button><Plus className="mr-1 h-4 w-4" /> Создать поездку</Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Маршрут</TableHead>
                                <TableHead>Дата</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Водитель</TableHead>
                                <TableHead>Машина</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Загрузка…</TableCell></TableRow>}
                            {!isLoading && trips.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Поездок пока нет</TableCell></TableRow>}
                            {trips.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">
                                        {(t.from_location?.name || t.from_location_id)} → {(t.to_location?.name || t.to_location_id)}
                                    </TableCell>
                                    <TableCell>{t.departure_date || '—'}{t.time ? ` ${t.time.slice(0, 5)}` : ''}</TableCell>
                                    <TableCell>{TRIP_TYPES[t.trip_type || ''] || t.trip_type || '—'}</TableCell>
                                    <TableCell>{driverName(t.user_id)}</TableCell>
                                    <TableCell>{vehicleLabel(t.vehicle_id)}</TableCell>
                                    <TableCell><Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{STATUS_LABELS[t.status] || t.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`${base}/${t.id}/edit`}>
                                            <Button variant="ghost" size="icon-sm"><Pencil className="h-4 w-4" /></Button>
                                        </Link>
                                        <Button variant="ghost" size="icon-sm" onClick={() => { if (confirm('Удалить поездку?')) deleteM.mutate(t.id); }}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
