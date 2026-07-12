'use client'

import { useEffect, useState } from 'react'
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    Wallet as WalletIcon,
} from 'lucide-react'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { useAdminUserTransactions, useAdminUserWallets } from '@/hooks/queries/admin'

const TX_TYPES = [
    { value: '', label: 'Все' },
    { value: 'income', label: 'Доход' },
    { value: 'expense', label: 'Расход' },
    { value: 'transfer', label: 'Перевод' },
]

const fmtAmount = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })

const txTypeLabel = (type: string) =>
    TX_TYPES.find(x => x.value === type)?.label ?? type

// Signed amount string + color/icon driven by transaction type.

// Signed amount string + color/icon driven by transaction type.
function txMeta(type: string, amount: number) {
    if (type === 'expense') {
        return {
            signed: `−${fmtAmount(Math.abs(amount))}`,
            cls: 'text-red-600 dark:text-red-400',
            Icon: ArrowUpRight,
            iconCls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
        }
    }
    if (type === 'income') {
        return {
            signed: `+${fmtAmount(Math.abs(amount))}`,
            cls: 'text-green-600 dark:text-green-400',
            Icon: ArrowDownLeft,
            iconCls: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40',
        }
    }
    return {
        signed: fmtAmount(amount),
        cls: 'text-foreground',
        Icon: ArrowLeftRight,
        iconCls: 'text-muted-foreground bg-muted',
    }
}

export function WalletsCard({ uid }: { uid: number }) {
    const [walletFilter, setWalletFilter] = useState<number | null>(null)
    const [txType, setTxType] = useState('')
    const [txPage, setTxPage] = useState(1)
    const [txSize, setTxSize] = useState(10)

    const wallets = useAdminUserWallets(uid)
    const txs = useAdminUserTransactions(uid, txPage, txSize, {
        walletId: walletFilter ?? undefined,
        type: txType || undefined,
    })

    useEffect(() => {
        setTxPage(1)
    }, [walletFilter, txType])

    const walletItems = wallets.data?.wallets ?? []
    const balances = wallets.data?.total_balance_by_currency ?? {}
    const txItems = txs.data?.items ?? []
    const activeWallet = walletItems.find(w => w.id === walletFilter)

    const incomeTotals = Object.entries(txs.data?.summary.income_by_currency ?? {})
    const expenseTotals = Object.entries(txs.data?.summary.expense_by_currency ?? {})
    const hasTotals = incomeTotals.length > 0 || expenseTotals.length > 0

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <WalletIcon className="h-5 w-5 text-muted-foreground" />
                            Кошельки
                            <span className="text-sm font-normal text-muted-foreground">
                                ({walletItems.length})
                            </span>
                        </CardTitle>
                        {Object.keys(balances).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(balances).map(([cur, total]) => (
                                    <span
                                        key={cur}
                                        className="inline-flex items-baseline gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-sm"
                                    >
                                        <span className="text-xs text-muted-foreground">{cur}</span>
                                        <span className="font-semibold tabular-nums">
                                            {fmtAmount(total)}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {wallets.isLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="h-28 animate-pulse rounded-xl border bg-muted/40"
                                />
                            ))}
                        </div>
                    ) : walletItems.length === 0 ? (
                        <div className="text-muted-foreground">Нет кошельков</div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {walletItems.map(w => {
                                const selected = walletFilter === w.id
                                const accent = w.color || 'hsl(var(--primary))'
                                return (
                                    <button
                                        key={w.id}
                                        type="button"
                                        onClick={() =>
                                            setWalletFilter(selected ? null : w.id)
                                        }
                                        className={`group relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md ${
                                            selected
                                                ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                                                : 'hover:border-foreground/20'
                                        }`}
                                    >
                                        <span
                                            className="absolute inset-y-0 left-0 w-1.5"
                                            style={{ backgroundColor: accent }}
                                        />
                                        <div className="flex items-start justify-between gap-2 pl-2">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">
                                                    {w.name}
                                                </div>
                                                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                    {w.product}
                                                </div>
                                            </div>
                                            {selected && (
                                                <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                                                    фильтр
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-baseline gap-1 pl-2">
                                            <span className="text-2xl font-semibold tabular-nums">
                                                {fmtAmount(w.balance)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {w.currency}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 pl-2 text-xs text-muted-foreground">
                                            <span>{w.tx_count} транз.</span>
                                            <span>·</span>
                                            <span>
                                                с{' '}
                                                {new Date(w.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-3">
                    <CardTitle>
                        История транзакций{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            (всего {txs.data?.total ?? 0})
                        </span>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        {activeWallet && (
                            <button
                                type="button"
                                onClick={() => setWalletFilter(null)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                            >
                                {activeWallet.name}
                                <span className="text-primary/60">✕</span>
                            </button>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                            {TX_TYPES.map(t => (
                                <Button
                                    key={t.value || 'all'}
                                    variant={txType === t.value ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8"
                                    onClick={() => setTxType(t.value)}
                                >
                                    {t.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {hasTotals && (
                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                                    <ArrowDownLeft className="h-4 w-4" /> Пополнения
                                    {activeWallet && (
                                        <span className="font-normal normal-case text-emerald-600/70 dark:text-emerald-400/70">
                                            · {activeWallet.name}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    {incomeTotals.length === 0 ? (
                                        <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">—</span>
                                    ) : (
                                        incomeTotals.map(([cur, val]) => (
                                            <span key={cur} className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                                                +{fmtAmount(val)}{' '}
                                                <span className="text-sm font-normal text-emerald-600/70 dark:text-emerald-400/70">{cur}</span>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-red-700 dark:text-red-400">
                                    <ArrowUpRight className="h-4 w-4" /> Расходы
                                    {activeWallet && (
                                        <span className="font-normal normal-case text-red-600/70 dark:text-red-400/70">
                                            · {activeWallet.name}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    {expenseTotals.length === 0 ? (
                                        <span className="text-lg font-semibold text-red-700 dark:text-red-400">—</span>
                                    ) : (
                                        expenseTotals.map(([cur, val]) => (
                                            <span key={cur} className="text-lg font-semibold tabular-nums text-red-700 dark:text-red-400">
                                                −{fmtAmount(val)}{' '}
                                                <span className="text-sm font-normal text-red-600/70 dark:text-red-400/70">{cur}</span>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {txs.isLoading ? (
                        <div>Загрузка…</div>
                    ) : txItems.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Нет транзакций
                        </div>
                    ) : (
                        <>
                            {/* Mobile: stacked list — readable without horizontal scroll */}
                            <ul className="divide-y md:hidden">
                                {txItems.map(t => {
                                    const m = txMeta(t.type, t.amount)
                                    return (
                                        <li
                                            key={t.id}
                                            className="flex items-center gap-3 py-3"
                                        >
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.iconCls}`}
                                            >
                                                <m.Icon className="h-4 w-4" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <span className="truncate text-sm font-medium">
                                                        {t.category_name ?? txTypeLabel(t.type)}
                                                    </span>
                                                    <span
                                                        className={`shrink-0 text-sm font-semibold tabular-nums ${m.cls}`}
                                                    >
                                                        {m.signed}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <span className="truncate">
                                                        {t.wallet_name ?? `#${t.wallet_id}`}
                                                    </span>
                                                    <span>·</span>
                                                    <span className="whitespace-nowrap">
                                                        {new Date(
                                                            t.date ?? t.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {t.description && (
                                                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                                        {t.description}
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>

                            {/* Desktop: full table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-44">Когда</TableHead>
                                            <TableHead className="w-28">Тип</TableHead>
                                            <TableHead className="w-36 text-right">
                                                Сумма
                                            </TableHead>
                                            <TableHead>Кошелёк</TableHead>
                                            <TableHead>Категория</TableHead>
                                            <TableHead>Описание</TableHead>
                                            <TableHead className="w-24">Продукт</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {txItems.map(t => {
                                            const m = txMeta(t.type, t.amount)
                                            return (
                                                <TableRow key={t.id}>
                                                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                        {new Date(
                                                            t.date ?? t.created_at,
                                                        ).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center gap-1.5 text-xs">
                                                            <span
                                                                className={`flex h-6 w-6 items-center justify-center rounded-full ${m.iconCls}`}
                                                            >
                                                                <m.Icon className="h-3.5 w-3.5" />
                                                            </span>
                                                            {txTypeLabel(t.type)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right tabular-nums font-semibold ${m.cls}`}
                                                    >
                                                        {m.signed}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {t.wallet_name ?? `#${t.wallet_id}`}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {t.category_name ?? '—'}
                                                    </TableCell>
                                                    <TableCell
                                                        className="max-w-[280px] truncate text-xs text-muted-foreground"
                                                        title={t.description ?? undefined}
                                                    >
                                                        {t.description ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                        {t.product}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                    {txs.data && txs.data.total > 0 && (
                        <Pagination
                            page={txs.data.page}
                            total={txs.data.total}
                            size={txs.data.size}
                            onPageChange={setTxPage}
                            onSizeChange={s => {
                                setTxSize(s)
                                setTxPage(1)
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
