'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { useAdminWalletRetention } from '@/hooks/queries/admin'
import { CHART_COLORS } from '@/components/admin/analytics/chart-constants'
import { AsyncBlock, StatCard } from './shared'

type Granularity = 'week' | 'month'

const GRANULARITIES: Array<{ value: Granularity; label: string }> = [
    { value: 'month', label: 'По месяцам' },
    { value: 'week', label: 'По неделям' },
]

const fmtMoney = (n: number) => Math.round(n).toLocaleString('ru-RU')

function cohortLabel(iso: string, granularity: Granularity) {
    const d = new Date(iso)
    if (granularity === 'month') {
        return d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' })
    }
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

// Same scale as the events heatmap: blue, 0.15..1 so even a thin cell stays visible.
function cellStyle(pct: number) {
    if (pct <= 0) return undefined
    return { backgroundColor: CHART_COLORS[0], opacity: 0.15 + 0.85 * (pct / 100) }
}

export function WalletRetentionCard() {
    const [granularity, setGranularity] = useState<Granularity>('month')
    const query = useAdminWalletRetention(granularity, 12)

    const d = query.data
    const cohorts = d?.cohorts ?? []
    const offsets = Array.from({ length: (d?.max_offset ?? 0) + 1 }, (_, k) => k)
    const step = granularity === 'month' ? 'M' : 'W'

    return (
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Возвращаются ли платящие</CardTitle>
                    <div className="flex items-center gap-1">
                        {GRANULARITIES.map(g => (
                            <Button
                                key={g.value}
                                variant={granularity === g.value ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setGranularity(g.value)}
                            >
                                {g.label}
                            </Button>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Когорта — {granularity === 'month' ? 'месяц' : 'неделя'} первого пополнения.
                    Ячейка — сколько % когорты пополнили кошелёк снова спустя N{' '}
                    {granularity === 'month' ? 'месяцев' : 'недель'}. Считается по всей истории и не
                    зависит от периода вверху страницы.
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Платили хоть раз"
                        value={d?.payers}
                        loading={query.isLoading}
                        hint="уникальных пользователей с пополнением"
                    />
                    <StatCard
                        title="Вернулись платить снова"
                        value={d ? `${(d.repeat_rate * 100).toFixed(1)}%` : undefined}
                        loading={query.isLoading}
                        hint={d ? `${d.repeat_payers} из ${d.payers} — с 2+ пополнениями` : undefined}
                    />
                    <StatCard
                        title="Пополнений на платящего"
                        value={d ? d.avg_topups_per_payer.toFixed(2) : undefined}
                        loading={query.isLoading}
                        hint="в среднем за всё время"
                    />
                    <StatCard
                        title="Медиана до 2-го пополнения"
                        value={
                            d
                                ? d.median_days_to_second != null
                                    ? `${d.median_days_to_second.toFixed(1)} дн.`
                                    : '—'
                                : undefined
                        }
                        loading={query.isLoading}
                        hint={
                            d?.median_days_to_second == null && d
                                ? 'никто ещё не пополнял повторно'
                                : 'как быстро возвращаются за деньгами'
                        }
                    />
                </div>

                <AsyncBlock loading={query.isLoading} empty={cohorts.length === 0}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-separate border-spacing-0.5 text-sm">
                            <thead>
                                <tr>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-muted-foreground">
                                        Когорта
                                    </th>
                                    <th className="px-2 py-1 text-right text-xs font-medium text-muted-foreground">
                                        Платящих
                                    </th>
                                    <th className="px-2 py-1 text-right text-xs font-medium text-muted-foreground">
                                        Пополнено
                                    </th>
                                    {offsets.map(k => (
                                        <th
                                            key={k}
                                            className="w-14 px-1 py-1 text-center text-xs font-medium text-muted-foreground tabular-nums"
                                        >
                                            {step}
                                            {k}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cohorts.map(c => (
                                    <tr key={c.cohort}>
                                        <td className="whitespace-nowrap px-2 py-1 font-medium">
                                            {cohortLabel(c.cohort, granularity)}
                                        </td>
                                        <td className="px-2 py-1 text-right tabular-nums">
                                            {c.users}
                                        </td>
                                        <td className="px-2 py-1 text-right tabular-nums text-muted-foreground">
                                            {fmtMoney(c.topups_sum)}
                                        </td>
                                        {offsets.map(k => {
                                            // Beyond max_observable the bucket simply hasn't happened
                                            // yet for this cohort — render nothing rather than a 0%.
                                            if (k > c.max_observable) {
                                                return <td key={k} className="px-1 py-1" />
                                            }
                                            const returned = c.returned[k] ?? 0
                                            const pct = c.users > 0 ? (returned / c.users) * 100 : 0
                                            return (
                                                <td key={k} className="px-1 py-1">
                                                    <div
                                                        className="rounded bg-muted py-1 text-center text-xs tabular-nums"
                                                        style={cellStyle(pct)}
                                                        title={`${returned} из ${c.users} пополнили снова`}
                                                    >
                                                        <span
                                                            className={
                                                                pct >= 45 ? 'text-white' : undefined
                                                            }
                                                        >
                                                            {pct > 0 ? `${pct.toFixed(0)}%` : '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AsyncBlock>
            </CardContent>
        </Card>
    )
}
