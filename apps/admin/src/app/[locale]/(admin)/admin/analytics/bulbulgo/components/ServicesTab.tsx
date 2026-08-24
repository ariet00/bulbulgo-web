'use client'

import { useState } from 'react'
import {
    Button,
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
import {
    useAdminRideshareServiceEffect,
    useAdminRideshareServicesReport,
} from '@/hooks/queries/admin'
import {
    AsyncBlock,
    PeriodPicker,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

const SERVICE_LABELS: Record<string, string> = {
    auto_bump: 'Авто-подъём',
    urgent: 'Срочно',
}
const serviceLabel = (t: string | null) => (t ? SERVICE_LABELS[t] ?? t : '—')

const EFFECT_WINDOWS = [6, 12, 24, 48]

// Платные услуги: воронка покупки, выручка, отказы и честность (эффект).
export function ServicesTab({ period, resetNonce }: TabSectionProps) {
    const [reportP, setReportP, reportOver] = useCardPeriod(period, resetNonce)
    const [effectP, setEffectP, effectOver] = useCardPeriod(period, resetNonce)
    const [windowHours, setWindowHours] = useState(24)

    const report = useAdminRideshareServicesReport(reportP)
    const effect = useAdminRideshareServiceEffect(effectP, windowHours)

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Воронка услуг ({reportP})</CardTitle>
                    <PeriodPicker value={reportP} onChange={setReportP} overridden={reportOver} />
                </CardHeader>
                <CardContent>
                    <AsyncBlock
                        loading={report.isLoading}
                        empty={!report.data || report.data.services.length === 0}
                    >
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Услуга</TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Открытий шторки услуги (пользователей)"
                                        >
                                            Смотрели
                                        </TableHead>
                                        <TableHead className="text-right">Активаций</TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Пользователи, активировавшие / смотревшие"
                                        >
                                            Конверсия
                                        </TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Пользователей с ≥2 активациями за период"
                                        >
                                            Повторные
                                        </TableHead>
                                        <TableHead className="text-right">Выручка</TableHead>
                                        <TableHead className="text-right">Отказов</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.data?.services.map(s => {
                                        const conv =
                                            s.viewed_users > 0
                                                ? `${((s.activated_users / s.viewed_users) * 100).toFixed(1)}%`
                                                : '—'
                                        return (
                                            <TableRow key={s.service_type}>
                                                <TableCell className="whitespace-nowrap font-medium">
                                                    {serviceLabel(s.service_type)}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {s.viewed.toLocaleString()}{' '}
                                                    <span className="text-muted-foreground">
                                                        ({s.viewed_users.toLocaleString()})
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {s.activated.toLocaleString()}{' '}
                                                    <span className="text-muted-foreground">
                                                        ({s.activated_users.toLocaleString()})
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {conv}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {s.repeat_buyers.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums font-medium">
                                                    {s.revenue.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {s.failed > 0 ? (
                                                        <span className="text-red-600 dark:text-red-400">
                                                            {s.failed.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        0
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            В скобках — уникальные пользователи. «Смотрели» приходит с клиента
                            (открытие шторки услуги), поэтому старые версии приложения его не
                            шлют.
                        </p>
                    </AsyncBlock>

                    {report.data && report.data.failures.length > 0 && (
                        <div className="mt-4 space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                                Причины отказов
                            </div>
                            {report.data.failures.map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between text-sm gap-3"
                                >
                                    <span className="truncate">
                                        {serviceLabel(f.service_type)} ·{' '}
                                        <code className="text-xs">{f.reason ?? '—'}</code>
                                    </span>
                                    <span className="tabular-nums text-muted-foreground">
                                        {f.count.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Эффект услуг: просмотры до и после ({effectP})</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex gap-1 items-center">
                            <span className="text-xs text-muted-foreground">окно:</span>
                            {EFFECT_WINDOWS.map(w => (
                                <Button
                                    key={w}
                                    variant={windowHours === w ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => setWindowHours(w)}
                                >
                                    {w}ч
                                </Button>
                            ))}
                        </div>
                        <PeriodPicker
                            value={effectP}
                            onChange={setEffectP}
                            overridden={effectOver}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <AsyncBlock
                        loading={effect.isLoading}
                        empty={!effect.data || effect.data.rows.every(r => r.analyzed === 0)}
                    >
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Событие</TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Сколько активаций проанализировано"
                                        >
                                            Выборка
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Просмотры до → после
                                        </TableHead>
                                        <TableHead className="text-right">Δ просмотров</TableHead>
                                        <TableHead className="text-right">
                                            Номер до → после
                                        </TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Доля активаций, после которых просмотров стало больше"
                                        >
                                            Стало лучше
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {effect.data?.rows.map(r => {
                                        const delta =
                                            r.trip_views_before > 0
                                                ? ((r.trip_views_after - r.trip_views_before) /
                                                      r.trip_views_before) *
                                                  100
                                                : r.trip_views_after > 0
                                                ? 100
                                                : 0
                                        const improvedPct =
                                            r.analyzed > 0
                                                ? (r.improved / r.analyzed) * 100
                                                : 0
                                        return (
                                            <TableRow key={r.kind}>
                                                <TableCell className="whitespace-nowrap font-medium">
                                                    {r.label}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.analyzed.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.trip_views_before.toLocaleString()} →{' '}
                                                    {r.trip_views_after.toLocaleString()}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right tabular-nums font-medium ${
                                                        r.analyzed === 0
                                                            ? ''
                                                            : delta >= 0
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}
                                                >
                                                    {r.analyzed === 0
                                                        ? '—'
                                                        : `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%`}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.phone_views_before.toLocaleString()} →{' '}
                                                    {r.phone_views_after.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {r.analyzed === 0
                                                        ? '—'
                                                        : `${improvedPct.toFixed(0)}%`}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            Сравниваются просмотры объявления в окне {effect.data?.window_hours}ч
                            до и после активации услуги (или факта подъёма). Берутся только
                            активации, у которых окно «после» уже полностью прошло; выборка — до{' '}
                            {effect.data?.sample_limit} последних на каждый вид. Если Δ около
                            нуля — услуга не даёт обещанного буста.
                        </p>
                    </AsyncBlock>
                </CardContent>
            </Card>
        </>
    )
}
