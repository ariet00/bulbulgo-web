'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2, Download } from 'lucide-react'

import { akchaApi } from '@/apis/akcha'
import { useCategories, useMe, useTransactions } from '@/hooks/queries'
import { useDeleteTransaction } from '@/hooks/mutations'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { TxType } from '@/types/akcha'

type Filter = 'all' | 'income' | 'expense'

export default function TransactionsPage() {
  const t = useTranslations('transactions')
  const { data: me } = useMe()
  const [filter, setFilter] = useState<Filter>('all')

  const { data: items = [], isLoading } = useTransactions({
    type: filter === 'all' ? undefined : filter,
    limit: 200,
  })
  const { data: cats = [] } = useCategories()
  const catMap = new Map(cats.map(c => [c.id, c]))

  const del = useDeleteTransaction()
  const currency = me?.currency_code ?? 'KGS'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <div className="flex items-center gap-3 text-sm">
          <a
            href={akchaApi.exportTransactionsUrl({ format: 'csv', type: filter === 'all' ? undefined : filter })}
            className="flex items-center gap-1 text-primary"
          >
            <Download size={14} /> CSV
          </a>
          <a
            href={akchaApi.exportTransactionsUrl({ format: 'xlsx', type: filter === 'all' ? undefined : filter })}
            className="flex items-center gap-1 text-primary"
          >
            <Download size={14} /> XLSX
          </a>
        </div>
      </div>

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

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground py-6">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">{t('empty')}</p>
      ) : (
        <ul className="divide-y border rounded-xl">
          {items.map(tx => {
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
      )}
    </div>
  )
}
