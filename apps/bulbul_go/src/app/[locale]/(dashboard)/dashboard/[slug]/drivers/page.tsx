'use client';

import { useParams } from 'next/navigation';
import { Link } from '@doska/i18n';
import { useCompanyDrivers, useCompanyVehicles, useDeleteDriver } from '@/hooks/useCompanyTransport';
import {
    Button, Badge,
    Card, CardContent,
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@doska/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function DriversPage() {
    const { slug } = useParams() as { slug: string };
    const { data: drivers = [], isLoading } = useCompanyDrivers(slug);
    const { data: vehicles = [] } = useCompanyVehicles(slug);
    const deleteM = useDeleteDriver(slug);
    const base = `/dashboard/${slug}/drivers`;

    const vehicleLabel = (id?: number | null) => {
        const v = vehicles.find((x) => x.id === id);
        return v ? `${v.brand} ${v.model}` : '—';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Водители</h2>
                <Link href={`${base}/new`}>
                    <Button><Plus className="mr-1 h-4 w-4" /> Добавить водителя</Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ФИО</TableHead>
                                <TableHead>Телефон</TableHead>
                                <TableHead>Права</TableHead>
                                <TableHead>Машина</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Загрузка…</TableCell></TableRow>}
                            {!isLoading && drivers.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Водителей пока нет</TableCell></TableRow>}
                            {drivers.map((d) => (
                                <TableRow key={d.user_id}>
                                    <TableCell className="font-medium">{d.full_name}</TableCell>
                                    <TableCell>{d.phone || '—'}</TableCell>
                                    <TableCell>{[d.license_number, d.license_categories].filter(Boolean).join(' · ') || '—'}</TableCell>
                                    <TableCell>{vehicleLabel(d.default_vehicle_id)}</TableCell>
                                    <TableCell><Badge variant={d.status === 'active' ? 'default' : 'secondary'}>{d.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`${base}/${d.user_id}/edit`}>
                                            <Button variant="ghost" size="icon-sm"><Pencil className="h-4 w-4" /></Button>
                                        </Link>
                                        <Button variant="ghost" size="icon-sm" onClick={() => { if (confirm('Удалить водителя?')) deleteM.mutate(d.user_id); }}>
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
