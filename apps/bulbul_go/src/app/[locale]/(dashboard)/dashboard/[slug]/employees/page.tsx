'use client';

import { useParams } from 'next/navigation';
import { useCompanyEmployees, useCompanyRoles } from '@doska/shared';
import {
    Card, CardContent,
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Badge,
} from '@doska/ui';

export default function EmployeesPage() {
    const { slug } = useParams() as { slug: string };
    const { data: employees = [], isLoading } = useCompanyEmployees(slug);
    const { data: roles = [] } = useCompanyRoles(slug);

    const roleName = (id?: number | null) => roles.find((r) => r.id === id)?.name || '—';

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Сотрудники</h2>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Пользователь</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead>Статус</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Загрузка…</TableCell></TableRow>}
                            {!isLoading && employees.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Сотрудников пока нет</TableCell></TableRow>}
                            {employees.map((e: any) => (
                                <TableRow key={e.user_id}>
                                    <TableCell className="font-medium">{e.user?.full_name || e.user?.username || `#${e.user_id}`}</TableCell>
                                    <TableCell>{roleName(e.role_id)}</TableCell>
                                    <TableCell><Badge variant={e.status === 'active' ? 'default' : 'secondary'}>{e.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
