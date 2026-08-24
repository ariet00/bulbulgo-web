'use client'

import { useAdminReferralReport } from '@/hooks/queries/admin'
import {
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="text-2xl font-semibold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
        </Card>
    )
}

export function ReferralReportTable() {
    const { data, isLoading } = useAdminReferralReport(100)

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Загрузка…</p>
    }
    if (!data) {
        return <p className="text-sm text-muted-foreground">Нет данных</p>
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Пригласивших" value={data.total_referrers} />
                <StatCard label="Приглашено всего" value={data.total_invited} />
                <StatCard label="Оплачено" value={data.total_rewarded} />
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Пользователь</TableHead>
                            <TableHead>Телефон</TableHead>
                            <TableHead className="text-right">
                                Приглашено
                            </TableHead>
                            <TableHead className="text-right">
                                Подтвердили
                            </TableHead>
                            <TableHead className="text-right">
                                Заработано
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.rows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground"
                                >
                                    Пока никто никого не пригласил
                                </TableCell>
                            </TableRow>
                        )}
                        {data.rows.map((r) => (
                            <TableRow key={r.referrer_id}>
                                <TableCell>{r.referrer_id}</TableCell>
                                <TableCell>
                                    {r.name || r.username || '—'}
                                </TableCell>
                                <TableCell>{r.phone || '—'}</TableCell>
                                <TableCell className="text-right">
                                    {r.invited_count}
                                </TableCell>
                                <TableCell className="text-right">
                                    {r.rewarded_count}
                                </TableCell>
                                <TableCell className="text-right">
                                    {r.earned}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
