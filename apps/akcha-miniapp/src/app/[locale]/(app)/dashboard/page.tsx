'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { DailyLine, ExpensesPie, MonthlyNetBar } from '@/components/Charts'
import { useCategories, useDebts, useMe, useTransactions } from '@/hooks/queries'
import { dailyIncomeExpense, expensesByCategory, monthlyNet } from '@/lib/aggregate'
import { formatMoney, startOfMonthIso } from '@/lib/format'
import type { Debt, Transaction } from '@/types/akcha'

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
  const { data: monthTx = [], isLoading } = useTransactions({ from: startOfMonthIso(), limit: 500 })
  const sixMonthsAgo = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 5)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }, [])
  const { data: halfYearTx = [] } = useTransactions({ from: sixMonthsAgo, limit: 5000 })
  const { data: cats = [] } = useCategories()
  const { data: debts = [] } = useDebts()

  const income = useMemo(() => sum(monthTx, 'income'), [monthTx])
  const expense = useMemo(() => sum(monthTx, 'expense'), [monthTx])
  const { iOwe, theyOwe, net } = useMemo(() => debtNet(debts), [debts])
  const pieData = useMemo(() => expensesByCategory(monthTx, cats), [monthTx, cats])
  const lineData = useMemo(() => dailyIncomeExpense(monthTx), [monthTx])
  const barData = useMemo(() => monthlyNet(halfYearTx, 6), [halfYearTx])

  const currency = me?.currency_code ?? 'KGS'
  const balance = me?.default_wallet?.balance ?? 0

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{me?.default_wallet?.name ?? 'Акча'}</h1>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="text-sm text-muted-foreground">{t('balance')}</div>
        <div className="mt-1 text-3xl font-bold">{formatMoney(balance, currency)}</div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground">{t('month_income')}</div>
          <div className="mt-1 text-lg font-semibold text-emerald-600">{formatMoney(income, currency)}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground">{t('month_expense')}</div>
          <div className="mt-1 text-lg font-semibold text-rose-600">{formatMoney(expense, currency)}</div>
        </div>
      </section>

      <section className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">{t('net_debt')}</div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-rose-600">−{formatMoney(iOwe, currency)}</span>
          <span className="text-emerald-600">+{formatMoney(theyOwe, currency)}</span>
        </div>
        <div className={`mt-1 text-lg font-semibold ${net < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {net >= 0 ? '+' : ''}{formatMoney(net, currency)}
        </div>
      </section>

      <section className="rounded-xl border p-3">
        <div className="text-sm font-medium mb-2">Расходы по категориям</div>
        <ExpensesPie data={pieData} />
      </section>

      <section className="rounded-xl border p-3">
        <div className="text-sm font-medium mb-2">Динамика за месяц</div>
        <DailyLine data={lineData} />
      </section>

      <section className="rounded-xl border p-3">
        <div className="text-sm font-medium mb-2">Чистый итог по месяцам</div>
        <MonthlyNetBar data={barData} />
      </section>

      {!isLoading && monthTx.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground pt-6">{t('no_data')}</p>
      ) : null}
    </div>
  )
}
