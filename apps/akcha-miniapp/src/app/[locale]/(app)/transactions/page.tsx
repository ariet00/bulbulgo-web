'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'

import { DateRangeFilter } from '@/components/DateRangeFilter'
import { useCategories, useMe, useTransactions } from '@/hooks/queries'
import { useDeleteTransaction } from '@/hooks/mutations'
import { groupByDate } from '@/lib/aggregate'
import { resolveRange, type DateRange } from '@/lib/dateRange'
import { formatDayHeader, formatDateTime, formatMoney } from '@/lib/format'

type Filter = 'all' | 'income' | 'expense'

export default function TransactionsPage() {
  const t = useTranslations('transactions')
  const { data: me } = useMe()
  const [filter, setFilter] = useState<Filter>('all')
  const [range, setRange] = useState<DateRange>({ preset: 'd30' })
  const [categoryId, setCategoryId] = useState<number | 'all'>('all')

  const resolved = useMemo(() => resolveRange(range), [range])
  const { data: items = [], isLoading } = useTransactions({
    type: filter === 'all' ? undefined : filter,
    category_id: categoryId === 'all' ? undefined : categoryId,
    ...resolved,
    limit: 500,
  })
  const { data: cats = [] } = useCategories()
  const catMap = new Map(cats.map(c => [c.id, c]))
  const groups = useMemo(() => groupByDate(items), [items])

  const del = useDeleteTransaction()
  const currency = me?.currency_code ?? 'KGS'

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{t('title')}</h1>

      <DateRangeFilter value={range} onChange={setRange} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'income', 'expense'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
              filter === key ? 'bg-primary text-primary-foreground' : 'bg-background'
            }`}
          >
            {t(`filters.${key}`)}
          </button>
        ))}
      </div>

      {cats.length > 0 && (
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
        >
          <option value="all">{t('allCategories')}</option>
          {cats
            .filter(c => filter === 'all' || c.type === filter)
            .map(c => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}{c.name}
              </option>
            ))}
        </select>
      )}

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground py-6">Загрузка…</p>
      ) : groups.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">{t('empty')}</p>
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.date}>
              <div className="px-1 pb-1 text-xs font-medium text-muted-foreground">
                {formatDayHeader(group.date)}
              </div>
              <ul className="divide-y border rounded-xl">
                {group.items.map(tx => {
                  const cat = tx.category_id ? catMap.get(tx.category_id) : null
                  const sign = tx.type === 'expense' ? '−' : '+'
                  const color = tx.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                  return (
                    <li key={tx.id} className="flex items-center gap-3 p-3">
                      <div className="text-2xl">{cat?.icon ?? '💸'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {cat?.name ?? (tx.type === 'expense' ? 'Расход' : 'Доход')}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {tx.description ?? ''} · {formatDateTime(tx.date)}
                        </div>
                      </div>
                      <div className={`font-semibold ${color}`}>
                        {sign}{formatMoney(tx.amount, currency)}
                      </div>
                      <button
                        onClick={() => del.mutate(tx.id)}
                        disabled={del.isPending}
                        className="text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
