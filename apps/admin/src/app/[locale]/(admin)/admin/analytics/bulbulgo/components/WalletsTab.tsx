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
import { Link } from '@doska/i18n'
import {
    useAdminWalletReportFlowByDay,
    useAdminWalletReportSummary,
    useAdminWalletReportTopUsers,
} from '@/hooks/queries/admin'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts-lazy'
import { WalletRetentionCard } from './WalletRetentionCard'
import {
    AsyncBlock,
    LIST_SIZE,
    PeriodPicker,
    StatCard,
    UserAvatar,
    UserInlineLink,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

type WalletMetric = 'topups' | 'spend' | 'balance'

const WALLET_FLOW_LABELS: Record<string, string> = {
    income: 'Пополнения',
    expense: 'Списания',
}

const WALLET_METRICS: Array<{ value: WalletMetric; label: string }> = [
    { value: 'topups', label: 'Пополнения' },
    { value: 'spend', label: 'Списания' },
    { value: 'balance', label: 'Баланс' },
]

// Money: whole units with ru grouping (amounts are mostly KGS; minor units не показываем).
const fmtMoney = (n: number) => Math.round(n).toLocaleString('ru-RU')

function balanceClass(balance: number) {
    if (balance > 0) return 'text-green-600 dark:text-green-400'
    if (balance < 0) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
}

export function WalletsTab({ period, resetNonce }: TabSectionProps) {
    const [flowP, setFlowP, flowOver] = useCardPeriod(period, resetNonce)
    const flow = useAdminWalletReportFlowByDay(flowP)

    return (
        <>
            <WalletSummarySection period={period} resetNonce={resetNonce} />

            <WalletRetentionCard />

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Пополнения и списания по дням ({flowP})</CardTitle>
                    <PeriodPicker value={flowP} onChange={setFlowP} overridden={flowOver} />
                </CardHeader>
                <CardContent>
                    <AsyncBlock
                        loading={flow.isLoading}
                        empty={!flow.data || flow.data.days.length === 0}
                    >
                        {flow.data && (
                            <DailyStackedBarChart
                                data={[...flow.data.days].reverse()}
                                eventTypes={flow.data.event_types}
                                granularity={flow.data.granularity}
                                seriesLabels={WALLET_FLOW_LABELS}
                            />
                        )}
                    </AsyncBlock>
                </CardContent>
            </Card>

            <WalletTopUsersCard period={period} resetNonce={resetNonce} />
        </>
    )
}

function WalletSummarySection({ period, resetNonce }: TabSectionProps) {
    const [cardP, setCardP, overridden] = useCardPeriod(period, resetNonce)
    const query = useAdminWalletReportSummary(cardP)

    const d = query.data
    const primary = d?.balance_by_currency[0]
    const balanceValue = primary
        ? `${fmtMoney(primary.balance)} ${primary.currency}`
        : d
        ? '0'
        : undefined
    const balanceHint =
        d && d.balance_by_currency.length > 1
            ? d.balance_by_currency.map(b => `${b.currency}: ${fmtMoney(b.balance)}`)
            : undefined

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-sm font-medium text-muted-foreground">
                    Сводка по кошелькам ({cardP})
                </h2>
                <PeriodPicker value={cardP} onChange={setCardP} overridden={overridden} />
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Баланс (нетто)"
                    value={balanceValue}
                    loading={query.isLoading}
                    hint={balanceHint}
                />
                <StatCard
                    title={`Пополнения за ${cardP}`}
                    value={d ? fmtMoney(d.topups_sum) : undefined}
                    loading={query.isLoading}
                    hint={d ? `${d.topups_count.toLocaleString()} операций` : undefined}
                />
                <StatCard
                    title={`Списания за ${cardP}`}
                    value={d ? fmtMoney(d.spend_sum) : undefined}
                    loading={query.isLoading}
                    hint={d ? `${d.spend_count.toLocaleString()} операций` : undefined}
                />
                <StatCard
                    title="Чистый приток"
                    value={d ? fmtMoney(d.net_in_period) : undefined}
                    loading={query.isLoading}
                    hint={
                        d
                            ? `активно: ${d.active_wallets} кош. · ${d.active_users} польз.`
                            : undefined
                    }
                />
            </div>
        </div>
    )
}

type WalletTopRow = NonNullable<
    ReturnType<typeof useAdminWalletReportTopUsers>['data']
>['users'][number]

function WalletTopUsersCard({ period, resetNonce }: TabSectionProps) {
    const [cardP, setCardP, overridden] = useCardPeriod(period, resetNonce)
    const [metric, setMetric] = useState<WalletMetric>('topups')

    const query = useAdminWalletReportTopUsers(cardP, metric, LIST_SIZE)
    const users = query.data?.users ?? []

    return (
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Топ пользователей по кошелькам ({cardP})</CardTitle>
                    <PeriodPicker value={cardP} onChange={setCardP} overridden={overridden} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Сортировка:</span>
                    {WALLET_METRICS.map(m => (
                        <Button
                            key={m.value}
                            variant={metric === m.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setMetric(m.value)}
                        >
                            {m.label}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <AsyncBlock loading={query.isLoading} empty={users.length === 0}>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead>Телефон</TableHead>
                                    <TableHead className="w-32 text-right">Пополнения</TableHead>
                                    <TableHead className="w-32 text-right">Списания</TableHead>
                                    <TableHead className="w-28 text-right">Баланс</TableHead>
                                    <TableHead className="w-40">Последняя операция</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u: WalletTopRow, i: number) => (
                                    <TableRow key={u.user_id}>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>
                                            <UserInlineLink
                                                userId={u.user_id}
                                                name={u.name}
                                                avatarUrl={u.avatar_url}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {u.phone ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {fmtMoney(u.topups)}
                                            </span>
                                            <span className="ml-1 text-xs text-muted-foreground">
                                                · {u.topups_count}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                            {fmtMoney(u.spend)}
                                            <span className="ml-1 text-xs">· {u.spend_count}</span>
                                        </TableCell>
                                        <TableCell
                                            className={`text-right tabular-nums font-semibold ${balanceClass(u.balance)}`}
                                        >
                                            {fmtMoney(u.balance)}
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                            {u.last_tx_at
                                                ? new Date(u.last_tx_at).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-2 md:hidden">
                        {users.map((u: WalletTopRow, i: number) => {
                            const main =
                                metric === 'spend'
                                    ? { value: u.spend, label: 'Списания' }
                                    : metric === 'balance'
                                    ? { value: u.balance, label: 'Баланс' }
                                    : { value: u.topups, label: 'Пополнения' }
                            return (
                                <div key={u.user_id} className="rounded-lg border p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-2">
                                            <span className="w-5 shrink-0 pt-1 text-xs tabular-nums text-muted-foreground">
                                                {i + 1}
                                            </span>
                                            <Link
                                                href={`/admin/users/${u.user_id}`}
                                                className="flex min-w-0 items-center gap-2 hover:underline"
                                            >
                                                <UserAvatar
                                                    url={u.avatar_url}
                                                    name={u.name}
                                                    className="h-8 w-8"
                                                />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium">
                                                        {u.name ?? `user #${u.user_id}`}
                                                    </div>
                                                    <div className="truncate text-xs text-muted-foreground tabular-nums">
                                                        #{u.user_id} · {u.phone ?? '—'}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-lg font-semibold tabular-nums">
                                                {fmtMoney(main.value)}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {main.label}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                                        <span>
                                            Пополн.{' '}
                                            <span className="tabular-nums text-green-600 dark:text-green-400">
                                                {fmtMoney(u.topups)}
                                            </span>
                                        </span>
                                        <span>
                                            Списано{' '}
                                            <span className="tabular-nums text-foreground">
                                                {fmtMoney(u.spend)}
                                            </span>
                                        </span>
                                        <span>
                                            Баланс{' '}
                                            <span
                                                className={`tabular-nums ${balanceClass(u.balance)}`}
                                            >
                                                {fmtMoney(u.balance)}
                                            </span>
                                        </span>
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
