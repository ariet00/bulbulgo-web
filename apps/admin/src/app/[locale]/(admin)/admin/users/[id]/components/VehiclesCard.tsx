'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { useAdminVehicles } from '@/hooks/queries/admin'
import { LimitedRows } from './shared'

export function VehiclesCard({ uid }: { uid: number }) {
    const vehicles = useAdminVehicles(1, 40, undefined, { user_id: uid })

    return (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Транспорт{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({vehicles.data?.total ?? 0})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {vehicles.isLoading ? (
                                <div>Загрузка…</div>
                            ) : !vehicles.data || vehicles.data.items.length === 0 ? (
                                <div className="text-muted-foreground">Нет транспорта</div>
                            ) : (
                                <LimitedRows items={vehicles.data.items as any[]}>
                                    {rows => (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Марка / модель</TableHead>
                                                    <TableHead className="w-28">Тип</TableHead>
                                                    <TableHead className="w-24">Год</TableHead>
                                                    <TableHead className="w-28">Цвет</TableHead>
                                                    <TableHead className="w-32">Номер</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rows.map((v: any) => (
                                                    <TableRow key={v.id}>
                                                        <TableCell>
                                                            {[v.brand, v.model].filter(Boolean).join(' ') || '—'}
                                                        </TableCell>
                                                        <TableCell className="text-xs">{v.vehicle_type ?? '—'}</TableCell>
                                                        <TableCell className="tabular-nums">{v.year ?? '—'}</TableCell>
                                                        <TableCell className="text-xs">{v.color ?? '—'}</TableCell>
                                                        <TableCell className="font-mono text-xs">
                                                            {v.plate_number ?? '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </LimitedRows>
                            )}
                        </CardContent>
                    </Card>
    )
}
