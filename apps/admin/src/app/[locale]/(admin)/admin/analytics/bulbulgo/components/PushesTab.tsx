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
import { useAdminRidesharePushReport } from '@/hooks/queries/admin'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts-lazy'
import {
    AsyncBlock,
    PeriodPicker,
    StatCard,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

const PERM_LABELS: Record<string, string> = {
    granted: 'разрешил',
    denied: 'запретил',
    permanently_denied: 'запретил навсегда',
    provisional: 'временно',
}

// Пуши: отправка/доставка/чтение + отказы от разрешения на уведомления.
export function PushesTab({ period, resetNonce }: TabSectionProps) {
    const [p, setP, over] = useCardPeriod(period, resetNonce)
    const report = useAdminRidesharePushReport(p)
    const d = report.data

    const deliveryRate =
        d && d.delivered + d.failed > 0
            ? `${((d.delivered / (d.delivered + d.failed)) * 100).toFixed(1)}%`
            : undefined
    const readRate =
        d && d.delivered > 0 ? `${((d.read / d.delivered) * 100).toFixed(1)}%` : undefined

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-sm font-medium text-muted-foreground">Пуши ({p})</h2>
                    <PeriodPicker value={p} onChange={setP} overridden={over} />
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Доставлено"
                        value={d?.delivered}
                        loading={report.isLoading}
                        hint={d ? `рассылок: ${d.sent.toLocaleString()}` : undefined}
                    />
                    <StatCard
                        title="Ошибок доставки"
                        value={d?.failed}
                        loading={report.isLoading}
                    />
                    <StatCard
                        title="Delivery rate"
                        value={deliveryRate}
                        loading={report.isLoading}
                        hint="доставлено / (доставлено + ошибки)"
                    />
                    <StatCard
                        title="Прочитано"
                        value={d?.read}
                        loading={report.isLoading}
                        hint={readRate ? `read rate: ${readRate}` : undefined}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Доставка и чтение по времени</CardTitle>
                </CardHeader>
                <CardContent>
                    <AsyncBlock loading={report.isLoading} empty={!d || d.days.length === 0}>
                        {d && (
                            <DailyStackedBarChart
                                data={[...d.days].reverse()}
                                eventTypes={['delivered', 'failed', 'read']}
                                granularity={d.granularity}
                                seriesLabels={{
                                    delivered: 'доставлено',
                                    failed: 'ошибки',
                                    read: 'прочитано',
                                }}
                            />
                        )}
                    </AsyncBlock>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>По категориям</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AsyncBlock
                            loading={report.isLoading}
                            empty={!d || d.categories.length === 0}
                        >
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Категория</TableHead>
                                            <TableHead className="text-right">Доставлено</TableHead>
                                            <TableHead className="text-right">Ошибок</TableHead>
                                            <TableHead className="text-right">Прочитано</TableHead>
                                            <TableHead
                                                className="text-right"
                                                title="Прочитано / доставлено"
                                            >
                                                Read rate
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {d?.categories.map((c, i) => (
                                            <TableRow key={c.category ?? `null-${i}`}>
                                                <TableCell>
                                                    <code className="text-xs">
                                                        {c.category ?? '—'}
                                                    </code>
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {c.delivered.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {c.failed > 0 ? (
                                                        <span className="text-red-600 dark:text-red-400">
                                                            {c.failed.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        0
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {c.read.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {c.delivered > 0
                                                        ? `${((c.read / c.delivered) * 100).toFixed(1)}%`
                                                        : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </AsyncBlock>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Разрешения на уведомления</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AsyncBlock
                            loading={report.isLoading}
                            empty={!d || d.permissions.length === 0}
                        >
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Платформа</TableHead>
                                            <TableHead>Ответ</TableHead>
                                            <TableHead className="text-right">Раз</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {d?.permissions.map((r, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="capitalize">
                                                    {r.platform ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {r.status
                                                        ? PERM_LABELS[r.status] ?? r.status
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.count.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                Событие пишется при изменении статуса разрешения — это не общая
                                доля включённых уведомлений, а решения за период.
                            </p>
                        </AsyncBlock>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
