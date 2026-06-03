'use client';

import { useParams } from 'next/navigation';
import { Link } from '@doska/i18n';
import { useCompanyVehicles, useDeleteVehicle } from '@/hooks/useCompanyTransport';
import {
    Button,
    Card, CardContent,
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@doska/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function VehiclesPage() {
    const { slug } = useParams() as { slug: string };
    const { data: vehicles = [], isLoading } = useCompanyVehicles(slug);
    const deleteM = useDeleteVehicle(slug);
    const base = `/dashboard/${slug}/vehicles`;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Автопарк</h2>
                <Link href={`${base}/new`}>
                    <Button><Plus className="mr-1 h-4 w-4" /> Добавить машину</Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Марка</TableHead>
                                <TableHead>Модель</TableHead>
                                <TableHead>Цвет</TableHead>
                                <TableHead>Госномер</TableHead>
                                <TableHead>Год</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Загрузка…</TableCell></TableRow>
                            )}
                            {!isLoading && vehicles.length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Машин пока нет</TableCell></TableRow>
                            )}
                            {vehicles.map((v) => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.brand}</TableCell>
                                    <TableCell>{v.model}</TableCell>
                                    <TableCell>{v.color || '—'}</TableCell>
                                    <TableCell>{v.plate_number || '—'}</TableCell>
                                    <TableCell>{v.year || '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`${base}/${v.id}/edit`}>
                                            <Button variant="ghost" size="icon-sm"><Pencil className="h-4 w-4" /></Button>
                                        </Link>
                                        <Button variant="ghost" size="icon-sm" onClick={() => { if (confirm('Удалить машину?')) deleteM.mutate(v.id); }}>
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
