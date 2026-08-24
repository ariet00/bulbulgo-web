'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
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
import { Link } from '@doska/i18n'
import { useFilterParams } from '@/hooks/useFilterParams'
import {
    adminKeys,
    useAdminReferralReportRejections,
    useAdminReferralReportSummary,
    useAdminReferralReportTimeseries,
    useAdminReferralReportTopReferrers,
} from '@/hooks/queries/admin'
import { ReferralTimeseriesChart } from '@/components/admin/analytics/charts-lazy'
import { REPORT_PERIODS as PERIODS, SummaryCard } from '@/components/admin/reports/shared'

const REJECTION_LABELS: Record<string, string> = {
    referrer_unavailable: 'Реферер удалён или забанен',
    device_shared_with_referrer: 'Устройство совпадает с реферером',
    device_already_rewarded: 'Устройство уже получало бонус',
    cap_reached: 'Лимит рефералов на пригласившего',
}

const FILTER_DEFAULTS = { period: '30d' }

export default function ReferralReportPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const period = values.period
    const granularity = period === '24h' ? 'hour' : 'day'

    const summary = useAdminReferralReportSummary({ period })
    const timeseries = useAdminReferralReportTimeseries({ period, granularity })
    const rejections = useAdminReferralReportRejections({ period })
    const topReferrers = useAdminReferralReportTopReferrers({ period, limit: 30 })

    const queryClient = useQueryClient()
    const isFetching =
        summary.isFetching ||
        timeseries.isFetching ||
        rejections.isFetching ||
        topReferrers.isFetching
    const refreshAll = () => queryClient.invalidateQueries({ queryKey: adminKeys.reports() })

    const s = summary.data
    const conversion = s && s.captured > 0 ? Math.round((s.rewarded / s.captured) * 100) : undefined
    const prevConversion =
        s && s.prev_captured > 0
            ? Math.round((s.prev_rewarded / s.prev_captured) * 100)
            : undefined
    const referralShare =
        s && s.signed_up > 0 ? Math.round((s.captured / s.signed_up) * 100) : undefined

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Отчёт — реферальная программа</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Воронка приглашений, выплаты и анти-фрод. Настройки программы — в{' '}
                        <Link href="/admin/referral" className="underline underline-offset-2">
                            Рефералах
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {PERIODS.map(p => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setValues({ period: p.value })}
                        >
                            {p.label}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={refreshAll} disabled={isFetching}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <SummaryCard
                    title="Привязано"
                    value={s?.captured}
                    prev={s?.prev_captured}
                    goodWhenUp
                />
                <SummaryCard
                    title="Выплачено рефералов"
                    value={s?.rewarded}
                    prev={s?.prev_rewarded}
                    goodWhenUp
                />
                <SummaryCard
                    title="Конверсия в выплату"
                    value={conversion}
                    prev={prevConversion}
                    suffix="%"
                    goodWhenUp
                />
                <SummaryCard title="Отклонено" value={s?.rejected} prev={s?.prev_rejected} />
                <SummaryCard
                    title="Выплачено, KGS"
                    value={s?.paid_total}
                    prev={s?.prev_paid_total}
                    hint={
                        s
                            ? `пригласившим: ${s.paid_referrers}, приглашённым: ${s.paid_referees}`
                            : undefined
                    }
                />
                <SummaryCard
                    title="Доля регистраций по рефералке"
                    value={referralShare}
                    suffix="%"
                    hint={s ? `${s.captured} из ${s.signed_up} регистраций` : undefined}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Воронка ({period})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summary.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !s ? (
                            <div className="text-muted-foreground">Нет данных</div>
                        ) : (
                            <FunnelSteps
                                steps={[
                                    {
                                        label: 'Поделились приглашением',
                                        value: s.shared,
                                        note: 'клиентское событие — только с новых версий',
                                    },
                                    { label: 'Проверили код на входе', value: s.code_checked },
                                    { label: 'Код оказался настоящим', value: s.code_valid },
                                    { label: 'Привязано к рефереру', value: s.captured },
                                    { label: 'Выплачен бонус', value: s.rewarded },
                                ]}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Отклонения анти-фрода ({period})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rejections.isLoading ? (
                            <div>Загрузка…</div>
                        ) : !rejections.data || rejections.data.length === 0 ? (
                            <div className="text-muted-foreground">Отклонений за период нет</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Причина</TableHead>
                                        <TableHead className="w-24 text-right">Случаев</TableHead>
                                        <TableHead className="w-36">Последний</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rejections.data.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                {row.reason
                                                    ? REJECTION_LABELS[row.reason] ?? row.reason
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {row.count}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(row.last_seen).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {s && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Пайплайн сейчас: ожидают телефон — {s.pipeline_pending}, выплачено —{' '}
                                {s.pipeline_rewarded}, лимит — {s.pipeline_capped}, отклонено —{' '}
                                {s.pipeline_void}.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Динамика ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {timeseries.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !timeseries.data || timeseries.data.length === 0 ? (
                        <div className="text-muted-foreground">Нет данных</div>
                    ) : (
                        <ReferralTimeseriesChart data={timeseries.data} granularity={granularity} />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Кто сколько заработал ({period})</CardTitle>
                </CardHeader>
                <CardContent>
                    {topReferrers.isLoading ? (
                        <div>Загрузка…</div>
                    ) : !topReferrers.data || topReferrers.data.length === 0 ? (
                        <div className="text-muted-foreground">Выплат за период нет</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead>Телефон</TableHead>
                                    <TableHead className="w-28 text-right">Привлечено</TableHead>
                                    <TableHead className="w-24 text-right">Выплат</TableHead>
                                    <TableHead className="w-32 text-right">Заработано, KGS</TableHead>
                                    <TableHead className="w-36">Последняя выплата</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topReferrers.data.map(row => (
                                    <TableRow key={row.user_id}>
                                        <TableCell>
                                            <Link
                                                href={`/admin/users/${row.user_id}`}
                                                className="hover:underline"
                                            >
                                                {row.name ?? row.username ?? `#${row.user_id}`}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {row.phone ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right">{row.captured}</TableCell>
                                        <TableCell className="text-right">{row.payouts}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {row.earned}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {row.last_payout
                                                ? new Date(row.last_payout).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// Простая воронка: числа + бар относительно первого ненулевого шага и % от
// предыдущего шага. shared может быть 0 (старые клиенты не шлют событие) —
// такие шаги не ломают масштаб.
function FunnelSteps({
    steps,
}: {
    steps: Array<{ label: string; value: number; note?: string }>
}) {
    const max = Math.max(...steps.map(st => st.value), 1)
    return (
        <div className="space-y-3">
            {steps.map((step, i) => {
                const prev = i > 0 ? steps[i - 1].value : 0
                const pct = i > 0 && prev > 0 ? Math.round((step.value / prev) * 100) : null
                return (
                    <div key={step.label}>
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                            <span>
                                {step.label}
                                {step.note && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        ({step.note})
                                    </span>
                                )}
                            </span>
                            <span className="font-semibold whitespace-nowrap">
                                {step.value}
                                {pct !== null && (
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                                        {pct}%
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="mt-1 h-2 rounded bg-muted">
                            <div
                                className="h-2 rounded bg-primary"
                                style={{ width: `${Math.max((step.value / max) * 100, step.value > 0 ? 2 : 0)}%` }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
