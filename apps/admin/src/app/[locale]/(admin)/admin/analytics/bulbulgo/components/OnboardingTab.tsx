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
    useAdminRideshareEventRetention,
    useAdminRideshareOnboardingFunnel,
    useAdminRideshareRetentionCohorts,
} from '@/hooks/queries/admin'
import {
    AsyncBlock,
    PeriodPicker,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

const COHORT_WEEKS = [8, 12, 26]

// Новички: воронка активации + недельные когорты удержания.
export function OnboardingTab({ period, resetNonce }: TabSectionProps) {
    const [funnelP, setFunnelP, funnelOver] = useCardPeriod(period, resetNonce)
    const [weeks, setWeeks] = useState(8)

    const funnel = useAdminRideshareOnboardingFunnel(funnelP)
    const cohorts = useAdminRideshareRetentionCohorts(weeks)

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Воронка новичков ({funnelP})</CardTitle>
                    <PeriodPicker value={funnelP} onChange={setFunnelP} overridden={funnelOver} />
                </CardHeader>
                <CardContent>
                    <AsyncBlock
                        loading={funnel.isLoading}
                        empty={!funnel.data || funnel.data.steps.every(s => s.count === 0)}
                    >
                        {funnel.data && <OnboardingFunnelView steps={funnel.data.steps} />}
                    </AsyncBlock>
                    <p className="text-xs text-muted-foreground mt-3">
                        Шаги после регистрации считаются только по пользователям,
                        зарегистрировавшимся в выбранном периоде. «Установка» — уникальные
                        устройства (первая регистрация устройства).
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Удержание по когортам регистрации</CardTitle>
                    <div className="flex gap-1 items-center">
                        <span className="text-xs text-muted-foreground">недель:</span>
                        {COHORT_WEEKS.map(w => (
                            <Button
                                key={w}
                                variant={weeks === w ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setWeeks(w)}
                            >
                                {w}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <AsyncBlock
                        loading={cohorts.isLoading}
                        empty={!cohorts.data || cohorts.data.cohorts.length === 0}
                    >
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Неделя регистрации</TableHead>
                                        <TableHead className="text-right">Пользователей</TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Был активен на следующий день"
                                        >
                                            D1
                                        </TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Был активен в дни 7–13"
                                        >
                                            D7
                                        </TableHead>
                                        <TableHead
                                            className="text-right"
                                            title="Был активен в дни 30–36"
                                        >
                                            D30
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cohorts.data?.cohorts.map(c => (
                                        <TableRow key={c.week}>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(c.week).toLocaleDateString('ru-RU')}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {c.users.toLocaleString()}
                                            </TableCell>
                                            <RetentionCell num={c.d1} den={c.users} />
                                            <RetentionCell num={c.d7} den={c.users} />
                                            <RetentionCell num={c.d30} den={c.users} />
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            Активность — любое событие пользователя в аналитике. Свежие когорты
                            ещё не дожили до D7/D30 — там проценты будут занижены.
                        </p>
                    </AsyncBlock>
                </CardContent>
            </Card>

            <EventRetentionCard period={period} resetNonce={resetNonce} />
        </>
    )
}

// Возвращаемость в конкретное действие: повторил ли пользователь событие
// в 1/7/30 дней после первого раза в периоде.
function EventRetentionCard({ period, resetNonce }: TabSectionProps) {
    const [p, setP, over] = useCardPeriod(period, resetNonce)
    const [event, setEvent] = useState('trip_viewed_phone')
    const q = useAdminRideshareEventRetention(event, p)
    const d = q.data

    const windows: Array<{ label: string; returned: number; eligible: number }> = d
        ? [
              { label: 'через 1 день', returned: d.returned_1d, eligible: d.eligible_1d },
              { label: 'в течение 7 дней', returned: d.returned_7d, eligible: d.eligible_7d },
              { label: 'в течение 30 дней', returned: d.returned_30d, eligible: d.eligible_30d },
          ]
        : []

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <CardTitle>Возвращаемость в действие ({p})</CardTitle>
                <PeriodPicker value={p} onChange={setP} overridden={over} />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-1 flex-wrap">
                    {Object.entries(d?.available_events ?? { [event]: '…' }).map(
                        ([key, label]) => (
                            <Button
                                key={key}
                                variant={event === key ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setEvent(key)}
                            >
                                {label}
                            </Button>
                        ),
                    )}
                </div>
                <AsyncBlock loading={q.isLoading} empty={!d || d.users === 0}>
                    <div className="text-sm text-muted-foreground">
                        Сделали «{d?.label}» впервые за период:{' '}
                        <strong className="text-foreground tabular-nums">
                            {d?.users.toLocaleString()}
                        </strong>{' '}
                        пользователей. Из них повторили:
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 mt-3">
                        {windows.map(w => {
                            const pct = w.eligible > 0 ? (w.returned / w.eligible) * 100 : null
                            return (
                                <div key={w.label} className="rounded-lg border p-3">
                                    <div className="text-xs text-muted-foreground">{w.label}</div>
                                    <div className="text-2xl font-semibold tabular-nums mt-1">
                                        {pct === null ? '—' : `${pct.toFixed(0)}%`}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {w.eligible > 0
                                            ? `${w.returned.toLocaleString()} из ${w.eligible.toLocaleString()} доживших до окна`
                                            : 'окно ещё не прошло ни у кого'}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </AsyncBlock>
            </CardContent>
        </Card>
    )
}

function RetentionCell({ num, den }: { num: number; den: number }) {
    const pct = den > 0 ? (num / den) * 100 : 0
    const cls =
        den === 0
            ? ''
            : pct >= 30
            ? 'text-green-600 dark:text-green-400'
            : pct >= 10
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-red-600 dark:text-red-400'
    return (
        <TableCell className={`text-right tabular-nums ${cls}`} title={`${num} из ${den}`}>
            {den > 0 ? `${pct.toFixed(0)}%` : '—'}
        </TableCell>
    )
}

function OnboardingFunnelView({
    steps,
}: {
    steps: Array<{ key: string; label: string; count: number }>
}) {
    const top = steps[0]?.count ?? 0

    return (
        <div className="space-y-3">
            {steps.map((step, i) => {
                const prev = i > 0 ? steps[i - 1] : undefined
                const fromTopPct = top > 0 ? (step.count / top) * 100 : 0
                const fromPrevPct =
                    prev && prev.count > 0 ? (step.count / prev.count) * 100 : null

                return (
                    <div key={step.key} className="space-y-1">
                        <div className="flex items-baseline justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground tabular-nums w-6 text-right">
                                    {i + 1}.
                                </span>
                                <span className="font-medium">{step.label}</span>
                            </div>
                            <div className="flex items-center gap-4 tabular-nums">
                                <strong>{step.count.toLocaleString()}</strong>
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
        </div>
    )
}
