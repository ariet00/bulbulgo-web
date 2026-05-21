'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'
import { DailyLine, ExpensesPie, MonthlyNetBar } from '@/components/Charts'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { useCategories, useDebts, useMe, useTransactions, useWallets } from '@/hooks/queries'
import { dailyIncomeExpense, expensesByCategory, monthlyNet } from '@/lib/aggregate'
import { resolveRange, type DateRange } from '@/lib/dateRange'
import { formatMoney } from '@/lib/format'
import type { Debt, Transaction, Wallet } from '@/types/akcha'

const WALLET_PALETTE = [
  '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899',
  '#14b8a6', '#ef4444', '#6366f1', '#84cc16', '#0ea5e9',
]

function walletColor(w: Wallet, idx: number): string {
  return w.color || WALLET_PALETTE[idx % WALLET_PALETTE.length]
}

function sum(items: Transaction[], type: 'income' | 'expense'): number {
  return items.filter(t => t.type === type).reduce((acc, t) => acc + t.amount, 0)
}

function debtNet(items: Debt[]): { iOwe: number; theyOwe: number; net: number } {
  let iOwe = 0
  let theyOwe = 0
  for (const d of items) {
    if (d.is_closed) continue
    if (d.type === 'i_owe') iOwe += d.amount
    else theyOwe += d.amount
  }
  return { iOwe, theyOwe, net: theyOwe - iOwe }
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const { data: me } = useMe()
  const { data: wallets = [] } = useWallets()
  const [range, setRange] = useState<DateRange>({ preset: 'd30' })
  const [walletId, setWalletId] = useState<number | 'all'>('all')
  const resolved = useMemo(() => resolveRange(range), [range])
  const walletFilter = walletId === 'all' ? {} : { wallet_id: walletId }
  const { data: rangeTx = [], isLoading } = useTransactions({ ...resolved, ...walletFilter, limit: 1000 })
  const sixMonthsAgo = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 5)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }, [])
  const { data: halfYearTx = [] } = useTransactions({ from: sixMonthsAgo, ...walletFilter, limit: 5000 })
  const { data: cats = [] } = useCategories()
  const { data: debts = [] } = useDebts()

  const income = useMemo(() => sum(rangeTx, 'income'), [rangeTx])
  const expense = useMemo(() => sum(rangeTx, 'expense'), [rangeTx])
  const { iOwe, theyOwe, net } = useMemo(() => debtNet(debts), [debts])
  const pieData = useMemo(() => expensesByCategory(rangeTx, cats), [rangeTx, cats])
  const lineData = useMemo(
    () => dailyIncomeExpense(rangeTx, resolved.from, resolved.to),
    [rangeTx, resolved],
  )
  const barData = useMemo(() => monthlyNet(halfYearTx, 6), [halfYearTx])

  const currency = me?.currency_code ?? 'KGS'

  const totalsByCurrency = useMemo(() => {
    const map = new Map<string, number>()
    for (const w of wallets) {
      const code = (w.currency ?? currency).toUpperCase()
      map.set(code, (map.get(code) ?? 0) + (w.balance ?? 0))
    }
    if (map.size === 0 && me?.default_wallet) {
      const code = (me.default_wallet.currency ?? currency).toUpperCase()
      map.set(code, me.default_wallet.balance ?? 0)
    }
    // Primary currency first, then by total desc.
    const primary = currency.toUpperCase()
    return [...map.entries()].sort((a, b) => {
      if (a[0] === primary) return -1
      if (b[0] === primary) return 1
      return b[1] - a[1]
    })
  }, [wallets, me, currency])

  const selectedWallet = walletId === 'all' ? null : wallets.find(w => w.id === walletId) ?? null

  const [primaryEntry, ...allOtherEntries] = totalsByCurrency
  // When a single wallet is selected, the balance card shows just that wallet.
  const primaryAmount = selectedWallet ? selectedWallet.balance ?? 0 : primaryEntry?.[1] ?? 0
  const primaryCode = selectedWallet
    ? (selectedWallet.currency ?? currency).toUpperCase()
    : primaryEntry?.[0] ?? currency
  const otherEntries = selectedWallet ? [] : allOtherEntries

  return (
    <div className="space-y-3">
      {/* Compact header: balance + period income/expense in one card */}
      <section className="rounded-2xl border bg-card p-3 shadow-sm">
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{t('balance')}</div>
            <div className="text-2xl font-bold truncate">{formatMoney(primaryAmount, primaryCode)}</div>
          </div>
          {otherEntries.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1">
              {otherEntries.map(([code, total]) => (
                <span key={code} className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {formatMoney(total, code)}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-2 text-sm">
          <span className="text-emerald-600 font-semibold">↑ {formatMoney(income, currency)}</span>
          <span className="text-rose-600 font-semibold">↓ {formatMoney(expense, currency)}</span>
        </div>
      </section>

      <DateRangeFilter value={range} onChange={setRange} />

      {wallets.length > 0 && (
        <select
          value={walletId}
          onChange={e => setWalletId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
        >
          <option value="all">{t('allWallets')}</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>
              {w.icon ? `${w.icon} ` : ''}{w.name}
            </option>
          ))}
        </select>
      )}

      {wallets.length > 0 && !selectedWallet && (
        <section className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {wallets.map((w, idx) => {
              const color = walletColor(w, idx)
              return (
                <Link
                  key={w.id}
                  href="/wallets"
                  className="shrink-0 w-36 rounded-xl border p-3 bg-card"
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div className="text-xl">{w.icon ?? '💵'}</div>
                  <div className="mt-1 text-sm font-medium truncate">{w.name}</div>
                  <div className="text-xs font-semibold" style={{ color }}>
                    {formatMoney(w.balance ?? 0, w.currency)}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground mb-2">{t('net_debt')}</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2">
            <div className="text-[11px] text-muted-foreground">🔺 {t('theyOwe')}</div>
            <div className="text-base font-semibold text-emerald-600">{formatMoney(theyOwe, currency)}</div>
          </div>
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-2">
            <div className="text-[11px] text-muted-foreground">🔻 {t('iOwe')}</div>
            <div className="text-base font-semibold text-rose-600">{formatMoney(iOwe, currency)}</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <span className="text-xs text-muted-foreground">{t('balanceLabel')}</span>
          <span className={`text-base font-semibold ${net < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {net >= 0 ? '+' : '−'}{formatMoney(Math.abs(net), currency)}
          </span>
        </div>
      </section>

      <section className="rounded-xl border p-3">
        <div className="text-sm font-medium mb-2">Расходы по категориям</div>
        <ExpensesPie data={pieData} />
      </section>

      <section className="rounded-xl border p-3">
        <div className="text-sm font-medium mb-2">Динамика</div>
        <DailyLine data={lineData} />
      </section>

      <section className="rounded-xl border p-3">
        <div className="text-sm font-medium mb-2">Чистый итог по месяцам</div>
        <MonthlyNetBar data={barData} />
      </section>

      {!isLoading && rangeTx.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground pt-6">{t('no_data')}</p>
      ) : null}
    </div>
  )
}
