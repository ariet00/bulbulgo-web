'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import { useAdminRideshareFunnel, useAdminRideshareSummary } from '@/hooks/queries/admin'
import {
    AsyncBlock,
    PeriodPicker,
    StatCard,
    roleLabel,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

export function OverviewTab({ period, resetNonce }: TabSectionProps) {
    const [summaryP, setSummaryP, summaryOver] = useCardPeriod(period, resetNonce)
    const [funnelP, setFunnelP, funnelOver] = useCardPeriod(period, resetNonce)

    const summary = useAdminRideshareSummary(summaryP)
    const funnel = useAdminRideshareFunnel(funnelP)

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Сводка ({summaryP})
                    </h2>
                    <PeriodPicker
                        value={summaryP}
                        onChange={setSummaryP}
                        overridden={summaryOver}
                    />
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Активных поездок"
                        value={summary.data?.active_now}
                        loading={summary.isLoading}
                        hint={
                            summary.data
                                ? [
                                      summary.data.active_by_type.length > 0
                                          ? `тип — ${summary.data.active_by_type
                                                .map(t => `${t.trip_type ?? '—'}: ${t.count}`)
                                                .join(' · ')}`
                                          : 'тип — без разбивки',
                                      summary.data.active_by_role.length > 0
                                          ? `роль — ${summary.data.active_by_role
                                                .map(r => `${roleLabel(r.role)}: ${r.count}`)
                                                .join(' · ')}`
                                          : 'роль — без разбивки',
                                  ]
                                : undefined
                        }
                    />
                    <StatCard
                        title={`Создано за ${summaryP}`}
                        value={summary.data?.created_in_period}
                        loading={summary.isLoading}
                    />
                    <StatCard
                        title={`Завершено за ${summaryP}`}
                        value={summary.data?.completed_in_period}
                        loading={summary.isLoading}
                        hint={
                            summary.data && summary.data.cancelled_in_period > 0
                                ? `отменено: ${summary.data.cancelled_in_period}`
                                : undefined
                        }
                    />
                    <StatCard
                        title="Completion rate"
                        value={
                            summary.data
                                ? `${(summary.data.completion_rate * 100).toFixed(1)}%`
                                : undefined
                        }
                        loading={summary.isLoading}
                        hint="completed / created в периоде"
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Воронка ({funnelP})</CardTitle>
                    <PeriodPicker value={funnelP} onChange={setFunnelP} overridden={funnelOver} />
                </CardHeader>
                <CardContent>
                    <AsyncBlock
                        loading={funnel.isLoading}
                        empty={!funnel.data || funnel.data.steps.length === 0}
                    >
                        {funnel.data && <FunnelView steps={funnel.data.steps} />}
                    </AsyncBlock>
                </CardContent>
            </Card>
        </>
    )
}

type Step = {
    key: string
    label: string
    event_type: string
    events: number
    users: number
}

function FunnelView({ steps }: { steps: Step[] }) {
    const top = steps[0]?.users ?? 0

    return (
        <div className="space-y-3">
            {steps.map((step, i) => {
                const prev = i > 0 ? steps[i - 1] : undefined
                const fromTopPct = top > 0 ? (step.users / top) * 100 : 0
                const fromPrevPct =
                    prev && prev.users > 0 ? (step.users / prev.users) * 100 : null

                return (
                    <div key={step.key} className="space-y-1">
                        <div className="flex items-baseline justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground tabular-nums w-6 text-right">
                                    {i + 1}.
                                </span>
                                <span className="font-medium">{step.label}</span>
                                <code className="text-xs text-muted-foreground">
                                    {step.event_type}
                                </code>
                            </div>
                            <div className="flex items-center gap-4 tabular-nums">
                                <span>
                                    <strong>{step.users.toLocaleString()}</strong>{' '}
                                    <span className="text-muted-foreground">польз.</span>
                                </span>
                                <span className="text-muted-foreground">
                                    {step.events.toLocaleString()} событий
                                </span>
                                {fromPrevPct !== null && (
                                    <span
                                        className={
                                            fromPrevPct >= 50
                                                ? 'text-green-600 dark:text-green-400'
                                                : fromPrevPct >= 20
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }
                                    >
                                        {fromPrevPct.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="h-8 rounded bg-muted/40 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
                                style={{ width: `${Math.max(fromTopPct, 0.5)}%` }}
                            />
                        </div>
                    </div>
                )
            })}

            {top > 0 && (
                <div className="text-sm text-muted-foreground pt-2 border-t">
                    Конверсия от поиска до завершения:{' '}
                    <strong className="text-foreground">
                        {((steps[steps.length - 1].users / top) * 100).toFixed(2)}%
                    </strong>
                </div>
            )}
        </div>
    )
}
